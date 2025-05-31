import * as auth from "$lib/server/auth"
import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { eq } from "drizzle-orm"

export async function load(event) {
  if (!event.locals.user) {
    return redirect(302, "/login")
  }
  const gatherings = db
    .select()
    .from(table.gathering)
    .where(eq(table.gathering.creatorId, event.locals.user.id))
  return { user: event.locals.user, gatherings }
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
