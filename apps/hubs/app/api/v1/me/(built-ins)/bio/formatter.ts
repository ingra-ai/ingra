import { QueryResponse } from "@repo/db/pinecone";
import { AdditionalFilterType, type BioMetadata } from "@repo/shared/data/bio";
import { formatDistance } from "date-fns/formatDistance";

export function formatRetrieveMemoryMessage(results: QueryResponse<BioMetadata>, extraFilters: AdditionalFilterType) {
  const totalMemories = results.matches.length;
  let msg = `Found ${totalMemories} memor${totalMemories !== 1 ? 'ies' : 'y'}`;

  const dateDescriptions = [];
  const now = new Date();

  // Helper function to format dates nicely
  const formatDate = (dateString: number) => {
    const date = new Date(dateString);
    return formatDistance(date, now, { addSuffix: true });
  };

  if (extraFilters.createdAt) {
    const createdAtFilter = extraFilters.createdAt;
    const parts = [];

    if (createdAtFilter.$gte && createdAtFilter.$lte) {
      parts.push(`created between ${formatDate(createdAtFilter.$gte)} and ${formatDate(createdAtFilter.$lte)}`);
    } else if (createdAtFilter.$gte) {
      parts.push(`created from ${formatDate(createdAtFilter.$gte)} until now`);
    } else if (createdAtFilter.$lte) {
      parts.push(`created up to ${formatDate(createdAtFilter.$lte)} ago`);
    }

    if (parts.length > 0) {
      dateDescriptions.push(parts.join(' '));
    }
  }

  if (extraFilters.updatedAt) {
    const updatedAtFilter = extraFilters.updatedAt;
    const parts = [];

    if (updatedAtFilter.$gte && updatedAtFilter.$lte) {
      parts.push(`updated between ${formatDate(updatedAtFilter.$gte)} and ${formatDate(updatedAtFilter.$lte)}`);
    } else if (updatedAtFilter.$gte) {
      parts.push(`updated from ${formatDate(updatedAtFilter.$gte)} until now`);
    } else if (updatedAtFilter.$lte) {
      parts.push(`updated up to ${formatDate(updatedAtFilter.$lte)} ago`);
    }

    if (parts.length > 0) {
      dateDescriptions.push(parts.join(' '));
    }
  }

  if (dateDescriptions.length > 0) {
    msg += ` that were ${dateDescriptions.join(' and ')}`;
  }

  return msg + '.';
}