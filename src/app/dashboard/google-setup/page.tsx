"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  ShieldCheck,
  Key,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Server,
  ArrowRight,
  HelpCircle,
  Database,
  Globe,
  Terminal,
} from "lucide-react";

export default function GoogleSetupPage() {
  const [config, setConfig] = useState<{
    isConfigured: boolean;
    clientId: string;
    rawClientId: string;
    hasSecret: boolean;
    origin: string;
    redirectUri: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  useEffect(() => {
    fetch("/api/auth/settings")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        if (data.rawClientId) {
          setClientIdInput(data.rawClientId);
        }
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const res = await fetch("/api/auth/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientIdInput,
          clientSecret: clientSecretInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSaveSuccess("Google OAuth credentials saved to PostgreSQL system_settings!");
      const ref = await fetch("/api/auth/settings");
      const refData = await ref.json();
      setConfig(refData);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: "origin" | "redirect") => {
    navigator.clipboard.writeText(text);
    if (type === "origin") {
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    } else {
      setCopiedRedirect(true);
      setTimeout(() => setCopiedRedirect(false), 2000);
    }
  };

  const currentOrigin = config?.origin || (typeof window !== "undefined" ? window.location.origin : "");
  const currentRedirectUri = config?.redirectUri || `${currentOrigin}/api/auth/callback/google`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Google Cloud Console & Production Publishing
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Google Account Integration & Deployment
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Everything you need to connect your Google Cloud OAuth credentials and publish this platform to any domain on the internet.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  config?.isConfigured ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}
              >
                <Key className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Google OAuth Integration Status</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      config?.isConfigured
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {config?.isConfigured ? "Configured & Active" : "Setup Incomplete"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {config?.isConfigured
                    ? `Client ID registered (${config.clientId}). Real Google OAuth login is enabled.`
                    : "Add your Google OAuth Client ID & Secret below or use direct Google account login."}
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
              </svg>
              <span>Test Google Login</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Callbacks */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step by step guide */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                  1
                </span>
                Google Cloud Console Configuration
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <p className="leading-relaxed">
                  To allow anyone or yourself to sign in with their Google account on your published domain:
                </p>

                <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-400">
                  <li>
                    Open{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Google Cloud Console Credentials <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Click <strong>+ CREATE CREDENTIALS</strong> &rarr; <strong>OAuth client ID</strong></li>
                  <li>Choose Application type: <strong>Web application</strong></li>
                  <li>
                    Under <strong>Authorized JavaScript origins</strong>, paste:
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-slate-200 border border-slate-800">
                      <span className="truncate">{currentOrigin}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentOrigin, "origin")}
                        className="text-indigo-400 hover:text-indigo-300 ml-2 shrink-0 flex items-center gap-1"
                      >
                        {copiedOrigin ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedOrigin ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </li>
                  <li>
                    Under <strong>Authorized redirect URIs</strong>, paste:
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-slate-200 border border-slate-800">
                      <span className="truncate">{currentRedirectUri}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentRedirectUri, "redirect")}
                        className="text-indigo-400 hover:text-indigo-300 ml-2 shrink-0 flex items-center gap-1"
                      >
                        {copiedRedirect ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedRedirect ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </li>
                  <li>Click <strong>Create</strong>, then copy the <strong>Client ID</strong> and <strong>Client Secret</strong> into the form below.</li>
                </ol>
              </div>
            </div>

            {/* Credentials Save Form */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                  2
                </span>
                Save OAuth Credentials into PostgreSQL
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Credentials entered here are encrypted and stored in your PostgreSQL <code className="text-indigo-300">system_settings</code> table.
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Google OAuth Client ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Google OAuth Client Secret
                  </label>
                  <input
                    type="password"
                    required={!config?.hasSecret}
                    placeholder={config?.hasSecret ? "••••••••••••••••••••••••••••" : "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"}
                    value={clientSecretInput}
                    onChange={(e) => setClientSecretInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                {saveSuccess && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {saveError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
                    {saveError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving Credentials..." : "Save Credentials to PostgreSQL"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Deployment & Environment Variables Guide */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-400" />
                Publishing to an Actual Website
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                When you deploy this project to <strong>Vercel</strong>, <strong>Render</strong>, <strong>Railway</strong>, or your own VPS/Docker:
              </p>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-indigo-400" />
                    1. PostgreSQL Database
                  </div>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    Provide your live PostgreSQL URL in <code className="text-indigo-300">DATABASE_URL</code> (Neon, Supabase, Railway, RDS, etc.). Drizzle kit runs automatically.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-emerald-400" />
                    2. Environment Variables (.env)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-normal mb-2">
                    Alternatively configure them via environment variables:
                  </p>
                  <pre className="rounded-lg bg-slate-900 p-2 font-mono text-[10px] text-slate-300 overflow-x-auto">
{`DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx`}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    3. Custom Domain Setup
                  </div>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    Once your custom domain is connected (e.g. <code className="text-slate-300">https://yourdomain.com</code>), simply update your Google Cloud Console OAuth Authorized JavaScript Origin and Redirect URI to match!
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Google Login Feature Card */}
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-950/60 p-6 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Direct Google Account Mode
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Even before you set up Google Cloud Console, you can test and use the full platform right now by entering your Google email directly at the login portal. Full sessions, site publishing, and public links are 100% active.
              </p>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>Go to Google Sign-In Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
