import { db } from "$lib/server/db"
import { redirectToGoogle } from "$lib/server/google"
import * as table from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import { error } from "@sveltejs/kit"
import { alias } from "drizzle-orm/sqlite-core"

function isNotNull<T>(value: T | null): value is T {
  return value != null
}

export async function load(event) {
  const creator = alias(table.user, "creator")
  const rows = await db
    .select()
    .from(table.gathering)
    .innerJoin(creator, eq(creator.id, table.gathering.creatorId))
    .leftJoin(
      table.relUserGathering,
      eq(table.relUserGathering.gatheringId, table.gathering.id),
    )
    .leftJoin(table.user, eq(table.user.id, table.relUserGathering.userId))
    .where(eq(table.gathering.id, event.params.gatheringId))
  const row = rows.at(0)
  if (!row) error(404)
  return {
    user: event.locals.user,
    attendees: rows.map((row) => row.user).filter(isNotNull),
    creator: row.creator,
    gathering: row.gathering,
  }
}

export const actions = {
  join: async (event) => {
    if (!event.locals.user)
      return redirectToGoogle({
        redirectUrl: event.url.href,
        gatheringIdToJoin: event.params.gatheringId,
      })
    await db.insert(table.relUserGathering).values({
      userId: event.locals.user.id,
      gatheringId: event.params.gatheringId,
    })
  },
}
