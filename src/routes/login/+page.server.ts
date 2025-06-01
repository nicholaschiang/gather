import { redirectToGoogle } from "$lib/server/google"

export const actions = {
  login: () => redirectToGoogle({ redirectUrl: "/", gatheringIdToJoin: null }),
}
