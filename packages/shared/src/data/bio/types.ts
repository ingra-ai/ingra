import type { Metadata } from "@repo/db/pinecone";

export type BioMetadata = Metadata & {
  userId: string;
  text: string;
  tags: string[];
  category: string;
  createdAt?: string;
  updatedAt?: string;
};