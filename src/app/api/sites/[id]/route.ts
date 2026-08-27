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
    const { name, slug, description, theme } = body;

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
