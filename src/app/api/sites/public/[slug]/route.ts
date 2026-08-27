import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sites, users, siteViews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug?.toLowerCase().trim();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

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
      .where(eq(sites.slug, slug))
      .limit(1);

    if (found.length === 0) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const { site, author } = found[0];

    // If unpublished and not viewing author
    if (!site.isPublished) {
      return NextResponse.json({ error: "Website is not published", isUnpublished: true }, { status: 403 });
    }

    // Increment views in background (safely)
    try {
      await db
        .update(sites)
        .set({ views: sql`${sites.views} + 1` })
        .where(eq(sites.id, site.id));

      const referrer = request.headers.get("referer") || "direct";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await db.insert(siteViews).values({
        siteId: site.id,
        referrer: referrer.slice(0, 255),
        userAgent: userAgent.slice(0, 255),
      });
    } catch (err) {
      console.warn("Could not log view:", err);
    }

    return NextResponse.json({ site, author });
  } catch (error) {
    console.error("Error fetching public site:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
