import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  expiresAt: timestamp("expires_at"),
});

export const systemSettings = pgTable("system_settings", {
  id: text("id").primaryKey(),
});

export const sites = pgTable("sites", {
  id: text("id").primaryKey(),
  slug: text("slug"),
  title: text("title"),
});

export const siteViews = pgTable("site_views", {
  id: text("id").primaryKey(),
  siteId: text("site_id"),
  views: integer("views").default(0),
});

export type User = typeof users.$inferSelect;
