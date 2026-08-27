import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { sites, users, siteViews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { THEMES, ThemeConfig } from "@/lib/themes";
import {
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Mail,
  ExternalLink,
  Code2,
  Layout,
  BarChart3,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = await db
    .select({
      site: sites,
    })
    .from(sites)
    .where(eq(sites.slug, slug.toLowerCase().trim()))
    .limit(1);

  if (found.length === 0 || !found[0].site.isPublished) {
    return {
      title: "Website Not Found",
    };
  }

  const { site } = found[0];

  return {
    title: site.seoTitle || `${site.title} | Published Website`,
    description: site.seoDescription || site.tagline || site.description || "Live website built and published with SiteForge.",
    openGraph: {
      title: site.title,
      description: site.tagline || site.description || "Live website",
      type: "website",
    },
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;

  const found = await db
    .select({
      site: sites,
      author: {
        name: users.name,
        email: users.email,
        image: users.image,
        bio: users.bio,
      },
    })
    .from(sites)
    .innerJoin(users, eq(sites.userId, users.id))
    .where(eq(sites.slug, slug.toLowerCase().trim()))
    .limit(1);

  if (found.length === 0 || !found[0].site.isPublished) {
    notFound();
  }

  const { site, author } = found[0];

  // Increment views count asynchronously
  try {
    await db
      .update(sites)
      .set({ views: sql`${sites.views} + 1` })
      .where(eq(sites.id, site.id));
  } catch (err) {
    console.warn("Error incrementing view count:", err);
  }

  let content: any = {};
  try {
    content = typeof site.content === "string" ? JSON.parse(site.content) : site.content;
  } catch (err) {
    content = {};
  }

  const theme: ThemeConfig = THEMES[site.theme] || THEMES.modern;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} selection:bg-indigo-500 selection:text-white flex flex-col font-sans`}>
      {/* Published Top Navigation */}
      <header className={`sticky top-0 z-50 ${theme.navBg}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight">{site.title}</span>
              {site.tagline && (
                <p className={`hidden sm:block text-[11px] ${theme.textMuted} -mt-0.5 truncate max-w-xs`}>
                  {site.tagline}
                </p>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-4 text-xs sm:text-sm font-medium">
            {content.features?.length > 0 && (
              <a href="#features" className={`hidden sm:inline hover:opacity-80 transition-opacity ${theme.textMuted}`}>
                Features
              </a>
            )}
            {content.showcase?.length > 0 && (
              <a href="#showcase" className={`hidden sm:inline hover:opacity-80 transition-opacity ${theme.textMuted}`}>
                Showcase
              </a>
            )}
            {content.about?.bio && (
              <a href="#about" className={`hidden sm:inline hover:opacity-80 transition-opacity ${theme.textMuted}`}>
                About
              </a>
            )}
            {content.contact?.email ? (
              <a
                href={`mailto:${content.contact.email}`}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${theme.primaryButton} transition-all`}
              >
                {content.contact.buttonText || "Contact"}
              </a>
            ) : (
              <a
                href="#contact"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${theme.primaryButton} transition-all`}
              >
                Get in Touch
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
          {content.hero?.badge && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium backdrop-blur-sm">
              <span className={`rounded-full px-3 py-1 ${theme.badgeBg}`}>
                {content.hero.badge}
              </span>
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {content.hero?.headline || site.title}
          </h1>

          <p className={`mt-6 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed ${theme.textMuted}`}>
            {content.hero?.subheadline || site.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {content.hero?.ctaText && (
              <a
                href={content.hero.ctaLink || "#contact"}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm sm:text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${theme.primaryButton}`}
              >
                <span>{content.hero.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {content.hero?.secondaryCtaText && (
              <a
                href={content.hero.secondaryCtaLink || "#features"}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm sm:text-base font-semibold transition-all hover:scale-105 active:scale-95 ${theme.secondaryButton}`}
              >
                <span>{content.hero.secondaryCtaText}</span>
              </a>
            )}
          </div>
        </section>

        {/* FEATURES GRID */}
        {content.features && content.features.length > 0 && (
          <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Designed for Impact & Performance
              </h2>
              <p className={`mt-2 text-sm sm:text-base ${theme.textMuted}`}>
                Core capabilities and architectural highlights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.features.map((feature: any, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-md transition-all hover:-translate-y-1 ${theme.cardBg} ${theme.cardBorder}`}
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">{feature.title}</h3>
                  <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHOWCASE / PORTFOLIO ITEMS */}
        {content.showcase && content.showcase.length > 0 && (
          <section id="showcase" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Featured Highlights & Works
              </h2>
              <p className={`mt-2 text-sm sm:text-base ${theme.textMuted}`}>
                Explore select deliverables, projects, and case studies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {content.showcase.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between backdrop-blur-md transition-all hover:border-slate-600 ${theme.cardBg} ${theme.cardBorder}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        {item.tag || "Featured"}
                      </span>
                      {item.link && item.link !== "#" && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2">{item.title}</h3>
                    <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{item.desc}</p>
                  </div>

                  {item.link && item.link !== "#" && (
                    <div className="mt-6 pt-4 border-t border-slate-800/40">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:underline"
                      >
                        <span>Learn more</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABOUT & AUTHOR STORY */}
        {content.about && (
          <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className={`rounded-3xl border p-8 sm:p-12 backdrop-blur-xl ${theme.cardBg} ${theme.cardBorder}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                <img
                  src={
                    author.image ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.name || "Author")}`
                  }
                  alt={author.name || "Author"}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
                />
                <div>
                  <h3 className="text-2xl font-bold">{content.about.title || `About ${author.name}`}</h3>
                  <div className="flex items-center gap-2 text-xs mt-1 text-emerald-400 font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified Creator: {author.name}</span>
                  </div>
                </div>
              </div>

              <p className={`text-base leading-relaxed mb-6 ${theme.textMuted}`}>
                {content.about.bio}
              </p>

              {content.about.highlights && content.about.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-slate-800/40">
                  {content.about.highlights.map((hl: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-950/60 p-8 sm:p-12 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {content.contact?.heading || "Let's Connect"}
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${theme.textMuted}`}>
              Reach out directly to collaborate, enquire about projects, or request a quote.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {content.contact?.email ? (
                <a
                  href={`mailto:${content.contact.email}`}
                  className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm sm:text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${theme.primaryButton}`}
                >
                  <Mail className="h-4 w-4" />
                  <span>{content.contact.buttonText || `Email ${content.contact.email}`}</span>
                </a>
              ) : (
                <a
                  href={`mailto:${author.email}`}
                  className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm sm:text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${theme.primaryButton}`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Send an Email</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Publisher Branding Banner */}
      <footer className={`border-t py-6 px-4 text-center text-xs ${theme.cardBorder} ${theme.textMuted}`}>
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between max-w-6xl gap-4">
          <div className="flex items-center gap-2">
            <span>Published by <strong>{author.name}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Google Account Verified
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              <Globe className="h-3 w-3 text-indigo-400" />
              <span>Built with SiteForge Web Publisher</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
