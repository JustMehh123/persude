import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getGoogleOAuthCredentials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { clientId, clientSecret, isConfigured } = await getGoogleOAuthCredentials();

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${proto}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    return NextResponse.json({
      isConfigured,
      clientId: clientId ? `${clientId.slice(0, 12)}...${clientId.slice(-12)}` : "",
      rawClientId: clientId || "",
      hasSecret: Boolean(clientSecret),
      origin: baseUrl,
      redirectUri,
    });
  } catch (error) {
    console.error("Error fetching Google settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientSecret } = body;

    if (clientId !== undefined) {
      await db
        .insert(systemSettings)
        .values({
          key: "google_client_id",
          value: clientId.trim(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: clientId.trim(),
            updatedAt: new Date(),
          },
        });
    }

    if (clientSecret !== undefined) {
      await db
        .insert(systemSettings)
        .values({
          key: "google_client_secret",
          value: clientSecret.trim(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: clientSecret.trim(),
            updatedAt: new Date(),
          },
        });
    }

    const updated = await getGoogleOAuthCredentials();

    return NextResponse.json({
      success: true,
      message: "Google OAuth credentials updated successfully in PostgreSQL",
      isConfigured: updated.isConfigured,
    });
  } catch (error) {
    console.error("Error saving Google settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
