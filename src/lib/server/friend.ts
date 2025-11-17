import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"

export async function createFriendship(userId1: string, userId2: string) {
  // Friends are people who follow each other.
  await db
    .insert(table.relUserFollow)
    .values([
      { followeeId: userId1, followerId: userId2 },
      { followeeId: userId2, followerId: userId1 },
    ])
    .onConflictDoNothing()
}
