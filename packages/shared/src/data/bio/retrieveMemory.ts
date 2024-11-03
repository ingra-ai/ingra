import { QueryResponse, pcBio } from "@repo/db/pinecone";
import { generateEmbeddings } from "@repo/shared/utils/embeddings";
import type { BioMetadata } from "./types";

/**
 * Retrieves memories for a specific user based on query text.
 * @param userId - The unique identifier for the user.
 * @param text - The query text to search for similar memories.
 * @param topK - Number of top results to retrieve.
 * @returns QueryResponse containing the search results.
 */

export async function retrieveMemory(
  userId: string,
  text: string,
  topK: number = 5
): Promise<QueryResponse<BioMetadata>> {
  // Generate embedding vector for the query text
  const queryVector = await generateEmbeddings(text);

  // Query Pinecone with vector and filter by userId
  const results = await pcBio.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: {
      userId,
    },
  }) as QueryResponse<BioMetadata>;

  return results;
}
