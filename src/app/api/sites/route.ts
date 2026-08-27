import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { sites, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Default template builder helper
function getDefaultContent(category: string, title: string) {
  if (category === "portfolio") {
    return {
      hero: {
        badge: "✨ Available for new projects & consulting",
        headline: `Hi, I'm ${title.split(" ")[0]} — Crafting Digital Experiences`,
        subheadline: "Fullstack engineer, product designer, and open-source enthusiast building high-impact web software.",
        ctaText: "View My Projects",
        ctaLink: "#showcase",
        secondaryCtaText: "Get in Touch",
        secondaryCtaLink: "#contact",
      },
      about: {
        title: "About Me",
        bio: "With over 6 years building modern web architectures, I focus on intuitive interfaces, fast distributed backends, and delightful micro-interactions.",
        highlights: ["TypeScript & React / Next.js", "PostgreSQL & Cloud Infrastructure", "UI/UX & Design Systems", "API Architecture"],
      },
      features: [
        { icon: "Code", title: "Full-Stack Development", description: "Scalable apps with modern React, Next.js, TypeScript, and high-performance databases." },
        { icon: "Sparkles", title: "Product & UI Design", description: "Crafting beautiful, accessible, and responsive user experiences tailored to your audience." },
        { icon: "Rocket", title: "Performance & SEO", description: "Ultra-fast load times, SEO optimization, and web vitals tuning for maximum reach." },
      ],
      showcase: [
        { title: "Distributed Task Cloud", desc: "Real-time task scheduling engine handling 10M+ events daily.", tag: "Next.js & Postgres", link: "https://github.com" },
        { title: "Aura Design System", desc: "Open-source accessible component library with 15k GitHub stars.", tag: "TypeScript & Tailwind", link: "https://github.com" },
        { title: "HyperMetrics Analytics", desc: "Privacy-first event tracking dashboard with sub-second queries.", tag: "Full-Stack SaaS", link: "https://github.com" },
      ],
      social: {
        twitter: "https://twitter.com",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        email: "hello@example.com",
      },
      contact: {
        heading: "Let's Build Something Remarkable",
        email: "hello@example.com",
        buttonText: "Send an Email",
      },
    };
  }

  // Default Startup / SaaS Landing Page
  return {
    hero: {
      badge: "🚀 Version 2.0 is now live",
      headline: "Ship Beautiful Digital Products in Record Time",
      subheadline: "An all-in-one platform engineered for modern teams. Build, deploy, and scale without friction.",
      ctaText: "Start Building Free",
      ctaLink: "#contact",
      secondaryCtaText: "Watch Interactive Demo",
      secondaryCtaLink: "#features",
    },
    about: {
      title: "Why Teams Choose Us",
      bio: "Engineered from the ground up for high reliability, instant global delivery, and joyful developer experiences.",
      highlights: ["99.99% Global Uptime", "Zero-Config Deployments", "PostgreSQL Powered", "End-to-End Encryption"],
    },
    features: [
      { icon: "Zap", title: "Lightning Fast Speed", description: "Edge-computed assets and instant server rendering guarantee sub-100ms response times worldwide." },
      { icon: "ShieldCheck", title: "Enterprise Grade Security", description: "Built-in Google OAuth, role-based permissions, and automatic SSL encryption out of the box." },
      { icon: "Globe", title: "Global CDN & Custom Domains", description: "Publish to the world with one click, connect your custom domain, and track live analytics." },
    ],
    showcase: [
      { title: "Instant Publishing", desc: "Push your changes live in seconds with built-in preview environments.", tag: "Core Feature", link: "#" },
      { title: "Real-Time Analytics", desc: "Monitor page visits, referrers, and conversion rates right from your dashboard.", tag: "Insights", link: "#" },
      { title: "Modern Visual Themes", desc: "Switch between clean minimalist, midnight dark, and cyberpunk palettes instantly.", tag: "Customization", link: "#" },
    ],
    social: {
      twitter: "https://twitter.com",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "team@example.com",
    },
    contact: {
      heading: "Ready to launch your website?",
      email: "contact@example.com",
      buttonText: "Contact Sales",
    },
  };
}

import { ensureInitialSeed } from "@/lib/seed";

export async function GET(request: NextRequest) {
  try {
    await ensureInitialSeed();
    const url = new URL(request.url);
    const publicOnly = url.searchParams.get("public") === "true";

    if (publicOnly) {
      // Return published sites for showcase
      const published = await db
        .select({
          id: sites.id,
          slug: sites.slug,
          title: sites.title,
          tagline: sites.tagline,
          description: sites.description,
          category: sites.category,
          theme: sites.theme,
          views: sites.views,
          createdAt: sites.createdAt,
          authorName: users.name,
          authorImage: users.image,
        })
        .from(sites)
        .innerJoin(users, eq(sites.userId, users.id))
        .where(eq(sites.isPublished, true))
        .orderBy(desc(sites.views), desc(sites.createdAt))
        .limit(20);

      return NextResponse.json({ sites: published });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSites = await db
      .select()
      .from(sites)
      .where(eq(sites.userId, user.id))
      .orderBy(desc(sites.updatedAt));

    return NextResponse.json({ sites: userSites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in with your Google account first" }, { status: 401 });
    }

    const body = await request.json();
    const { title, tagline, description, category = "landing", theme = "modern", slug: requestedSlug } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate clean slug
    let baseSlug = (requestedSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) {
      baseSlug = `site-${Date.now().toString(36)}`;
    }

    // Check slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.select().from(sites).where(eq(sites.slug, slug)).limit(1);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const contentObj = getDefaultContent(category, title);

    const [newSite] = await db
      .insert(sites)
      .values({
        userId: user.id,
        slug,
        title: title.trim(),
        tagline: tagline || "Built with Google-powered SiteForge",
        description: description || "Modern responsive published website.",
        category,
        theme,
        content: JSON.stringify(contentObj),
        isPublished: true, // published by default so user can view live link immediately
        views: 1,
        seoTitle: `${title} | Published with SiteForge`,
        seoDescription: description || `Welcome to ${title}`,
      })
      .returning();

    return NextResponse.json({ success: true, site: newSite });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  }
}
