import * as auth from "$lib/server/auth"
import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { eq, or } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"

export async function load(event) {
  if (!event.locals.user) return redirect(302, "/login")

  const creator = alias(table.user, "creator")
  const gatherings = await db
    .selectDistinct({
      id: table.gathering.id,
      title: table.gathering.title,
      description: table.gathering.description,
      creatorId: table.gathering.creatorId,
      creatorName: creator.name,
      creatorPicture: creator.picture,
    })
    .from(table.gathering)
    .innerJoin(creator, eq(creator.id, table.gathering.creatorId))
    .leftJoin(
      table.relUserGathering,
      eq(table.relUserGathering.gatheringId, table.gathering.id),
    )
    .where(
      or(
        eq(table.gathering.creatorId, event.locals.user.id),
        eq(table.relUserGathering.userId, event.locals.user.id),
      ),
    )
  const friends = await db
    .selectDistinct({
      id: table.user.id,
      name: table.user.name,
      email: table.user.email,
      picture: table.user.picture,
    })
    .from(table.user)
    .innerJoin(
      table.relUserFollow,
      eq(table.relUserFollow.followeeId, table.user.id),
    )
    .where(eq(table.relUserFollow.followerId, event.locals.user.id))
  return { user: event.locals.user, gatherings, friends }
}

export const actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401)
    }
    await auth.invalidateSession(event.locals.session.id)
    auth.deleteSessionTokenCookie(event)

    return redirect(302, "/login")
  },
}
