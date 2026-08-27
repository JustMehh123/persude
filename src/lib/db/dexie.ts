/**
 * Local, private persistence layer using IndexedDB via Dexie.js.
 *
 * Nothing here ever touches a network request — writing samples, pitch
 * requests, style profiles, and generated pitches all stay on-device.
 */
import Dexie, { type Table } from "dexie";
import type { GeneratedPitch, PitchRequest, WritingSample, WritingStyleProfile } from "@/lib/types";

export class PersuadeAIDatabase extends Dexie {
  writingSamples!: Table<WritingSample, string>;
  styleProfiles!: Table<WritingStyleProfile, string>;
  pitchRequests!: Table<PitchRequest, string>;
  generatedPitches!: Table<GeneratedPitch, string>;

  constructor() {
    super("persuadeai");
    this.version(1).stores({
      writingSamples: "id, name, sourceType, createdAt",
      styleProfiles: "id, sampleId, createdAt",
      pitchRequests: "id, strategy, tone, createdAt, updatedAt",
      generatedPitches: "id, requestId, strategy, createdAt",
    });
  }
}

let dbInstance: PersuadeAIDatabase | null = null;

/**
 * Lazily construct the Dexie database. Guards against SSR/server-side
 * evaluation, since IndexedDB only exists in the browser.
 */
export function getDb(): PersuadeAIDatabase {
  if (typeof window === "undefined") {
    throw new Error("PersuadeAI's local database is only available in the browser.");
  }
  if (!dbInstance) {
    dbInstance = new PersuadeAIDatabase();
  }
  return dbInstance;
}

export async function saveWritingSample(sample: WritingSample): Promise<void> {
  await getDb().writingSamples.put(sample);
}

export async function deleteWritingSample(id: string): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.writingSamples, db.styleProfiles, async () => {
    await db.writingSamples.delete(id);
    await db.styleProfiles.where("sampleId").equals(id).delete();
  });
}

export async function listWritingSamples(): Promise<WritingSample[]> {
  return getDb().writingSamples.orderBy("createdAt").reverse().toArray();
}

export async function saveStyleProfile(profile: WritingStyleProfile): Promise<void> {
  await getDb().styleProfiles.put(profile);
}

export async function listStyleProfiles(): Promise<WritingStyleProfile[]> {
  return getDb().styleProfiles.orderBy("createdAt").reverse().toArray();
}

export async function savePitchRequest(request: PitchRequest): Promise<void> {
  await getDb().pitchRequests.put(request);
}

export async function listPitchRequests(): Promise<PitchRequest[]> {
  return getDb().pitchRequests.orderBy("updatedAt").reverse().toArray();
}

export async function deletePitchRequest(id: string): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.pitchRequests, db.generatedPitches, async () => {
    await db.pitchRequests.delete(id);
    await db.generatedPitches.where("requestId").equals(id).delete();
  });
}

export async function saveGeneratedPitch(pitch: GeneratedPitch): Promise<void> {
  await getDb().generatedPitches.put(pitch);
}

export async function listGeneratedPitches(): Promise<GeneratedPitch[]> {
  return getDb().generatedPitches.orderBy("createdAt").reverse().toArray();
}

export async function getGeneratedPitchByRequestId(requestId: string): Promise<GeneratedPitch | undefined> {
  return getDb().generatedPitches.where("requestId").equals(requestId).last();
}

export async function clearAllLocalData(): Promise<void> {
  const db = getDb();
  await db.transaction(
    "rw",
    db.writingSamples,
    db.styleProfiles,
    db.pitchRequests,
    db.generatedPitches,
    async () => {
      await Promise.all([
        db.writingSamples.clear(),
        db.styleProfiles.clear(),
        db.pitchRequests.clear(),
        db.generatedPitches.clear(),
      ]);
    },
  );
}
