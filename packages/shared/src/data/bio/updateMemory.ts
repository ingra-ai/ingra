import { pcBio } from "@repo/db/pinecone";
import { generateEmbeddings } from "@repo/shared/utils/embeddings";
import type { BioMetadata } from "./types";

/**
 * Updates an existing memory for a specific user.
 * @param userId - The unique identifier for the user.
 * @param memoryId - The ID of the memory to update.
 * @param text - The new text content for the memory.
 * @param metadata - Additional metadata for personalization.
 * @returns The ID of the updated memory.
 */

export async function updateMemory(
  userId: string,
  memoryId: string,
  text: string,
  metadata: BioMetadata
): Promise<string> {
  let memoryIdToUpdate = memoryId;

  // Generate new embedding vector for the updated text
  const updatedEmbeddingVector = await generateEmbeddings(text);

  // Validate if memoryId is a chunked memory ID
  if (memoryId.includes('_')) {
    memoryIdToUpdate = memoryId.split('_')?.[0] || '';
  }

  if ( !memoryIdToUpdate ) {
    throw new Error('Failed to update, invalid memory ID');
  }

  // Fetch first to get the existing metadata
  const existingMemory = await pcBio.query({
    id: memoryId,
    topK: 1,
    filter: {
      memoryId: memoryIdToUpdate,
      userId,
    },
  });

  const foundMemory = existingMemory.matches?.[0];

  if (!foundMemory) {
    throw new Error('Failed to update, memory not found');
  }

  // Include userId and update updatedAt in metadata
  const enrichedMetadata: BioMetadata = {
    ...(foundMemory?.metadata || {}),
    ...metadata,
    text,
    updatedAt: new Date().getTime(),
  };

  // Upsert the updated vector into Pinecone
  await pcBio.upsert([
    {
      id: memoryId,
      values: updatedEmbeddingVector,
      metadata: enrichedMetadata,
    },
  ]);

  return memoryId;
}
