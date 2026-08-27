import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthCredentials } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { clientId, isConfigured } = await getGoogleOAuthCredentials();

    // Determine current base URL
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${proto}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    if (!isConfigured || !clientId) {
      // Redirect to login page with setup prompt
      return NextResponse.redirect(new URL("/login?setup=required", baseUrl));
    }

    // Generate random state for CSRF protection
    const state = crypto.randomBytes(24).toString("hex");

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");

    const response = NextResponse.redirect(googleAuthUrl.toString());

    // Save state in cookie for callback validation
    response.cookies.set({
      name: "oauth_state",
      value: state,
      httpOnly: true,
      secure: proto === "https",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.json({ error: "Failed to initiate Google OAuth" }, { status: 500 });
  }
}
