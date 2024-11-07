import type { BioMetadata } from "./types";
import { formatDistance } from 'date-fns/formatDistance';

export const mapBioMetadata = (metadata?: BioMetadata) => {
  return {
    memoryId: metadata?.memoryId || '',
    chunkIndex: metadata?.chunkIndex || 0,
    text: metadata?.text || '',
    tags: metadata?.tags,
    category: metadata?.category,
    createdAt: metadata?.createdAt ? formatDistance(metadata.createdAt, Date.now(), {
      addSuffix: true,
    }) : 'N/A',
    updatedAt: metadata?.updatedAt ? formatDistance(metadata.updatedAt, Date.now(), {
      addSuffix: true,
    }) : 'N/A',
  };
}