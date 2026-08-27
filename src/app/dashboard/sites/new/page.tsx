"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { THEMES } from "@/lib/themes";
import {
  Globe,
  ArrowLeft,
  Sparkles,
  Layers,
  Palette,
  Check,
  Rocket,
  ShieldCheck,
} from "lucide-react";

export default function NewSitePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("landing");
  const [theme, setTheme] = useState("modern");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title for your website");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          tagline: tagline.trim() || undefined,
          category,
          theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create site");
      }

      router.push(`/dashboard/sites/${data.site.id}/edit`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 mb-3">
              <Rocket className="h-3.5 w-3.5" />
              Website Publisher
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Create a New Website</h1>
            <p className="text-sm text-slate-400 mt-1">
              Your website will be published instantly under your Google account and live for the world to see.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Website Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Analytics Studio"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  URL Slug (Live Link)
                </label>
                <div className="flex rounded-xl border border-slate-700 bg-slate-950/80 overflow-hidden focus-within:border-indigo-500">
                  <span className="bg-slate-900 px-3 py-2.5 text-xs text-slate-400 border-r border-slate-800 font-mono">
                    /site/
                  </span>
                  <input
                    type="text"
                    placeholder="apex-analytics"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. High-performance event ingestion & automated insights"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Website Purpose & Layout
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "landing", label: "Startup Landing", desc: "Hero, features & CTA" },
                  { id: "portfolio", label: "Creator Portfolio", desc: "Bio, works & showcase" },
                  { id: "business", label: "Agency & Business", desc: "Services & case studies" },
                  { id: "bio", label: "Link-In-Bio Hub", desc: "Links, socials & contact" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      category === item.id
                        ? "border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Color Palette & Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(THEMES).map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setTheme(th.id)}
                    className={`relative rounded-xl border p-3 text-left transition-all ${
                      theme === th.id
                        ? "border-indigo-500 bg-slate-800/80 ring-2 ring-indigo-500/50"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`h-4 w-4 rounded-full bg-gradient-to-tr ${th.previewClass} shadow-sm`}
                      />
                      <span className="text-xs font-bold text-white">{th.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                      {th.description}
                    </p>
                    {theme === th.id && (
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-indigo-500 p-0.5 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Will be published live under your verified Google identity</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating Website...</span>
                ) : (
                  <>
                    <span>Create & Open Editor</span>
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
