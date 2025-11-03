import { fail, error, redirect } from "@sveltejs/kit"
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

export type TimePeriod = {
  start: Date
  end: Date
}

function overlaps(a: TimePeriod, b: TimePeriod) {
  return a.start < b.end && a.end > b.start
}

// Get reasonable time periods for sleeping. We don't want to show users options
// to schedule a meeting at e.g. 3am, usually.
function getSleepTimes(
  timeMin: Date,
  timeMax: Date,
  ariseHour = 6,
  sleepHour = 23,
) {
  const sleepTimes: TimePeriod[] = []
  let start = timeMin
  while (start < timeMax) {
    sleepTimes.push(
      {
        start: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        end: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          ariseHour,
        ),
      },
      {
        start: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          sleepHour,
        ),
        end: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + 1,
        ),
      },
    )
    start = new Date(start.valueOf() + 24 * 60 * 60 * 1000)
  }
  console.log("sleepTimes", sleepTimes)
  return sleepTimes
}

function getAvailableTimes(
  busyTimes: TimePeriod[],
  durationInMs: number,
  timeMin: Date,
  timeMax: Date,
) {
  const availableTimes: TimePeriod[] = []
  let start = timeMin.valueOf()
  while (start < timeMax.valueOf()) {
    const timePeriod = {
      start: new Date(start),
      end: new Date(start + durationInMs),
    }
    if (!busyTimes.some((busyTime) => overlaps(busyTime, timePeriod))) {
      availableTimes.push(timePeriod)
    }
    start += durationInMs
  }
  return availableTimes
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
  const busyTimes = await getBusyTimes(
    getCalendar(friend.googleRefreshToken),
    timeMin,
    timeMax,
  )
  console.log(`busy times for ${friend.email}:`, busyTimes)
  const friendBusyTimes = (busyTimes ?? []).map((busyTime) => ({
    id: uuid(),
    start: busyTime.start ? new Date(busyTime.start) : timeMin,
    end: busyTime.end ? new Date(busyTime.end) : timeMin,
  }))

  // Get calendar events on your calendar.
  const events = await getEvents(
    getCalendar(event.locals.user.googleRefreshToken),
    timeMin,
    timeMax,
  )
  console.log(`events for ${event.locals.user.email}:`, events)
  const yourEvents = (events ?? []).map((event) => ({
    id: event.id ?? uuid(),
    title: event.summary,
    start: event.start?.dateTime ? new Date(event.start.dateTime) : timeMin,
    end: event.end?.dateTime ? new Date(event.end.dateTime) : timeMin,
  }))

  // Calculate the available times between you and your friend.
  const availableTimes = getAvailableTimes(
    [...yourEvents, ...friendBusyTimes, ...getSleepTimes(timeMin, timeMax)],
    60 * 60 * 1000,
    timeMin,
    timeMax,
  )
  console.log(`available times:`, availableTimes)

  // TODO We have weird behavior with recurring events and start/end times.
  return {
    timeMin,
    timeMax,
    yourEvents,
    friendBusyTimes,
    availableTimes,
  }
}

export const actions = {
  time: async (event) => {
    if (!event.locals.user) return error(401)
    const schema = z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    })
    const data = Object.fromEntries(await event.request.formData())
    const form = schema.safeParse(data)
    if (!form.success) return fail(400, { form })
    const gatheringId = uuid()
    await db.insert(table.gathering).values({
      title: "New gathering",
      start: form.data.start,
      end: form.data.end,
      creatorId: event.locals.user.id,
      id: gatheringId,
    })
    await db.insert(table.relUserGathering).values({
      userId: event.params.friendId,
      gatheringId,
    })
    return redirect(302, `/g/${gatheringId}`)
  },
}
