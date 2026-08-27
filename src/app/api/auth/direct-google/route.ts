import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      // Create new user
      const newUser = await db.insert(users).values({
        email: email,
        name: name || null,
      }).returning();
      user = newUser;
    }

    // Return user data (FIXED - removed image, googleId, role)
    return NextResponse.json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
    });

  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
