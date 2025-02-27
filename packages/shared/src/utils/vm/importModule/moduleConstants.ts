// Allowed hosts for security
export const ALLOWED_HOSTS = new Set([
  'unpkg.com',
  'cdn.jsdelivr.net',
  'esm.sh',
  'deno.land',
  'raw.githubusercontent.com',
  'esm.run',
  'cdn.skypack.dev',
  'ga.jspm.io',
  'fastly.jsdelivr.net',
  'cdn.pika.dev',
  'jspm.dev'
]);

// Maximum module size in bytes (5MB)
export const MAX_MODULE_SIZE = 5 * 1024 * 1024;

// Cache TTL in seconds (24 hours)
export const CACHE_TTL = 86400;

// Module source types
export type ModuleSource = 'npm' | 'deno' | 'url';

export interface ModuleInfo {
  source: ModuleSource;
  url: string;
  cacheKey: string;
};
