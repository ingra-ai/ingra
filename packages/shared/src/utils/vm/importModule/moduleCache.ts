import { kv } from '@vercel/kv'; // Vercel KV for caching
import { CACHE_TTL } from './moduleConstants';

/**
 * Check if a module is in cache and return it
 */
export async function getFromCache(cacheKey: string): Promise<string | null> {
  try {
    if (kv) {
      return await kv.get<string>(cacheKey);
    }
  } catch (error) {
    console.error('Cache error:', error);
  }
  return null;
}

/**
 * Store a module in cache
 */
export async function storeInCache(cacheKey: string, code: string): Promise<void> {
  try {
    if (kv) {
      await kv.set(cacheKey, code, { ex: CACHE_TTL });
    }
  } catch (error) {
    console.error('Cache storage error:', error);
  }
}

/**
 * In-memory module cache
 */
export class ModuleMemoryCache {
  private cache = new Map<string, any>();

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
} 