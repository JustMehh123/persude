// src/db/schema.ts
import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

// ---------- users ----------
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text().notNull().unique(),
  name: text(),
  createdAt: timestamp().notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

// ---------- sessions ----------
export const sessions = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  token: text().notNull().unique(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

// ---------- sites ----------
export const sites = pgTable("sites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: integer()
    .notNull()
    .references(() => users.id),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  theme: text().default("default"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// ---------- siteViews ----------
export const siteViews = pgTable("site_views", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  siteId: integer()
    .notNull()
    .references(() => sites.id),
  viewedAt: timestamp().notNull().defaultNow(),
  ip: text(),
  userAgent: text(),
});

// ---------- systemSettings ----------
export const systemSettings = pgTable("system_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: text().notNull().unique(),
  value: jsonb().notNull(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// ---------- accounts (OAuth, etc.) ----------
export const accounts = pgTable("accounts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  provider: text().notNull(),
  providerAccountId: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  expiresAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
});
