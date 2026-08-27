"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Sparkles, LogOut, Settings, LayoutDashboard, Plus, ShieldCheck, ChevronDown, ExternalLink } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  image: string;
  googleId: string;
  role: string;
}

export function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => console.error("Error fetching session:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
      setDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/30">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SiteForge
              <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1">Google-Powered Web Publisher</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/#showcase" className="hover:text-white transition-colors">
            Live Showcase
          </Link>
          <Link href="/#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/dashboard/google-setup" className="flex items-center gap-1.5 hover:text-white transition-colors text-indigo-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Google Cloud & Publish Guide
          </Link>
        </nav>

        {/* Right Auth Action */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-800" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-900/90 py-1 pl-1.5 pr-3 text-sm text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
              >
                <img
                  src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover border border-indigo-400/40"
                />
                <span className="max-w-[120px] truncate font-medium text-xs sm:text-sm">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 animate-fade-in">
                    <div className="border-b border-slate-800 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
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
                        Google Account Connected
                      </div>
                      <p className="truncate text-xs font-medium text-slate-200">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
                      >
                        <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                        Dashboard & Sites
                      </Link>
                      <Link
                        href="/dashboard/sites/new"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
                      >
                        <Plus className="h-4 w-4 text-pink-400" />
                        Create New Website
                      </Link>
                      <Link
                        href="/dashboard/google-setup"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Google OAuth & Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-950/40"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-md shadow-white/10 transition-all hover:bg-slate-100 hover:shadow-white/20 active:scale-95"
              >
                {/* Google G Logo SVG */}
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                Sign in with Google
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
