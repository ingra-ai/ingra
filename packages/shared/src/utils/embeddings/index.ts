import { OpenAI } from 'openai';
import { Logger } from '@repo/shared/lib/logger';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbeddings(input: string) {
  try {
    if ( !input || input.length === 0 || typeof input !== 'string' ) {
      throw new Error('Invalid input provided');
    }

    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: input,
    });

    if ( Array.isArray(response.data) && response.data.length > 0 && response.data?.[0]?.embedding ) {
      return response.data[0].embedding;
    } else {
      throw new Error('No embeddings found in the response');
    }
  } catch (error) {
    Logger.withTag('generateEmbeddings').error('Error generating embeddings:', error);
    throw error;
  }
}

