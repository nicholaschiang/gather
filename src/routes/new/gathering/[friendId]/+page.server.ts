import { fail, redirect } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { google, type calendar_v3 } from "googleapis"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { v4 as uuid } from "uuid"
import { z } from "zod"
import { eq } from "drizzle-orm"

function getCalendar(googleRefreshToken: string): calendar_v3.Calendar {
  // TODO Perhaps we should store the access_token and other values to make this
  // more efficient? Right now, we refresh the access token every time.
  const tokens = { refresh_token: googleRefreshToken }
  const authClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  )
  authClient.setCredentials(tokens)
  const calendar = google.calendar({ version: "v3", auth: authClient })
  return calendar
}

async function getEvents(
  calendar: calendar_v3.Calendar,
  timeMin: Date,
  timeMax: Date,
) {
  // TODO Get all of the visible/active calendars and get free/busy from all
  // of them. Perhaps let the user configure which calendars to check?
  const res = await calendar.events.list({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    calendarId: "primary",
  })
  const events = res.data.items
  return events
}

async function getBusyTimes(
  calendar: calendar_v3.Calendar,
  timeMin: Date,
  timeMax: Date,
) {
  // TODO Get all of the visible/active calendars and get free/busy from all
  // of them. Perhaps let the user configure which calendars to check?
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    },
  })
  const busy = res.data.calendars?.primary.busy
  return busy
}

export async function load(event) {
  if (!event.locals.user) return redirect(302, "/login")

  // We show two days at a time.
  const now = new Date()
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)

  console.log("timeMin", timeMin.toISOString())
  console.log("timeMax", timeMax.toISOString())

  // Get available times that this friend can meet.
  const friend = (
    await db
      .select({
        email: table.user.email,
        googleRefreshToken: table.user.googleRefreshToken,
      })
      .from(table.user)
      .where(eq(table.user.id, event.params.friendId))
      .limit(1)
  ).at(0)
  if (!friend) throw new Error("Friend not found!")
  const friendBusyTimes = await getBusyTimes(
    getCalendar(friend.googleRefreshToken),
    timeMin,
    timeMax,
  )
  console.log(`busy times for ${friend.email}:`, friendBusyTimes)

  // Get calendar events on your calendar.
  const yourEvents = await getEvents(
    getCalendar(event.locals.user.googleRefreshToken),
    timeMin,
    timeMax,
  )
  console.log(`events for ${event.locals.user.email}:`, yourEvents)

  // TODO We have weird behavior with recurring events and start/end times.
  return {
    timeMin,
    timeMax,
    yourEvents: yourEvents?.map((event) => ({
      id: event.id ?? uuid(),
      title: event.summary,
      start: event.start?.dateTime ? new Date(event.start.dateTime) : timeMin,
      end: event.end?.dateTime ? new Date(event.end.dateTime) : timeMin,
    })),
    friendBusyTimes: friendBusyTimes?.map((busyTime) => ({
      id: uuid(),
      start: busyTime.start ? new Date(busyTime.start) : timeMin,
      end: busyTime.end ? new Date(busyTime.end) : timeMin,
    })),
  }
}

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
