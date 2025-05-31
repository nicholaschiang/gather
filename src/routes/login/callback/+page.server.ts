import { google, type Auth } from "googleapis"
import { eq } from "drizzle-orm"
import { redirect } from "@sveltejs/kit"
import jwt from "jsonwebtoken"
import { z } from "zod"
import * as auth from "$lib/server/auth"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { v4 as uuid } from "uuid"

import creds from "$lib/credentials.json"

const authClient = new google.auth.OAuth2(
  creds.web.client_id,
  creds.web.client_secret,
  creds.web.redirect_uris[0],
)

// TODO: Get this from Google.
// https://www.googleapis.com/oauth2/v3/certs
const keys = {
  keys: [
    {
      kty: "RSA",
      n: "qGs032k_zvMoe1U7O9qC6k-oA1E3Ftz9z37EtjHBZ9sLYfDKPDsOhjS2HQCT69Ms6ET02wE2T9aw6gtjrhqiZPS_ZZhauy8OApqyMFGiJNuuyduUBRRvO_bo2_nE4wxCmDUDHh1wH-Wk04JctHtZA22F42f2n3nGQEQ-6wqSpbjiipwdXv8RQFmo0mObB3mnw1a81d-0kLrpnLeq-Bp0nFb5lJIan2sQOmuyC9r3q-9geM3E4JY6_0Beh4_zEM41c71f0qIfqznORQVpHbOmseH_zS75C91N8__sD7iOeO3zZEUO2LJ3OC_xj75BQf61NTXW_ia_-AoXhMnrGm-ZqQ",
      use: "sig",
      e: "AQAB",
      alg: "RS256",
      kid: "baa64efc13ef236be921f922e3a67cc99415db9b",
    },
    {
      use: "sig",
      alg: "RS256",
      e: "AQAB",
      kid: "bb43469594451820148b339c588aede305103919",
      n: "s9s2WkplZRxGVqfBk8o2jvr664mU7bdBB-YesCzBjlHYJetgAt_kKEPEmHmTlget39m02MW_YqDmyu6foDw8xcjnIcXUplHG3klEBHvtctHbP6SYwBiG-5Y3fqyen8JtqstkWXOFfSqVVot7rVSCSwPqtw-zToCXi_47MEuIFALmSLuOzVkk4POHWi7jGrieBxHNcs_xHTKngd0xO4ZpjscYMkdGbBO9-Q_VBEEW3ZtE6Ac34H7f_EF45kGBFSBdyFJjvuYpyXrsNvxZK1pE_snDuStPS95rajzqDhAckTryStCu6uuL02rPifIS-8JFUSceZiSYsbRVGkb5xTbQIQ",
      kty: "RSA",
    },
  ],
}

// Generate a secure random state value.
//const state = randomBytes(32).toString("hex")

const idTokenSchema = z.object({
  email: z.string(),
  email_verified: z.boolean(),
  name: z.string(),
  picture: z.string().url(),
  given_name: z.string(),
  family_name: z.string(),
})

export async function load(event) {
  const url = new URL(event.request.url)
  const code = url.searchParams.get("code")
  if (url.searchParams.has("error")) {
    console.error(url.searchParams.get("error"))
    //} else if (url.searchParams.get('state') !== state) {
    //console.error('State mismatch. Possible CSRF attack.')
  } else if (code == null) {
    console.error("No authorization code found.")
  } else {
    const { tokens } = await authClient.getToken(code)
    authClient.setCredentials(tokens)
    listEvents(authClient)

    if (tokens.id_token == null) throw new Error("No ID token found.")

    // TODO: Why do we use the first key from Google? Is it always?
    const key = { key: keys.keys[0], format: "jwk" as const }
    const decoded = jwt.verify(tokens.id_token, key)
    const idToken = idTokenSchema.parse(decoded)

    const results = await db
      .select()
      .from(table.user)
      .where(eq(table.user.email, idToken.email))

    const existingUser = results.at(0)
    if (existingUser) {
      // Check if a user already exists with this email address.
      const sessionToken = auth.generateSessionToken()
      const session = await auth.createSession(sessionToken, existingUser.id)
      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
    } else {
      if (tokens.refresh_token == null)
        throw new Error("No refresh token found.")

      // Register a new user with their information.
      const userId = uuid()
      await db
        .insert(table.user)
        .values({
          id: userId,
          googleRefreshToken: tokens.refresh_token,
          ...idToken,
        })

      const sessionToken = auth.generateSessionToken()
      const session = await auth.createSession(sessionToken, userId)
      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
    }
  }
  return redirect(302, "/demo/lucia")
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
    return
  }
  console.log("Upcoming 10 events:")
  events.map((event) => {
    const start = event.start?.dateTime || event.start?.date
    console.log(`${start} - ${event.summary}`)
  })
}
