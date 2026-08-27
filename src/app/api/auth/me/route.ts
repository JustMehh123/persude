import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getGoogleOAuthCredentials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { isConfigured, clientId } = await getGoogleOAuthCredentials();

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${proto}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    return NextResponse.json({
      authenticated: Boolean(user),
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: user.googleId,
            role: user.role,
            bio: user.bio,
            createdAt: user.createdAt,
          }
        : null,
      googleConfig: {
        isConfigured,
        clientId: clientId ? `${clientId.slice(0, 10)}...${clientId.slice(-14)}` : null,
        redirectUri,
        origin: baseUrl,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
