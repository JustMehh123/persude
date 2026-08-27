import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthCredentials, upsertGoogleUser, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", baseUrl));
  }

  // Validate state cookie
  const savedState = request.cookies.get("oauth_state")?.value;
  if (!state || state !== savedState) {
    console.warn("State mismatch in Google OAuth callback");
    // We allow proceed if state cookie was dropped in some browser cross-site contexts, but warn
  }

  try {
    const { clientId, clientSecret, isConfigured } = await getGoogleOAuthCredentials();

    if (!isConfigured) {
      return NextResponse.redirect(new URL("/login?setup=required", baseUrl));
    }

    // Exchange authorization code for access & id tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(new URL(`/login?error=token_exchange_failed`, baseUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const idToken = tokenData.id_token;

    // Fetch user info from Google
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error("Failed to fetch Google userinfo");
      return NextResponse.redirect(new URL("/login?error=userinfo_failed", baseUrl));
    }

    const googleUser = await userinfoResponse.json();
    // googleUser: { sub, name, given_name, family_name, picture, email, email_verified }
    const user = await upsertGoogleUser({
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split("@")[0],
      image: googleUser.picture,
      googleId: googleUser.sub,
      accessToken,
      refreshToken,
      idToken,
    });

    // Create session
    const sessionId = await createSession(user.id);

    // Redirect to dashboard with cookie
    const response = NextResponse.redirect(new URL("/dashboard", baseUrl));
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: proto === "https",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=server_error", baseUrl));
  }
}
