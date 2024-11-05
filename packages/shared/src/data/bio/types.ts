import type { Metadata } from "@repo/db/pinecone";

export type BioMetadata = Metadata & {
  memoryId: string;
  userId: string;
  text: string;
  tags: string[];
  category: string;
  chunkIndex: number;
  createdAt?: number;
  updatedAt?: number;
};