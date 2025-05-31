import { google } from "googleapis"
import { env } from "$env/dynamic/private"

const scopes = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/calendar.readonly",
]

// Generate a secure random state value.
//const state = randomBytes(32).toString("hex")

export async function load() {
  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  )
  const authorizationUrl = authClient.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    // TODO: Include the state parameter to reduce the risk of CSRF attacks.
    //state: state,
  })
  return { authorizationUrl }
}
