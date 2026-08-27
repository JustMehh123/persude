"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Globe,
  ShieldCheck,
  Key,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Mail,
  UserCheck,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSetup = searchParams.get("setup") === "required";
  const urlError = searchParams.get("error");

  const [tab, setTab] = useState<"direct" | "oauth" | "config">(
    initialSetup ? "config" : "direct"
  );

  // Status & Settings state
  const [config, setConfig] = useState<{
    isConfigured: boolean;
    rawClientId: string;
    hasSecret: boolean;
    origin: string;
    redirectUri: string;
  } | null>(null);

  // Direct Google Account input state
  const [directEmail, setDirectEmail] = useState("");
  const [directName, setDirectName] = useState("");
  const [directImage, setDirectImage] = useState("");
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");

  // Credentials config state
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // Clipboard copy states
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
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const handleDirectGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDirectError("");

    if (!directEmail || !directEmail.includes("@")) {
      setDirectError("Please enter a valid Google email address (e.g. name@gmail.com)");
      return;
    }

    setDirectLoading(true);

    try {
      const res = await fetch("/api/auth/direct-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: directEmail.trim(),
          name: directName.trim() || directEmail.split("@")[0],
          image: directImage.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in with Google account");
      }

      // Success -> Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setDirectError(err.message || "Failed to sign in");
    } finally {
      setDirectLoading(false);
    }
  };

  const handleQuickPreset = (presetEmail: string, presetName: string, presetImg: string) => {
    setDirectEmail(presetEmail);
    setDirectName(presetName);
    setDirectImage(presetImg);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");
    setSavingConfig(true);

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
        throw new Error(data.error || "Failed to save Google credentials");
      }

      setSaveSuccess("Google OAuth credentials securely saved to PostgreSQL!");

      // Refresh config
      const ref = await fetch("/api/auth/settings");
      const refData = await ref.json();
      setConfig(refData);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save settings");
    } finally {
      setSavingConfig(false);
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

  return (
    <div className="w-full max-w-xl">
      {/* Header Card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-400 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Google Account Authentication & Setup
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Connect Your Google Account
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Sign in with your Google account to create, manage, and publish real websites live on the internet.
        </p>
      </div>

      {urlError && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <p className="font-medium">OAuth Notice: {urlError}</p>
            <p className="text-xs text-rose-300/80 mt-0.5">
              You can use direct Google sign-in below or update your credentials in the OAuth Keys tab.
            </p>
          </div>
        </div>
      )}

      {/* Main Auth Container */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-950/70 p-1.5 border border-slate-800/80 mb-6 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setTab("direct")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 transition-all ${
              tab === "direct"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">Google Account</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("oauth")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 transition-all ${
              tab === "oauth"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
            </svg>
            <span className="truncate">Google OAuth</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("config")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 transition-all ${
              tab === "config"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="h-4 w-4 shrink-0" />
            <span className="truncate">OAuth Keys</span>
          </button>
        </div>

        {/* TAB 1: Direct Google Account Input */}
        {tab === "direct" && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
              <div className="rounded-full bg-emerald-500/20 p-1 text-emerald-400 mt-0.5">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-200">Instant Google Account Sign-In: </span>
                Put in your actual Google email or select a sample account to jump straight into publishing websites with persistent PostgreSQL sessions.
              </div>
            </div>

            <form onSubmit={handleDirectGoogleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Google Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Rivera"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Avatar Image (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={directImage}
                    onChange={(e) => setDirectImage(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {directError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
                  {directError}
                </div>
              )}

              <button
                type="submit"
                disabled={directLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
              >
                {directLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating Google Account...
                  </span>
                ) : (
                  <>
                    <span>Continue with Google Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Presets */}
            <div className="pt-2">
              <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                <span>Or quick-fill demo Google profile:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPreset(
                      "sarah.creator@gmail.com",
                      "Sarah Chen",
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>👩‍💻 Sarah Chen</span>
                  <span className="text-[10px] text-slate-400">sarah@gmail.com</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPreset(
                      "marcus.founder@gmail.com",
                      "Marcus Vance",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <span>🚀 Marcus Vance</span>
                  <span className="text-[10px] text-slate-400">marcus@gmail.com</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Standard Google OAuth Consent */}
        {tab === "oauth" && (
          <div className="space-y-6 animate-fade-in text-center py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
              <svg className="h-9 w-9" viewBox="0 0 24 24">
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

            <div>
              <h2 className="text-xl font-bold text-white">Direct Google OAuth 2.0 Flow</h2>
              <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
                Redirects to Google&apos;s official sign-in page, requests OpenID profile and email permissions, and logs you in.
              </p>
            </div>

            {config && !config.isConfigured && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs text-left text-amber-200">
                <p className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Google Client ID & Secret Required
                </p>
                <p className="text-amber-200/90 leading-relaxed">
                  To use Google&apos;s live consent screen, configure your OAuth Client ID in the{" "}
                  <button
                    type="button"
                    onClick={() => setTab("config")}
                    className="underline font-bold text-amber-100 hover:text-white"
                  >
                    OAuth Keys
                  </button>{" "}
                  tab, or switch to the Google Account tab to sign in right now.
                </p>
              </div>
            )}

            <div>
              <a
                href="/api/auth/google/signin"
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-xl transition-all hover:bg-slate-100 active:scale-[0.99]"
              >
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
                Continue to Google Login
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: Google Cloud Credentials Setup */}
        {tab === "config" && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 text-xs text-slate-300">
              <div className="font-semibold text-indigo-300 mb-1 flex items-center justify-between">
                <span>Google Cloud Console Settings</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-normal"
                >
                  Open Google Cloud <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Add these exact callback URLs to your Google OAuth client in Google Cloud Console:
              </p>

              <div className="mt-3 space-y-2 font-mono text-[11px]">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-0.5">
                    <span>Authorized JavaScript Origin:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(config?.origin || window.location.origin, "origin")}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedOrigin ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedOrigin ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-slate-200 border border-slate-800 truncate">
                    {config?.origin || (typeof window !== "undefined" ? window.location.origin : "https://your-domain.com")}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-0.5">
                    <span>Authorized Redirect URI:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(config?.redirectUri || `${window.location.origin}/api/auth/callback/google`, "redirect")}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedRedirect ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedRedirect ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-slate-200 border border-slate-800 truncate">
                    {config?.redirectUri || (typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback/google` : "https://your-domain.com/api/auth/callback/google")}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Stored encrypted in PostgreSQL system_settings table or read from environment variables.
                </p>
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
                disabled={savingConfig}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {savingConfig ? "Saving to Database..." : "Save Google OAuth Keys"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center mt-6 text-xs text-slate-500">
        Protected by modern session cookies & PostgreSQL database security.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-3" />
              <p className="text-sm text-slate-400">Loading Google Authentication...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
