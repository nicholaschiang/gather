import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { z } from "zod"
import { eq } from "drizzle-orm"

const formSchema = z.object({
  givenName: z.string().min(1),
  familyName: z.string().min(1),
})

export async function load(event) {
  if (!event.locals.user) return redirect(302, "/login")
  return { user: event.locals.user }
}

export const actions = {
  default: async (event) => {
    if (!event.locals.user) return fail(401)
    const data = Object.fromEntries(await event.request.formData())
    const form = formSchema.safeParse(data)
    if (!form.success) return fail(400, { form })
    await db
      .update(table.user)
      .set({
        givenName: form.data.givenName,
        familyName: form.data.familyName,
        name: `${form.data.givenName} ${form.data.familyName}`,
      })
      .where(eq(table.user.id, event.locals.user.id))
    return redirect(302, "/")
  },
}
