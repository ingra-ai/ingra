import { pcBio } from "@repo/db/pinecone";
import { generateUuid } from "@repo/shared/lib/utils";
import { generateEmbeddings } from "@repo/shared/utils/embeddings";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
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
  const memoryId = generateUuid();

  // Split the text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const textChunks = await textSplitter.splitText(text);

  // Generate embeddings for each chunk
  const embeddingPromises = textChunks.map((chunk) => generateEmbeddings(chunk));
  const embeddings = await Promise.all(embeddingPromises);

  // Prepare vectors for upsert
  const currentTime = new Date().getTime();
  const vectors = embeddings.map((embeddingVector, index) => {
    const enrichedMetadata: BioMetadata = {
      ...metadata,
      userId,
      text: textChunks[index] || '',
      chunkIndex: index,
      memoryId,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    return {
      id: `${memoryId}_${index}`,
      values: embeddingVector,
      metadata: enrichedMetadata,
    };
  });

  // Upsert the vector into Pinecone
  await pcBio.upsert(vectors);

  return memoryId;
}
