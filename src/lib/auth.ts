import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions, systemSettings, accounts, User } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "siteforge_session";

// Fetch Google OAuth credentials from DB or Environment variables
export async function getGoogleOAuthCredentials() {
  let clientId = process.env.GOOGLE_CLIENT_ID || "";
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  // If not in env, check system_settings in DB
  try {
    const dbClientId = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "google_client_id"))
      .limit(1);
    if (dbClientId.length > 0 && dbClientId[0].value) {
      clientId = dbClientId[0].value;
    }

    const dbClientSecret = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "google_client_secret"))
      .limit(1);
    if (dbClientSecret.length > 0 && dbClientSecret[0].value) {
      clientSecret = dbClientSecret[0].value;
    }
  } catch (err) {
    console.error("Error reading google credentials from db:", err);
  }

  return {
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    isConfigured: Boolean(clientId.trim() && clientSecret.trim()),
  };
}

// Get the current authenticated user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const now = new Date();
    const activeSessions = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.id, sessionToken),
          gt(sessions.expiresAt, now)
        )
      )
      .limit(1);

    if (activeSessions.length === 0) {
      return null;
    }

    return activeSessions[0].user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Create a new session for a user and return the session ID
export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}

// Helper to upsert a Google user into Postgres
export async function upsertGoogleUser({
  email,
  name,
  image,
  googleId,
  accessToken,
  refreshToken,
  idToken,
}: {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
}): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user exists by email
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  let user: User;

  if (existing.length > 0) {
    user = existing[0];
    // Update user info if needed
    await db
      .update(users)
      .set({
        name: name || user.name,
        image: image || user.image,
        googleId: googleId || user.googleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  } else {
    // Insert new user
    const [inserted] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        image:
          image ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || normalizedEmail)}`,
        googleId,
        role: "user",
      })
      .returning();
    user = inserted;
  }

  // Upsert account record
  if (accessToken || googleId) {
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.provider, "google")
        )
      )
      .limit(1);

    if (existingAccount.length > 0) {
      await db
        .update(accounts)
        .set({
          providerAccountId: googleId,
          accessToken: accessToken || existingAccount[0].accessToken,
          refreshToken: refreshToken || existingAccount[0].refreshToken,
          idToken: idToken || existingAccount[0].idToken,
        })
        .where(eq(accounts.id, existingAccount[0].id));
    } else {
      await db.insert(accounts).values({
        userId: user.id,
        provider: "google",
        providerAccountId: googleId || `google_${user.id}`,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        idToken: idToken || null,
      });
    }
  }

  return user;
}
