import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { eq } from "drizzle-orm"

async function getGathering(gatheringId: string) {
  const [gathering] = await db
    .select()
    .from(table.gathering)
    .where(eq(table.gathering.id, gatheringId))
  if (!gathering) throw new Error("Gathering not found!")
  return gathering
}

export function load(event) {
  return { gathering: getGathering(event.params.gatheringId) }
}
