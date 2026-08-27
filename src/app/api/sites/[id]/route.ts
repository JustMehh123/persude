import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const siteId = parseInt(params.id, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const siteList = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, user.id)))
      .limit(1);

    if (siteList.length === 0) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ site: siteList[0] });
  } catch (error) {
    console.error("Error getting site:", error);
    return NextResponse.json({ error: "Failed to get site" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const siteId = parseInt(params.id, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      tagline,
      description,
      category,
      theme,
      content,
      isPublished,
      customDomain,
      seoTitle,
      seoDescription,
    } = body;

    const updateData: Partial<typeof sites.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (theme !== undefined) updateData.theme = theme;
    if (content !== undefined) {
      updateData.content = typeof content === "string" ? content : JSON.stringify(content);
    }
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (customDomain !== undefined) updateData.customDomain = customDomain;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

    const [updatedSite] = await db
      .update(sites)
      .set(updateData)
      .where(eq(sites.id, siteId))
      .returning();

    return NextResponse.json({ success: true, site: updatedSite });
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const siteId = parseInt(params.id, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .delete(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Site deleted" });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  }
}
