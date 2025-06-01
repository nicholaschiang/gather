import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"

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

export const authState = sqliteTable("auth_state", {
  id: text("id").primaryKey(),
  redirectUrl: text("redirect_url").notNull(),
  gatheringIdToJoin: text("gathering_id_to_join").references(
    () => gathering.id,
    { onDelete: "set null", onUpdate: "set null" },
  ),
})
export type AuthState = typeof authState.$inferSelect

export const gathering = sqliteTable("gathering", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  start: integer("start", { mode: "timestamp" }),
  end: integer("end", { mode: "timestamp" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
})
export type Gathering = typeof gathering.$inferSelect

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
  },
  (table) => [primaryKey({ columns: [table.userId, table.gatheringId] })],
)
