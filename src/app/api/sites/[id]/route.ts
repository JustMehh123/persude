import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - Fetch a single site
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const siteId = parseInt(params.id);
    
    if (isNaN(siteId)) {
      return NextResponse.json(
        { error: "Invalid site ID" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const siteList = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.ownerId, user.id)))
      .limit(1);

    if (siteList.length === 0) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(siteList[0]);
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a site
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const siteId = parseInt(params.id);
    
    if (isNaN(siteId)) {
      return NextResponse.json(
        { error: "Invalid site ID" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, slug, description, theme, published } = body;

    const existingSite = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.ownerId, user.id)))
      .limit(1);

    if (existingSite.length === 0) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    const updatedSite = await db
      .update(sites)
      .set({
        name: name || existingSite[0].name,
        slug: slug || existingSite[0].slug,
        description: description || existingSite[0].description,
        theme: theme || existingSite[0].theme,
        published: published !== undefined ? published : existingSite[0].published,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    return NextResponse.json(updatedSite[0]);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a site
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const siteId = parseInt(params.id);
    
    if (isNaN(siteId)) {
      return NextResponse.json(
        { error: "Invalid site ID" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingSite = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.ownerId, user.id)))
      .limit(1);

    if (existingSite.length === 0) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.delete(sites).where(eq(sites.id, siteId));

    return NextResponse.json(
      { message: "Site deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
