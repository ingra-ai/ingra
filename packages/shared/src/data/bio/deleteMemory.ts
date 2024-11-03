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
  // Search first
  const existingMemories = await pcBio.fetch(memoryIds);

  // Check if any memories don't belong to users
  const confirmedUserMemories = Object.values(existingMemories.records).map((record) => {
    if (record.metadata?.userId !== userId) {
      return null;
    }

    return record.id;
  }).filter(Boolean) as string[];

  // Delete vectors that match the given IDs and userId
  await pcBio.deleteMany(confirmedUserMemories);

  return confirmedUserMemories;
}
