// src/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// --- users ---
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text().notNull().unique(),
  // add other columns...
});

export type User = typeof users.$inferSelect;

// --- sessions ---
export const sessions = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  token: text().notNull().unique(),
  expiresAt: timestamp().notNull(),
  // other columns...
});

// --- sites ---
export const sites = pgTable("sites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: integer()
    .notNull()
    .references(() => users.id),
  slug: text().notNull().unique(),
  name: text().notNull(),
  // other columns...
});

// --- siteViews ---
export const siteViews = pgTable("site_views", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  siteId: integer()
    .notNull()
    .references(() => sites.id),
  viewedAt: timestamp().notNull(),
  // other columns...
});

// --- systemSettings ---
export const systemSettings = pgTable("system_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: text().notNull().unique(),
  value: jsonb().notNull(),
  // other columns...
});

// --- accounts (if you use OAuth, etc.) ---
export const accounts = pgTable("accounts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  provider: text().notNull(),
  providerAccountId: text().notNull(),
  // other columns...
});
