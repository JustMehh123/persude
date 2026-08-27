"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Globe,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Trash2,
  Edit,
  Sparkles,
  ShieldCheck,
  Layers,
  BarChart2,
  Calendar,
  AlertCircle,
  Code,
  Laptop,
} from "lucide-react";
import { THEMES } from "@/lib/themes";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  image: string;
  googleId: string;
  role: string;
  createdAt: string;
}

interface SiteItem {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  theme: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [creatingQuick, setCreatingQuick] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (!userData.authenticated || !userData.user) {
          router.push("/login");
          return;
        }

        setUser(userData.user);

        const sitesRes = await fetch("/api/sites");
        const sitesData = await sitesRes.json();
        setSites(sitesData.sites || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleCopyLink = (site: SiteItem) => {
    const fullUrl = `${window.location.origin}/site/${site.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(site.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTogglePublish = async (site: SiteItem) => {
    setTogglingId(site.id);
    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !site.isPublished }),
      });
      const data = await res.json();
      if (res.ok && data.site) {
        setSites(sites.map((s) => (s.id === site.id ? data.site : s)));
      }
    } catch (err) {
      console.error("Toggle publish failed:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (siteId: number) => {
    if (!confirm("Are you sure you want to delete this website? This action cannot be undone.")) {
      return;
    }

    setDeletingId(siteId);
    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      if (res.ok) {
        setSites(sites.filter((s) => s.id !== siteId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickCreate = async (category: string, titlePrefix: string) => {
    setCreatingQuick(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${titlePrefix} by ${user?.name || "Me"}`,
          category,
          theme: category === "portfolio" ? "cyberpunk" : "modern",
        }),
      });

      const data = await res.json();
      if (res.ok && data.site) {
        router.push(`/dashboard/sites/${data.site.id}/edit`);
      }
    } catch (err) {
      console.error("Quick create failed:", err);
    } finally {
      setCreatingQuick(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-slate-400">Loading your Google Workspace & Websites...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalViews = sites.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const publishedSitesCount = sites.filter((s) => s.isPublished).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* User Google Welcome Banner */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative">
                <img
                  src={user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`}
                  alt={user?.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {user?.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Google Account Active
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <span>{user?.email}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500">PostgreSQL Session Verified</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/sites/new"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Website</span>
              </Link>
              <Link
                href="/dashboard/google-setup"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>Google & Deploy Setup</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Published Sites</span>
              <Globe className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{publishedSitesCount}</span>
              <span className="text-xs text-slate-400">of {sites.length} total</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Total Visitor Views</span>
              <Eye className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{totalViews.toLocaleString()}</span>
              <span className="text-xs text-emerald-400">tracked in Postgres</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Google Identity</span>
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-white truncate">{user?.email.split("@")[0]}</div>
              <div className="text-xs text-slate-400">Google OAuth 2.0 Ready</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>PostgreSQL Status</span>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-white">Connected & Healthy</div>
              <div className="text-xs text-slate-400">Drizzle ORM v0.45</div>
            </div>
          </div>
        </div>

        {/* Sites Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your Published Websites</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Websites deployed under your Google account. Anyone can visit them using the public link.
              </p>
            </div>

            <Link
              href="/dashboard/sites/new"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Site
            </Link>
          </div>

          {sites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 sm:p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
                <Laptop className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No websites published yet</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
                Now that you&apos;re signed in with your Google account, launch your first website in seconds using our pre-built themes!
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickCreate("landing", "SaaS Cloud")}
                  disabled={creatingQuick}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  🚀 Launch Startup Landing Page
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCreate("portfolio", "Creator Portfolio")}
                  disabled={creatingQuick}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  🎨 Launch Designer Portfolio
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => {
                const themeInfo = THEMES[site.theme] || THEMES.modern;
                const publicUrl = `/site/${site.slug}`;

                return (
                  <div
                    key={site.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md transition-all hover:border-slate-700 hover:shadow-slate-900/50"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wide border border-slate-700">
                          {site.category}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(site)}
                            disabled={togglingId === site.id}
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                              site.isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                site.isPublished ? "bg-emerald-400" : "bg-amber-400"
                              }`}
                            />
                            {site.isPublished ? "Live on Web" : "Draft (Hidden)"}
                          </button>
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                        {site.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {site.tagline || site.description || "Custom published site."}
                      </p>

                      {/* Theme indicator & stats */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-3 w-3 rounded-full bg-gradient-to-tr ${themeInfo.previewClass}`}
                          />
                          <span className="capitalize">{themeInfo.name}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-300 font-medium">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>{site.views} views</span>
                        </div>
                      </div>

                      {/* Public URL Box */}
                      <div className="mt-3 rounded-xl bg-slate-950/70 border border-slate-800 p-2 text-xs flex items-center justify-between gap-2">
                        <span className="font-mono text-slate-300 truncate text-[11px]">
                          /site/{site.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(site)}
                          className="shrink-0 flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-700 transition-colors"
                          title="Copy full public URL"
                        >
                          {copiedId === site.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-400" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex items-center gap-2 pt-2 border-t border-slate-800">
                      <Link
                        href={publicUrl}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 shadow hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Live</span>
                      </Link>

                      <Link
                        href={`/dashboard/sites/${site.id}/edit`}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                        title="Edit website layout & content"
                      >
                        <Edit className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(site.id)}
                        disabled={deletingId === site.id}
                        className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-xs text-rose-400 hover:border-rose-800 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        title="Delete website"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
