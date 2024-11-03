import { Pinecone, type RecordMetadata, QueryResponse as PineconeQueryResponse } from '@pinecone-database/pinecone'

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME || 'ingra-hubs';

if (!apiKey) {
  throw new Error('PINECONE_API_KEY is not set');
}

const pc = new Pinecone({
  apiKey: apiKey
});

export const pcHubs = pc.index(indexName);
export const pcBio = pc.index(indexName).namespace('bio');

export type Metadata = RecordMetadata;

export type QueryResponse<T extends Metadata = Metadata> = PineconeQueryResponse<T>;

export default pc;
