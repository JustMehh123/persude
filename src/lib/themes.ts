export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  previewClass: string;
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  navBg: string;
  primaryButton: string;
  secondaryButton: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  modern: {
    id: "modern",
    name: "Midnight Obsidian",
    description: "Sleek deep slate with indigo and violet glowing accents",
    previewClass: "from-slate-900 to-indigo-950",
    bg: "bg-slate-950",
    text: "text-slate-100",
    textMuted: "text-slate-400",
    accent: "bg-indigo-600",
    accentHover: "hover:bg-indigo-500",
    accentText: "text-indigo-400",
    cardBg: "bg-slate-900/80",
    cardBorder: "border-slate-800/80",
    badgeBg: "bg-indigo-950/80 border-indigo-800 text-indigo-300",
    badgeText: "text-indigo-400",
    navBg: "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80",
    primaryButton: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25",
    secondaryButton: "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700",
  },
  minimal: {
    id: "minimal",
    name: "Pure Light Minimal",
    description: "Crisp white background, clean contrast, refined typography",
    previewClass: "from-zinc-100 to-zinc-300",
    bg: "bg-white",
    text: "text-zinc-900",
    textMuted: "text-zinc-500",
    accent: "bg-zinc-900",
    accentHover: "hover:bg-zinc-800",
    accentText: "text-zinc-900",
    cardBg: "bg-zinc-50",
    cardBorder: "border-zinc-200",
    badgeBg: "bg-zinc-100 border-zinc-300 text-zinc-800",
    badgeText: "text-zinc-900",
    navBg: "bg-white/85 backdrop-blur-md border-b border-zinc-200",
    primaryButton: "bg-zinc-900 hover:bg-zinc-800 text-white shadow-md shadow-zinc-900/10",
    secondaryButton: "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300",
  },
  ocean: {
    id: "ocean",
    name: "Oceanic Cyan",
    description: "Deep marine navy with electric cyan and turquoise gradients",
    previewClass: "from-cyan-950 to-blue-900",
    bg: "bg-[#050f1e]",
    text: "text-cyan-50",
    textMuted: "text-cyan-300/70",
    accent: "bg-cyan-500",
    accentHover: "hover:bg-cyan-400",
    accentText: "text-cyan-400",
    cardBg: "bg-blue-950/40",
    cardBorder: "border-cyan-900/50",
    badgeBg: "bg-cyan-950/70 border-cyan-800 text-cyan-300",
    badgeText: "text-cyan-400",
    navBg: "bg-[#050f1e]/80 backdrop-blur-md border-b border-cyan-900/40",
    primaryButton: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
    secondaryButton: "bg-blue-900/40 hover:bg-blue-800/50 text-cyan-100 border border-cyan-800/60",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Crimson",
    description: "Rich dark plum with vibrant rose, amber, and orange warmth",
    previewClass: "from-purple-950 to-rose-900",
    bg: "bg-[#140b17]",
    text: "text-rose-50",
    textMuted: "text-rose-200/70",
    accent: "bg-rose-500",
    accentHover: "hover:bg-rose-400",
    accentText: "text-rose-400",
    cardBg: "bg-purple-950/30",
    cardBorder: "border-rose-900/40",
    badgeBg: "bg-rose-950/60 border-rose-800 text-rose-300",
    badgeText: "text-rose-400",
    navBg: "bg-[#140b17]/80 backdrop-blur-md border-b border-rose-900/40",
    primaryButton: "bg-gradient-to-r from-rose-500 via-pink-600 to-orange-500 hover:opacity-90 text-white shadow-lg shadow-rose-500/25",
    secondaryButton: "bg-purple-900/30 hover:bg-purple-800/40 text-rose-100 border border-rose-800/50",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Forest",
    description: "Sophisticated deep green with crisp mint and gold accents",
    previewClass: "from-emerald-950 to-teal-900",
    bg: "bg-[#06140f]",
    text: "text-emerald-50",
    textMuted: "text-emerald-200/70",
    accent: "bg-emerald-500",
    accentHover: "hover:bg-emerald-400",
    accentText: "text-emerald-400",
    cardBg: "bg-emerald-950/40",
    cardBorder: "border-emerald-900/50",
    badgeBg: "bg-emerald-950/70 border-emerald-800 text-emerald-300",
    badgeText: "text-emerald-400",
    navBg: "bg-[#06140f]/80 backdrop-blur-md border-b border-emerald-900/40",
    primaryButton: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    secondaryButton: "bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-100 border border-emerald-800/60",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "High-octane black canvas with electric magenta and neon cyan sparks",
    previewClass: "from-black to-fuchsia-950",
    bg: "bg-black",
    text: "text-fuchsia-50",
    textMuted: "text-zinc-400",
    accent: "bg-fuchsia-500",
    accentHover: "hover:bg-fuchsia-400",
    accentText: "text-fuchsia-400",
    cardBg: "bg-zinc-950/90",
    cardBorder: "border-fuchsia-900/50",
    badgeBg: "bg-fuchsia-950/70 border-fuchsia-700 text-fuchsia-300",
    badgeText: "text-fuchsia-400",
    navBg: "bg-black/90 backdrop-blur-md border-b border-fuchsia-900/50",
    primaryButton: "bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-black font-semibold shadow-lg shadow-fuchsia-500/30",
    secondaryButton: "bg-zinc-900 hover:bg-zinc-800 text-fuchsia-300 border border-fuchsia-800/60",
  },
};
