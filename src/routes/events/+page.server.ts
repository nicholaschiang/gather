import { google, type Auth } from "googleapis"
import { redirect } from "@sveltejs/kit"

import creds from "$lib/credentials.json"

const authClient = new google.auth.OAuth2(
  creds.web.client_id,
  creds.web.client_secret,
  creds.web.redirect_uris[0],
)

export async function load(event) {
  if (!event.locals.user) {
    return redirect(302, "/login")
  }
  // TODO Perhaps we should store the access_token and other values to make this
  // more efficient? Right now, we refresh the access token every time.
  const tokens = { refresh_token: event.locals.user.googleRefreshToken }
  authClient.setCredentials(tokens)
  const events = listEvents(authClient)
  return { events }
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth: Auth.OAuth2Client) {
  const calendar = google.calendar({ version: "v3", auth })
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  })
  const events = res.data.items
  if (!events || events.length === 0) {
    console.log("No upcoming events found.")
    return []
  }
  console.log("Upcoming 10 events:")
  events.map((event) => {
    const start = event.start?.dateTime ?? event.start?.date
    console.log(`${start} - ${event.summary}`)
  })
  return events
}
