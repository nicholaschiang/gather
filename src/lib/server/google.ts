import { google } from "googleapis"
import { redirect } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { randomBytes } from "crypto"
import * as table from "$lib/server/db/schema"
import { db } from "$lib/server/db"
import { type RequestEvent } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { z } from "zod"
import * as auth from "$lib/server/auth"
import { v4 as uuid } from "uuid"
import { JwksClient } from "jwks-rsa"

const idTokenSchema = z.object({
  email: z.string(),
  email_verified: z.boolean(),
  name: z.string(),
  picture: z.string().url(),
  given_name: z.string(),
  family_name: z.string(),
})

const scopes = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/calendar.readonly",
]

export async function redirectToGoogle(state: Omit<table.AuthState, "id">) {
  // Generate a secure random state value.
  // TODO Should I be storing this in a cookie as well?
  const stateId = randomBytes(32).toString("base64url")
  await db.insert(table.authState).values({ ...state, id: stateId })

  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  )
  const authUrl = authClient.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    scope: scopes,
    // We need the prompt=consent to get a refresh token on every login.
    // Otherwise, Google will return a refresh token only on the first login.
    prompt: "consent",
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    // Include the state parameter to reduce the risk of CSRF attacks.
    state: stateId,
  })

  return redirect(302, authUrl)
}

const jwsClient = new JwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
  requestHeaders: {},
  timeout: 30000,
})

function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      (header, callback) => {
        jwsClient.getSigningKey(header.kid, (error, key) => {
          if (error) {
            reject(error)
          } else {
            const signingKey = key?.getPublicKey()
            callback(null, signingKey)
          }
        })
      },
      (error, decoded) => {
        if (error) {
          reject(error)
        } else {
          resolve(decoded)
        }
      },
    )
  })
}

export async function handleGoogleCallback(event: RequestEvent) {
  const url = new URL(event.request.url)
  const code = url.searchParams.get("code")
  const stateId = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error) throw new Error(error)
  if (!code) throw new Error("No authorization code found.")
  if (!stateId) throw new Error("State ID not found.")

  const states = await db
    .select()
    .from(table.authState)
    .where(eq(table.authState.id, stateId))
    .limit(1)
  const state = states.at(0)

  if (!state) throw new Error("State not found. Possible CSRF attack.")
  //} else if (url.searchParams.get('state') !== state) {
  //console.error('State mismatch. Possible CSRF attack.')

  // Delete the state once we read it. Ideally, we should use something like
  // Redis to store the state and set an expiry time so that state is ephemeral.
  await db.delete(table.authState).where(eq(table.authState.id, stateId))

  const authClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  )
  const { tokens } = await authClient.getToken(code)

  if (!tokens.id_token) throw new Error("No ID token found.")

  console.log("tokens", tokens)
  const decoded = await verifyToken(tokens.id_token)
  const idToken = idTokenSchema.parse(decoded)
  console.log("decoded", decoded)
  console.log("idToken", idToken)

  const results = await db
    .select()
    .from(table.user)
    .where(eq(table.user.email, idToken.email))

  let user = results.at(0)
  if (user) {
    // Update the user's refresh token.
    if (tokens.refresh_token)
      await db
        .update(table.user)
        .set({ googleRefreshToken: tokens.refresh_token })
        .where(eq(table.user.id, user.id))

    // Check if a user already exists with this email address.
    const sessionToken = auth.generateSessionToken()
    const session = await auth.createSession(sessionToken, user.id)
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
  } else {
    if (!tokens.refresh_token) throw new Error("No refresh token found.")

    // Register a new user with their information.
    const userId = uuid()
    user = {
      id: userId,
      picture: idToken.picture,
      givenName: idToken.given_name,
      familyName: idToken.family_name,
      name: idToken.name,
      email: idToken.email,
      emailVerified: idToken.email_verified,
      googleRefreshToken: tokens.refresh_token,
    }
    await db.insert(table.user).values(user)

    const sessionToken = auth.generateSessionToken()
    const session = await auth.createSession(sessionToken, userId)
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
  }
  console.log("user", user)

  if (state.gatheringIdToJoin) {
    await db.insert(table.relUserGathering).values({
      userId: user.id,
      gatheringId: state.gatheringIdToJoin,
    })
  }

  return redirect(302, state.redirectUrl)
}
