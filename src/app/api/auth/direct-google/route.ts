import { NextRequest, NextResponse } from "next/server";
import { upsertGoogleUser, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, image, googleId } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid Google email address" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === "string" && name.trim()) || cleanEmail.split("@")[0];
    const cleanImage =
      (image && typeof image === "string" && image.trim()) ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`;
    const cleanGoogleId = (googleId && typeof googleId === "string") ? googleId : `google_direct_${Date.now()}`;

    // Upsert user into database
    const user = await upsertGoogleUser({
      email: cleanEmail,
      name: cleanName,
      image: cleanImage,
      googleId: cleanGoogleId,
    });

    // Create session
    const sessionId = await createSession(user.id);

    const proto = request.headers.get("x-forwarded-proto") || "http";
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        googleId: user.googleId,
        role: user.role,
      },
    });

    // Set auth cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: proto === "https",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Direct Google sign in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
