"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { THEMES, ThemeConfig } from "@/lib/themes";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Check,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Copy,
  Layers,
  Palette,
} from "lucide-react";

export default function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const siteId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"general" | "hero" | "features" | "showcase" | "contact">("hero");

  // Site Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("landing");
  const [theme, setTheme] = useState("modern");
  const [isPublished, setIsPublished] = useState(true);
  const [views, setViews] = useState(0);

  // Content Blocks
  const [content, setContent] = useState<any>({
    hero: {
      badge: "✨ New Release",
      headline: "Crafting Remarkable Digital Solutions",
      subheadline: "Empowering teams to ship with speed and design elegance.",
      ctaText: "Get Started",
      ctaLink: "#contact",
      secondaryCtaText: "Learn More",
      secondaryCtaLink: "#features",
    },
    about: {
      title: "About Our Mission",
      bio: "We believe in ultra-fast, user-friendly software that transforms how people interact with technology.",
      highlights: ["Speed & Polish", "PostgreSQL Reliability", "Google Integration"],
    },
    features: [
      { icon: "Zap", title: "Ultra Performance", description: "Sub-millisecond responses and global cache distribution." },
      { icon: "Shield", title: "Enterprise Security", description: "Google OAuth 2.0 authentication and data encryption." },
      { icon: "Globe", title: "Instant Publishing", description: "One-click deployment to custom domains." },
    ],
    showcase: [
      { title: "Core Platform", desc: "Flagship system powering thousands of teams.", tag: "Next.js", link: "#" },
      { title: "Mobile Framework", desc: "Native-grade cross platform application toolkit.", tag: "React", link: "#" },
    ],
    social: {
      twitter: "",
      github: "",
      linkedin: "",
      email: "",
    },
    contact: {
      heading: "Ready to work together?",
      email: "hello@example.com",
      buttonText: "Get in Touch",
    },
  });

  useEffect(() => {
    async function loadSite() {
      try {
        const res = await fetch(`/api/sites/${siteId}`);
        const data = await res.json();
        if (!res.ok || !data.site) {
          setError("Site not found");
          return;
        }

        const s = data.site;
        setTitle(s.title);
        setSlug(s.slug);
        setTagline(s.tagline || "");
        setCategory(s.category);
        setTheme(s.theme);
        setIsPublished(s.isPublished);
        setViews(s.views || 0);

        if (s.content) {
          try {
            const parsed = typeof s.content === "string" ? JSON.parse(s.content) : s.content;
            setContent((prev: any) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error("Failed to parse content json", e);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load website");
      } finally {
        setLoading(false);
      }
    }

    loadSite();
  }, [siteId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          tagline,
          category,
          theme,
          content,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update website");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: string, val: string) => {
    setContent((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [field]: val },
    }));
  };

  const updateContact = (field: string, val: string) => {
    setContent((prev: any) => ({
      ...prev,
      contact: { ...prev.contact, [field]: val },
    }));
  };

  const updateFeature = (index: number, field: string, val: string) => {
    const next = [...(content.features || [])];
    if (next[index]) {
      next[index] = { ...next[index], [field]: val };
      setContent((prev: any) => ({ ...prev, features: next }));
    }
  };

  const addFeature = () => {
    setContent((prev: any) => ({
      ...prev,
      features: [
        ...(prev.features || []),
        { icon: "Sparkles", title: "New Feature", description: "Describe this feature or capability in detail." },
      ],
    }));
  };

  const removeFeature = (index: number) => {
    setContent((prev: any) => ({
      ...prev,
      features: prev.features.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateShowcase = (index: number, field: string, val: string) => {
    const next = [...(content.showcase || [])];
    if (next[index]) {
      next[index] = { ...next[index], [field]: val };
      setContent((prev: any) => ({ ...prev, showcase: next }));
    }
  };

  const addShowcaseItem = () => {
    setContent((prev: any) => ({
      ...prev,
      showcase: [
        ...(prev.showcase || []),
        { title: "Project Item", desc: "Brief description of the work or deliverable.", tag: "Product", link: "#" },
      ],
    }));
  };

  const removeShowcaseItem = (index: number) => {
    setContent((prev: any) => ({
      ...prev,
      showcase: prev.showcase.filter((_: any, i: number) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  const selectedTheme: ThemeConfig = THEMES[theme] || THEMES.modern;
  const liveUrl = `/site/${slug}`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Editor Sub-Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-xs">{title}</span>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                    isPublished ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {isPublished ? "Published Live" : "Draft Mode"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">/site/{slug}</p>
            </div>
          </div>

          {/* Viewport Switcher */}
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewport === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewport === "tablet" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Tablet View"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewport === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href={liveUrl}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Live</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Config Panel */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-[#090e1a] p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-60px)]">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6 text-xs">
            {(
              [
                { id: "hero", label: "Hero Banner" },
                { id: "features", label: "Features" },
                { id: "showcase", label: "Showcase" },
                { id: "contact", label: "Contact & Bio" },
                { id: "general", label: "Theme & Meta" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 min-w-[70px] rounded-lg py-1.5 px-2 font-medium transition-all ${
                  activeTab === t.id
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Hero Banner */}
          {activeTab === "hero" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Announcement Badge
                </label>
                <input
                  type="text"
                  value={content.hero?.badge || ""}
                  onChange={(e) => updateHero("badge", e.target.value)}
                  placeholder="e.g. ⚡ Available for new roles"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Main Headline
                </label>
                <textarea
                  rows={2}
                  value={content.hero?.headline || ""}
                  onChange={(e) => updateHero("headline", e.target.value)}
                  placeholder="Your compelling site title"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Subheadline / Paragraph
                </label>
                <textarea
                  rows={3}
                  value={content.hero?.subheadline || ""}
                  onChange={(e) => updateHero("subheadline", e.target.value)}
                  placeholder="Explain what you offer or who you are..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={content.hero?.ctaText || ""}
                    onChange={(e) => updateHero("ctaText", e.target.value)}
                    placeholder="e.g. Get Started Free"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={content.hero?.ctaLink || ""}
                    onChange={(e) => updateHero("ctaLink", e.target.value)}
                    placeholder="#contact"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    value={content.hero?.secondaryCtaText || ""}
                    onChange={(e) => updateHero("secondaryCtaText", e.target.value)}
                    placeholder="e.g. View Showcase"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    value={content.hero?.secondaryCtaLink || ""}
                    onChange={(e) => updateHero("secondaryCtaLink", e.target.value)}
                    placeholder="#features"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Features */}
          {activeTab === "features" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Feature Cards ({content.features?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Feature
                </button>
              </div>

              {content.features?.map((f: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Item #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={f.title || ""}
                    onChange={(e) => updateFeature(i, "title", e.target.value)}
                    placeholder="Feature Title"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={f.description || ""}
                    onChange={(e) => updateFeature(i, "description", e.target.value)}
                    placeholder="Feature Description"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Showcase */}
          {activeTab === "showcase" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Showcase & Work Items ({content.showcase?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={addShowcaseItem}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>

              {content.showcase?.map((item: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Project #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeShowcaseItem(i)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => updateShowcase(i, "title", e.target.value)}
                      placeholder="Title"
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={item.tag || ""}
                      onChange={(e) => updateShowcase(i, "tag", e.target.value)}
                      placeholder="Tag (e.g. Next.js, Case Study)"
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-indigo-300"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={item.desc || ""}
                    onChange={(e) => updateShowcase(i, "desc", e.target.value)}
                    placeholder="Short description of this project or link"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
                  />
                  <input
                    type="text"
                    value={item.link || ""}
                    onChange={(e) => updateShowcase(i, "link", e.target.value)}
                    placeholder="External link URL (e.g. https://...)"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 font-mono"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Contact & Bio */}
          {activeTab === "contact" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Contact Section Heading
                </label>
                <input
                  type="text"
                  value={content.contact?.heading || ""}
                  onChange={(e) => updateContact("heading", e.target.value)}
                  placeholder="Ready to collaborate?"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={content.contact?.email || ""}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  About Story / Mission
                </label>
                <textarea
                  rows={3}
                  value={content.about?.bio || ""}
                  onChange={(e) =>
                    setContent((prev: any) => ({
                      ...prev,
                      about: { ...prev.about, bio: e.target.value },
                    }))
                  }
                  placeholder="Your story or value proposition..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300"
                />
              </div>
            </div>
          )}

          {/* TAB 5: General & Theme */}
          {activeTab === "general" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Website Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              {/* Publishing Status Toggle */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Public Visibility</span>
                    <span className="text-[11px] text-slate-400">
                      When enabled, anyone on the internet can view your website at /site/{slug}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isPublished ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isPublished ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Themes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Select Theme Palette
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.values(THEMES).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        theme === th.id
                          ? "border-indigo-500 bg-slate-800/90 ring-1 ring-indigo-500"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-3.5 w-3.5 rounded-full bg-gradient-to-tr ${th.previewClass}`} />
                        <span className="text-xs font-bold text-white truncate">{th.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-7 bg-[#050811] p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto">
          <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Live Website Preview (Theme: {selectedTheme.name})</span>
          </div>

          <div
            className={`w-full transition-all duration-300 rounded-3xl border shadow-2xl overflow-hidden ${
              selectedTheme.bg
            } ${selectedTheme.text} ${
              viewport === "mobile"
                ? "max-w-[375px]"
                : viewport === "tablet"
                ? "max-w-[640px]"
                : "max-w-4xl"
            }`}
            style={{ minHeight: "560px" }}
          >
            {/* Mock Site Navbar */}
            <div className={`px-6 py-4 flex items-center justify-between border-b ${selectedTheme.cardBorder}`}>
              <div className="font-bold text-base tracking-tight flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span>{title || "Your Site"}</span>
              </div>
              <div className="text-xs font-medium opacity-80 flex items-center gap-4">
                <span className="hidden sm:inline">Features</span>
                <span className="hidden sm:inline">Showcase</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedTheme.primaryButton}`}>
                  Contact
                </span>
              </div>
            </div>

            {/* Mock Hero */}
            <div className="px-6 py-12 text-center max-w-2xl mx-auto space-y-4">
              {content.hero?.badge && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${selectedTheme.badgeBg}`}>
                  {content.hero.badge}
                </span>
              )}

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {content.hero?.headline || "Your Compelling Headline"}
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed ${selectedTheme.textMuted}`}>
                {content.hero?.subheadline || "Your description and value proposition will appear right here."}
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {content.hero?.ctaText && (
                  <button type="button" className={`px-5 py-2.5 rounded-xl text-xs font-bold ${selectedTheme.primaryButton}`}>
                    {content.hero.ctaText}
                  </button>
                )}
                {content.hero?.secondaryCtaText && (
                  <button type="button" className={`px-5 py-2.5 rounded-xl text-xs font-semibold ${selectedTheme.secondaryButton}`}>
                    {content.hero.secondaryCtaText}
                  </button>
                )}
              </div>
            </div>

            {/* Mock Features */}
            {content.features?.length > 0 && (
              <div className="px-6 py-8 border-t border-slate-800/40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {content.features.map((f: any, i: number) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border ${selectedTheme.cardBg} ${selectedTheme.cardBorder}`}
                    >
                      <div className="font-bold text-sm mb-1">{f.title || `Feature ${i + 1}`}</div>
                      <div className={`text-xs ${selectedTheme.textMuted}`}>
                        {f.description || "Details about this offering."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mock Showcase */}
            {content.showcase?.length > 0 && (
              <div className="px-6 py-8 border-t border-slate-800/40">
                <div className="text-xs font-bold uppercase tracking-wider mb-4 opacity-70">
                  Featured Highlights
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.showcase.map((item: any, i: number) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border ${selectedTheme.cardBg} ${selectedTheme.cardBorder}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{item.title}</span>
                        {item.tag && (
                          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${selectedTheme.textMuted}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mock Footer */}
            <div className={`px-6 py-6 border-t ${selectedTheme.cardBorder} text-center text-xs opacity-60`}>
              Published with SiteForge • Connected Google Account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
