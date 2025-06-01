import { db } from "$lib/server/db"
import { google } from "googleapis"
import { redirectToGoogle } from "$lib/server/google"
import * as table from "$lib/server/db/schema"
import { eq, and } from "drizzle-orm"
import { redirect, error, fail } from "@sveltejs/kit"
import { alias } from "drizzle-orm/sqlite-core"
import { env } from "$env/dynamic/private"
import { z } from "zod"

// Desired duration of the meeting in ms.
// TODO This should be configured in the gathering itself.
const DURATION_IN_MS = 1000 * 60 * 30
const DAY_IN_MS = 1000 * 60 * 60 * 24
const LOOKAHEAD = 7

export type TimePeriod = { start: Date; end: Date }

// Get the available meeting times for a gathering.
// Fetches availability from Google Calendar and finds overlaps.
async function getPossibleMeetingTimes(participants: table.User[]) {
  console.time("getPossibleMeetingTimes")

  // Start the search now, rounded up to the nearest 10 minutes.
  // Ex: If it is 4:32pm now, we look for times starting at 4:40pm.
  const now = new Date()
  const timeMin = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    Math.ceil(now.getMinutes() / 10) * 10,
  )
  const timeMax = new Date(timeMin.valueOf() + LOOKAHEAD * DAY_IN_MS)

  // Get all of the busy time periods for every participant.
  const busyTimePeriods: TimePeriod[] = []
  console.time("api")
  for (const participant of participants) {
    // TODO Perhaps we should store the access_token and other values to make this
    // more efficient? Right now, we refresh the access token every time.
    const tokens = { refresh_token: participant.googleRefreshToken }
    const authClient = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    )
    authClient.setCredentials(tokens)
    const calendar = google.calendar({ version: "v3", auth: authClient })
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
    console.log(`busy times for ${participant.email}:`, busy)
    busy?.forEach((busyTime) => {
      if (busyTime.start == null) throw new Error("Busy start is null.")
      if (busyTime.end == null) throw new Error("Busy end is null.")
      busyTimePeriods.push({
        start: new Date(busyTime.start),
        end: new Date(busyTime.end),
      })
    })
  }
  console.timeEnd("api")
  console.log("busy time periods:", busyTimePeriods)

  // Sort the busy time periods by start time, ascending (i.e. earlier first).
  //busyTimePeriods.sort((a, b) => a.start.valueOf() - b.start.valueOf())

  function overlaps(a: TimePeriod, b: TimePeriod) {
    return (
      a.start.valueOf() < b.end.valueOf() && b.start.valueOf() < a.end.valueOf()
    )
  }

  // Start at the timeMin and search for available slots of DURATION minutes.
  const freeTimePeriods: TimePeriod[] = []
  let start: Date = timeMin
  let end: Date
  while (start.valueOf() < timeMax.valueOf()) {
    end = new Date(start.valueOf() + DURATION_IN_MS)
    if (busyTimePeriods.some((b) => overlaps({ start, end }, b))) {
      console.warn("time period is busy:", { start, end })
    } else {
      freeTimePeriods.push({ start, end })
    }
    start = end
  }
  console.log("free time periods:", freeTimePeriods)
  console.timeEnd("getPossibleMeetingTimes")
  return freeTimePeriods
}

function isNotNull<T>(value: T | null): value is T {
  return value != null
}

export async function load(event) {
  const creator = alias(table.user, "creator")
  const rows = await db
    .select()
    .from(table.gathering)
    .innerJoin(creator, eq(creator.id, table.gathering.creatorId))
    .leftJoin(
      table.relUserGathering,
      eq(table.relUserGathering.gatheringId, table.gathering.id),
    )
    .leftJoin(table.user, eq(table.user.id, table.relUserGathering.userId))
    .where(eq(table.gathering.id, event.params.gatheringId))
  const row = rows.at(0)
  if (!row) error(404)
  const attendees = rows.map((row) => row.user).filter(isNotNull)
  return {
    user: event.locals.user,
    creator: row.creator,
    gathering: row.gathering,
    attendees,
    times: getPossibleMeetingTimes([row.creator, ...attendees]),
  }
}

export const actions = {
  join: async (event) => {
    if (!event.locals.user)
      return redirectToGoogle({
        redirectUrl: event.url.href,
        gatheringIdToJoin: event.params.gatheringId,
      })
    await db.insert(table.relUserGathering).values({
      userId: event.locals.user.id,
      gatheringId: event.params.gatheringId,
    })
  },
  delete: async (event) => {
    if (!event.locals.user) return error(401)
    const rows = await db
      .select()
      .from(table.gathering)
      .where(eq(table.gathering.id, event.params.gatheringId))
    const gathering = rows.at(0)
    if (!gathering) return error(404)
    if (gathering.creatorId !== event.locals.user.id) return error(403)
    await db
      .delete(table.gathering)
      .where(
        and(
          eq(table.gathering.id, event.params.gatheringId),
          eq(table.gathering.creatorId, event.locals.user.id),
        ),
      )
    return redirect(302, "/")
  },
  leave: async (event) => {
    if (!event.locals.user) return error(401)
    await db
      .delete(table.relUserGathering)
      .where(
        and(
          eq(table.relUserGathering.gatheringId, event.params.gatheringId),
          eq(table.relUserGathering.userId, event.locals.user.id),
        ),
      )
    return redirect(302, "/")
  },
  time: async (event) => {
    if (!event.locals.user) return error(401)
    const rows = await db
      .select()
      .from(table.gathering)
      .where(eq(table.gathering.id, event.params.gatheringId))
    const gathering = rows.at(0)
    if (!gathering) return error(404)
    if (gathering.creatorId !== event.locals.user.id) return error(403)
    const schema = z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    })
    const data = Object.fromEntries(await event.request.formData())
    const form = schema.safeParse(data)
    if (!form.success) return fail(400, { form })
    await db
      .update(table.gathering)
      .set({ start: form.data.start, end: form.data.end })
      .where(
        and(
          eq(table.gathering.id, event.params.gatheringId),
          eq(table.gathering.creatorId, event.locals.user.id),
        ),
      )
    return { form }
  },
}
