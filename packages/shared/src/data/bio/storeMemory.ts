import { pcBio } from "@repo/db/pinecone";
import { generateUuid } from "@repo/shared/lib/utils";
import { generateEmbeddings } from "@repo/shared/utils/embeddings";
import type { BioMetadata } from "./types";

/**
 * Stores a new memory vector in Pinecone for a specific user.
 * @param userId - The unique identifier for the user.
 * @param text - The text content to be stored and embedded.
 * @param metadata - Additional metadata for personalization.
 * @param memoryId - Optional memory ID, if updating an existing memory.
 * @returns The ID of the stored memory.
 */

export async function storeMemory(
  userId: string,
  text: string,
  metadata: BioMetadata
): Promise<string> {
  // Generate embedding vector for the input text
  const embeddingVector = await generateEmbeddings(text);
  const id = generateUuid();
  const currentTime = new Date().getTime();

  // Include userId and createdAt in metadata
  const enrichedMetadata: BioMetadata = {
    ...metadata,
    text,
    userId,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  // Upsert the vector into Pinecone
  await pcBio.upsert([
    {
      id,
      values: embeddingVector,
      metadata: enrichedMetadata,
    },
  ]);

  return id;
}
