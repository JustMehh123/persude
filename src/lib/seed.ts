import { db } from "@/db";
import { users, sites } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function ensureInitialSeed() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return;
    }

    // Create a demo verified Google account
    const [demoUser] = await db
      .insert(users)
      .values({
        email: "alex.rivera.dev@gmail.com",
        name: "Alex Rivera",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
        googleId: "google_verified_109283749281749",
        role: "admin",
        bio: "Fullstack Architect & Web Creator. Signed in with Google.",
      })
      .returning();

    // Create 2 showcase published sites
    const aiLandingContent = {
      hero: {
        badge: "⚡ AI-Powered Production Platform",
        headline: "Synthetix — Intelligent Data Pipelines at Speed",
        subheadline: "Empower your engineering team to ingest, transform, and analyze billions of event streams with sub-millisecond query latencies.",
        ctaText: "Get Started Free",
        ctaLink: "#features",
        secondaryCtaText: "Read Documentation",
        secondaryCtaLink: "#about",
      },
      about: {
        title: "Built for Modern Scale",
        bio: "Synthetix replaces fragmented legacy ETL pipelines with a unified streaming compute engine built on Rust and Postgres.",
        highlights: [
          "10x Faster query execution",
          "Zero-maintenance managed clusters",
          "SOC2 Type II & HIPAA certified",
          "Automated schema synchronization",
        ],
      },
      features: [
        {
          icon: "Cpu",
          title: "Real-Time Event Processing",
          description: "Ingest up to 500,000 events/sec per node with guaranteed once-and-only-once delivery semantics.",
        },
        {
          icon: "ShieldCheck",
          title: "Enterprise Grade Security",
          description: "Granular access controls, Google SSO integration, and client-side encryption keys.",
        },
        {
          icon: "BarChart3",
          title: "Live Analytical Dashboards",
          description: "Instant visualization widgets and real-time alerts dispatched to Slack or PagerDuty.",
        },
      ],
      showcase: [
        {
          title: "FinTech Cloud Migration",
          desc: "Reduced data latency from 45 minutes to 1.2 seconds for global payment settlement.",
          tag: "Case Study",
          link: "#",
        },
        {
          title: "Streaming Analytics Engine",
          desc: "Open source framework with over 12,000 GitHub stars and 200 contributors.",
          tag: "Open Source",
          link: "#",
        },
      ],
      social: {
        twitter: "https://twitter.com",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        email: "contact@synthetix.cloud",
      },
      contact: {
        heading: "Ready to accelerate your cloud pipelines?",
        email: "sales@synthetix.cloud",
        buttonText: "Schedule Architecture Review",
      },
    };

    const portfolioContent = {
      hero: {
        badge: "🎨 Available for Select Design & Engineering Roles",
        headline: "Sarah Chen — Product Designer & Frontend Craftsman",
        subheadline: "I bridge the gap between complex engineering systems and intuitive, human-centered digital experiences.",
        ctaText: "Explore My Work",
        ctaLink: "#showcase",
        secondaryCtaText: "Download Resume",
        secondaryCtaLink: "#about",
      },
      about: {
        title: "Crafting with Passion & Code",
        bio: "Previously lead design systems at Linear and Stripe. I believe great software should feel fast, responsive, and thoughtfully animated.",
        highlights: [
          "Design Systems & Component Architecture",
          "Next.js, React, Tailwind & CSS Motion",
          "Micro-interactions & Accessible UI",
          "8+ years of product design leadership",
        ],
      },
      features: [
        {
          icon: "Layout",
          title: "Design Systems",
          description: "Tokens, variables, and fully accessible WCAG 2.1 AAA component libraries.",
        },
        {
          icon: "Sparkles",
          title: "Interactive Prototypes",
          description: "High-fidelity micro-interactions and tactile feedback that delight end-users.",
        },
        {
          icon: "Code2",
          title: "Production Frontend",
          description: "Pixel-perfect implementation using Next.js App Router, Tailwind, and React 19.",
        },
      ],
      showcase: [
        {
          title: "Nebula OS Interface",
          desc: "A futuristic web desktop operating system crafted entirely with CSS Grid and SVG filters.",
          tag: "Product Design",
          link: "#",
        },
        {
          title: "Prism Component Kit",
          desc: "Award-winning open source Tailwind library used by over 40,000 developers.",
          tag: "Open Source",
          link: "#",
        },
      ],
      social: {
        twitter: "https://twitter.com",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        email: "sarah@chen.design",
      },
      contact: {
        heading: "Let's craft your next digital breakthrough",
        email: "sarah@chen.design",
        buttonText: "Get in Touch",
      },
    };

    await db.insert(sites).values([
      {
        userId: demoUser.id,
        slug: "synthetix-ai",
        title: "Synthetix AI Cloud",
        tagline: "Intelligent Data Pipelines at Speed",
        description: "Modern data infrastructure platform built for real-time analytics.",
        category: "business",
        theme: "modern",
        content: JSON.stringify(aiLandingContent),
        isPublished: true,
        views: 248,
        seoTitle: "Synthetix AI — Real-Time Streaming Cloud",
        seoDescription: "High performance streaming compute engine.",
      },
      {
        userId: demoUser.id,
        slug: "sarah-chen",
        title: "Sarah Chen Design",
        tagline: "Product Designer & Frontend Craftsman",
        description: "Portfolio of Sarah Chen, Lead Designer & Next.js developer.",
        category: "portfolio",
        theme: "cyberpunk",
        content: JSON.stringify(portfolioContent),
        isPublished: true,
        views: 412,
        seoTitle: "Sarah Chen | Product Design & Frontend",
        seoDescription: "Product design portfolio and interactive web projects.",
      },
    ]);
  } catch (err) {
    console.error("Auto-seed error:", err);
  }
}
