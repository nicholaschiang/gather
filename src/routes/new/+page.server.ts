import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { v4 as uuid } from "uuid"
import { superValidate } from "sveltekit-superforms"
import { formSchema } from "./schema"
import { zod } from "sveltekit-superforms/adapters"

export async function load() {
  return {
    form: await superValidate(zod(formSchema)),
  }
}

export const actions = {
  default: async (event) => {
    if (!event.locals.user) return fail(401)
    const form = await superValidate(event, zod(formSchema))
    if (!form.valid) return fail(400, { form })
    const gatheringId = uuid()
    await db.insert(table.gathering).values({
      ...form.data,
      creatorId: event.locals.user.id,
      id: gatheringId,
    })
    return redirect(302, `/g/${gatheringId}`)
  },
}
