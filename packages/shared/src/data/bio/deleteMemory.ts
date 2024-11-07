import { pcBio } from "@repo/db/pinecone";

/**
 * Deletes memories by IDs for a specific user.
 * @param userId - The unique identifier for the user.
 * @param memoryIds - An array of memory IDs to delete.
 * @returns An array of deleted memory IDs.
 */

export async function deleteMemory(
  userId: string,
  memoryIds: string[]
): Promise<string[]> {
  // Delete vectors that match the given IDs and userId
  await pcBio.deleteMany({
    filter: {
      memoryId: {
        $in: memoryIds
      },
      userId
    }
  });

  return memoryIds;
}
