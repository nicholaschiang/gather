import { handleGoogleCallback } from "$lib/server/google"

export function load(event) {
  return handleGoogleCallback(event)
}
