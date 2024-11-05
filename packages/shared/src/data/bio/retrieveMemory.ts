import { QueryResponse, pcBio } from "@repo/db/pinecone";
import { generateEmbeddings } from "@repo/shared/utils/embeddings";
import type { BioMetadata } from "./types";
 
export type AdditionalFilterType = {
  createdAt?: {
    $gte?: number;
    $lte?: number;
  };
  updatedAt?: {
    $gte?: number;
    $lte?: number;
  };
};

export type FilterOptions = {
  dateFilterType?: 'createdAt' | 'updatedAt' | 'both';
  dateFilterOperator?: 'AND' | 'OR';
};

/**
 * Retrieves memories for a specific user based on query text and filters.
 * @param userId - The unique identifier for the user.
 * @param text - The query text to search for similar memories.
 * @param topK - Number of top results to retrieve.
 * @param extraFilters - Additional filters for date ranges.
 * @param filterOptions - Options to specify logical operator and date fields.
 * @returns QueryResponse containing the search results.
 */
export async function retrieveMemory(
  userId: string,
  text: string,
  topK: number = 5,
  extraFilters?: AdditionalFilterType,
  filterOptions?: FilterOptions
): Promise<QueryResponse<BioMetadata>> {
  // Generate embedding vector for the query text or use a zero vector
  const queryVector = await generateEmbeddings(text);

  // Build the metadata filter
  let filter: Record<string, any> = { 
    userId 
  };

  const dateFilterType = filterOptions?.dateFilterType || 'createdAt';
  const dateFilterOperator = filterOptions?.dateFilterOperator || 'AND';

  const conditions = [];

  // Build conditions based on dateFilterType
  if (dateFilterType === 'createdAt' || dateFilterType === 'both') {
    if (extraFilters?.createdAt) {
      conditions.push({ createdAt: extraFilters.createdAt });
    }
  }

  if (dateFilterType === 'updatedAt' || dateFilterType === 'both') {
    if (extraFilters?.updatedAt) {
      conditions.push({ updatedAt: extraFilters.updatedAt });
    }
  }

  // Combine conditions using the specified logical operator
  if (conditions.length > 0) {
    if (dateFilterOperator === 'OR') {
      filter.$or = conditions;
    } else {
      // Default to AND logic
      conditions.forEach((condition) => {
        Object.assign(filter, condition);
      });
    }
  }

  // Query Pinecone with vector and filters
  const results = (await pcBio.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter,
  })) as QueryResponse<BioMetadata>;

  return results;
}
