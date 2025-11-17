import { redirect } from "@sveltejs/kit"

export async function load(event) {
  if (!event.locals.user) return redirect(302, "/login")

  // Profile link that invites whoever opens it to becomes friends with the user.
  const profileLink = `${event.url.protocol}//${event.url.host}/new/friend/${event.locals.user.id}`

  return { user: event.locals.user, profileLink }
}
