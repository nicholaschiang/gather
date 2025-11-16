import { sql } from "drizzle-orm"
import { sqliteTable, text, integer, primaryKey, check } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  picture: text("picture").notNull(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  googleRefreshToken: text("google_refresh_token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})
export type User = typeof user.$inferSelect
export type UserInsert = typeof user.$inferInsert

export const relUserFollow = sqliteTable(
  "rel_user_follow",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    followeeId: text("followee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followeeId] }),
    check("cannot_follow_self", sql`${table.followerId} != ${table.followeeId}`)
  ],
)

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})
export type Session = typeof session.$inferSelect
export type SessionInsert = typeof session.$inferInsert

export const authState = sqliteTable("auth_state", {
  id: text("id").primaryKey(),
  redirectUrl: text("redirect_url").notNull(),
  gatheringIdToJoin: text("gathering_id_to_join").references(
    () => gathering.id,
    { onDelete: "set null", onUpdate: "set null" },
  ),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})
export type AuthState = typeof authState.$inferSelect
export type AuthStateInsert = typeof authState.$inferInsert

export const gathering = sqliteTable("gathering", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  start: integer("start", { mode: "timestamp" }),
  end: integer("end", { mode: "timestamp" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})
export type Gathering = typeof gathering.$inferSelect
export type GatheringInsert = typeof gathering.$inferInsert

export const relUserGathering = sqliteTable(
  "rel_user_gathering",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    gatheringId: text("gathering_id")
      .notNull()
      .references(() => gathering.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.gatheringId] })],
)
