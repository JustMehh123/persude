/**
 * Client-side document text extractor.
 *
 * Supports PDF (via pdfjs-dist), DOCX (via mammoth), and plain
 * text / markdown files (including Google Docs ".txt" exports).
 * Everything runs in the browser — no file ever leaves the device.
 */

export type ParsedSourceType = "pdf" | "docx" | "text";

export interface ParsedDocument {
  text: string;
  sourceType: ParsedSourceType;
  name: string;
  pageOrSectionCount: number;
  warnings: string[];
}

const PDF_MIME_TYPES = new Set(["application/pdf"]);
const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "text", "rtf", "csv"]);

export class DocumentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentParseError";
  }
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() ?? "").toLowerCase();
}

function detectSourceType(file: File): ParsedSourceType {
  const ext = getExtension(file.name);

  if (PDF_MIME_TYPES.has(file.type) || ext === "pdf") {
    return "pdf";
  }
  if (DOCX_MIME_TYPES.has(file.type) || ext === "docx") {
    return "docx";
  }
  if (ext === "doc") {
    // Legacy binary .doc is not reliably parseable client-side; treat as text
    // best-effort so the app never hard-fails on an upload.
    return "text";
  }
  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith("text/") || file.type === "") {
    return "text";
  }
  // Default to text extraction attempt rather than rejecting outright.
  return "text";
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Normalize whitespace produced by extraction (stray line breaks inside
 * sentences, repeated blank lines, non-breaking spaces, etc.) so downstream
 * style analysis sees clean prose.
 */
export function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import("pdfjs-dist");
  // pdfjs-dist ships an ES module worker; resolving it relative to the
  // installed package lets Next.js's bundler fingerprint and serve it.
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buffer = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
    page.cleanup();
  }
  const pageCount = pdf.numPages;
  await loadingTask.destroy();

  return { text: pageTexts.join("\n\n"), pages: pageCount };
}

async function extractDocxText(file: File): Promise<{ text: string; warnings: string[] }> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await readFileAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const warnings = result.messages
    .filter((message) => message.type === "warning" || message.type === "error")
    .map((message) => message.message);
  return { text: result.value, warnings };
}

/**
 * Extract plain text from a File. Handles PDF, DOCX, and text-like files
 * (.txt, .md exported from Google Docs/Notes, etc). Throws
 * `DocumentParseError` for unreadable/corrupt files.
 */
export async function extractTextFromFile(file: File): Promise<ParsedDocument> {
  const sourceType = detectSourceType(file);
  const warnings: string[] = [];

  try {
    if (sourceType === "pdf") {
      const { text, pages } = await extractPdfText(file);
      const normalized = normalizeExtractedText(text);
      if (!normalized) {
        warnings.push(
          "No selectable text was found in this PDF. Scanned/image-only PDFs cannot be parsed client-side.",
        );
      }
      return {
        text: normalized,
        sourceType,
        name: file.name,
        pageOrSectionCount: pages,
        warnings,
      };
    }

    if (sourceType === "docx") {
      const { text, warnings: docxWarnings } = await extractDocxText(file);
      const normalized = normalizeExtractedText(text);
      return {
        text: normalized,
        sourceType,
        name: file.name,
        pageOrSectionCount: normalized.split(/\n{2,}/).filter(Boolean).length,
        warnings: [...warnings, ...docxWarnings],
      };
    }

    // Plain text / markdown / unknown fallback.
    const raw = await readFileAsText(file);
    const normalized = normalizeExtractedText(raw);
    return {
      text: normalized,
      sourceType: "text",
      name: file.name,
      pageOrSectionCount: normalized.split(/\n{2,}/).filter(Boolean).length,
      warnings,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown parsing error";
    throw new DocumentParseError(`Could not extract text from "${file.name}": ${reason}`);
  }
}

/** Extract text from several files in parallel, tolerating individual failures. */
export async function extractTextFromFiles(
  files: File[],
): Promise<{ successes: ParsedDocument[]; failures: { name: string; error: string }[] }> {
  const results = await Promise.allSettled(files.map((file) => extractTextFromFile(file)));
  const successes: ParsedDocument[] = [];
  const failures: { name: string; error: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successes.push(result.value);
    } else {
      failures.push({
        name: files[index]?.name ?? "unknown file",
        error: result.reason instanceof Error ? result.reason.message : "Unknown parsing error",
      });
    }
  });

  return { successes, failures };
}

/** File extensions this parser can meaningfully handle, for input `accept`. */
export const SUPPORTED_UPLOAD_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".md",
  ".markdown",
  ".rtf",
];
