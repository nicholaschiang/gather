import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { v4 as uuid } from "uuid"
import { z } from "zod"

const formSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export const actions = {
  default: async (event) => {
    if (!event.locals.user) return fail(401)
    const data = Object.fromEntries(await event.request.formData())
    const form = formSchema.safeParse(data)
    if (!form.success) return fail(400, { form })
    const gatheringId = uuid()
    await db.insert(table.gathering).values({
      ...form.data,
      creatorId: event.locals.user.id,
      id: gatheringId,
    })
    return redirect(302, `/g/${gatheringId}`)
  },
}
