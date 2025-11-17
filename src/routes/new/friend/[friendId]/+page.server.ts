import { db } from "$lib/server/db"
import { redirectToGoogle } from "$lib/server/google"
import * as table from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import { redirect, error } from "@sveltejs/kit"
import { createFriendship } from "$lib/server/friend.js"

export async function load(event) {
  const rows = await db
    .select({ name: table.user.name, picture: table.user.picture })
    .from(table.user)
    .where(eq(table.user.id, event.params.friendId))
  const friend = rows.at(0)
  if (!friend) error(404)
  return { user: event.locals.user, friend }
}

export const actions = {
  accept: async (event) => {
    if (!event.locals.user)
      return redirectToGoogle({
        redirectUrl: "/",
        userIdToFriend: event.params.friendId,
      })
    await createFriendship(event.locals.user.id, event.params.friendId)
    return redirect(302, "/")
  },
}
