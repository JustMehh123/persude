"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { THEMES } from "@/lib/themes";
import {
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  BarChart2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Palette,
  Laptop,
  Code2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

interface ShowcaseSite {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  theme: string;
  views: number;
  authorName: string;
  authorImage: string;
}

export default function HomePage() {
  const [showcaseSites, setShowcaseSites] = useState<ShowcaseSite[]>([]);
  const [loadingShowcase, setLoadingShowcase] = useState(true);
  const [previewTheme, setPreviewTheme] = useState("modern");

  useEffect(() => {
    fetch("/api/sites?public=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.sites) {
          setShowcaseSites(data.sites);
        }
      })
      .catch((err) => console.error("Error loading showcase:", err))
      .finally(() => setLoadingShowcase(false));
  }, []);

  const activeThemeObj = THEMES[previewTheme] || THEMES.modern;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Account Authentication & Instant Web Publisher</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Put in your Google Account.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Publish an Actual Website.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect your Google account, pick from modern designer themes, customize your content blocks, and launch your site live to the web in seconds with PostgreSQL persistence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-xl shadow-white/10 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
            >
              {/* Google G Logo SVG */}
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              <span>Get Started with Google</span>
            </Link>

            <a
              href="#showcase"
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 backdrop-blur-md transition-all hover:bg-slate-800 hover:scale-105 active:scale-95"
            >
              <span>Explore Live Sites</span>
              <ArrowRight className="h-4 w-4 text-indigo-400" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Google OAuth 2.0 & Direct Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Instant Live Links (/site/[slug])</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span>PostgreSQL Persistent Database</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE LIVE PREVIEW TEASER */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 px-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  https://yourdomain.com/site/my-awesome-startup
                </span>
              </div>

              {/* Theme Switcher in Teaser */}
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Theme:</span>
                {["modern", "minimal", "cyberpunk", "ocean"].map((tKey) => (
                  <button
                    key={tKey}
                    onClick={() => setPreviewTheme(tKey)}
                    className={`h-5 w-5 rounded-full bg-gradient-to-tr ${THEMES[tKey].previewClass} transition-transform ${
                      previewTheme === tKey ? "ring-2 ring-indigo-400 scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                    title={THEMES[tKey].name}
                  />
                ))}
              </div>
            </div>

            {/* Inner Live Site Window */}
            <div
              className={`mt-3 rounded-2xl p-6 sm:p-10 transition-all duration-300 ${activeThemeObj.bg} ${activeThemeObj.text}`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-6">
                <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  <span>Apex Cloud Systems</span>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Published Live
                </div>
              </div>

              <div className="text-center max-w-xl mx-auto space-y-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${activeThemeObj.badgeBg}`}>
                  ✨ Built with Google Account Integration
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  High-Performance Stream Pipelines
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${activeThemeObj.textMuted}`}>
                  Connect data sources in under 5 minutes and deploy real-time aggregations globally.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button className={`px-4 py-2 rounded-xl text-xs font-bold ${activeThemeObj.primaryButton}`}>
                    Explore Platform
                  </button>
                  <button className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeThemeObj.secondaryButton}`}>
                    Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section id="showcase" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Live Showcase
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Websites Published with SiteForge
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                Real websites created and published by users signed in with their Google accounts.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              <span>Publish Your Website Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingShowcase ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseSites.map((site) => {
                const themeInfo = THEMES[site.theme] || THEMES.modern;
                return (
                  <div
                    key={site.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10"
                  >
                    <div>
                      {/* Author Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              site.authorImage ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(site.authorName)}`
                            }
                            alt={site.authorName}
                            className="h-8 w-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-semibold text-slate-200 block">{site.authorName}</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Google Account
                            </span>
                          </div>
                        </div>

                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase">
                          {site.category}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{site.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {site.tagline || site.description}
                      </p>

                      {/* Theme and Stats */}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-3 w-3 rounded-full bg-gradient-to-tr ${themeInfo.previewClass}`} />
                          <span className="text-[11px]">{themeInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Eye className="h-3 w-3 text-slate-400" />
                          <span>{site.views} views</span>
                        </div>
                      </div>
                    </div>

                    {/* View Live Link */}
                    <div className="mt-5 pt-3 border-t border-slate-800">
                      <Link
                        href={`/site/${site.slug}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-slate-100 transition-all active:scale-95"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Visit Live Website</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              How to Put Your Google Account in & Publish
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From authentication to live worldwide hosting in three seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-6 font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Google Account</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Log in via standard Google OAuth 2.0 or direct Google email. Your session is securely maintained in PostgreSQL with automatic cookie management.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 mb-6 font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Craft with Visual Editor</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Choose from 6 designer themes (Obsidian, Minimalist, Cyberpunk, Oceanic). Customize headlines, feature cards, showcase works, and contact links with live side-by-side preview.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mb-6 font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Publish Live to the Web</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Toggle &ldquo;Published&rdquo; and share your instant live URL (<code className="text-indigo-300">/site/[slug]</code>). Real-time view tracking records every visitor in PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GOOGLE CLOUD GUIDE CALLOUT */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-gradient-to-r from-indigo-950/30 via-slate-950 to-purple-950/30">
        <div className="max-w-5xl mx-auto rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-8 sm:p-12 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="h-4 w-4" />
              Production Ready Google OAuth
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to Deploy on Your Custom Domain?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Use our interactive Google Cloud Console wizard to get your Client ID and Client Secret, copy authorized callback URLs with 1 click, and configure your live deployment.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/google-setup"
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow hover:bg-slate-100 transition-colors"
            >
              <span>Open Google Cloud Wizard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              How do I put my Google account in?
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Go to the <Link href="/login" className="text-indigo-400 underline">Login Portal</Link>. You have two easy options: you can enter your Google email directly to start immediately, or configure your Google OAuth 2.0 Client ID & Secret from Google Cloud Console for the official Google Consent screen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              Can I publish it as an actual website on the internet?
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Yes! All websites created in the dashboard have public URLs (<code className="text-indigo-300">/site/[slug]</code>). When you deploy this repository to Vercel, Render, Railway, or Docker with your PostgreSQL database URL, anyone around the world can view your live published websites and sign in with Google.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              Where is the data stored?
            </h3>
            <p className="text-slate-400 leading-relaxed">
              All users, sessions, Google tokens, websites, views, and system settings are stored in PostgreSQL using Drizzle ORM. No external third-party CMS is required.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">SiteForge Web Publisher</span>
            <span>• Next.js App Router & PostgreSQL</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard/google-setup" className="hover:text-slate-300 transition-colors">
              Google Setup
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
