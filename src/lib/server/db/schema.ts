import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  picture: text("picture").notNull(),
  given_name: text("given_name").notNull(),
  family_name: text("family_name").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  email_verified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  googleRefreshToken: text("google_refresh_token").notNull().unique(),
})
export type User = typeof user.$inferSelect

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
})
export type Session = typeof session.$inferSelect

/*
 *
 *export const gathering = sqliteTable("gathering", {
 *  id: text("id").primaryKey(),
 *  name: text("name").notNull(),
 *  description: text("description"),
 *  start: integer("start", { mode: "timestamp" }).notNull(),
 *  end: integer("end", { mode: "timestamp" }).notNull(),
 *  creatorId: text("creator_id").notNull().references(() => user.id),
 *})
 *export type Gathering = typeof gathering.$inferSelect
 *
 *export const relGatheringUser = sqliteTable("rel_gathering_user", {
 *  gatheringId: text("gathering_id")
 *    .notNull()
 *    .references(() => gathering.id),
 *  userId: text("user_id")
 *    .notNull()
 *    .references(() => user.id),
 *}, (table) => ([
 *    primaryKey({ columns: [table.gatheringId, table.userId] })
 *]))
 *export type RelGatheringUser = typeof relGatheringUser.$inferSelect
 */
