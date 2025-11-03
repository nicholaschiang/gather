import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { z } from "zod"
import { eq } from "drizzle-orm"

export async function load(event) {
  if (!event.locals.user) {
    return redirect(302, "/login")
  }
  const search = event.url.searchParams.get("search")
  if (!search) return { search: "", users: [] }
  const users = await db
    .selectDistinct({
      id: table.user.id,
      name: table.user.name,
      email: table.user.email,
      picture: table.user.picture,
    })
    .from(table.user)
    .where(eq(table.user.email, search))
  return { search, users }
}

const formSchema = z.object({ userId: z.string() })

export const actions = {
  default: async (event) => {
    if (!event.locals.user) return fail(401)
    const data = Object.fromEntries(await event.request.formData())
    const form = formSchema.safeParse(data)
    if (!form.success) return fail(400, { form })
    await db.insert(table.relUserFollow).values({
      followeeId: form.data.userId,
      followerId: event.locals.user.id,
    })
    return redirect(302, "/")
  },
}
