import { createHash } from 'crypto';
import { ActionError } from '@repo/shared/types';
import { ALLOWED_HOSTS, ModuleInfo } from './moduleConstants';

/**
 * Parse and validate a module specifier into source information
 */
export function parseModuleSpecifier(specifier: string): ModuleInfo {
  // Create a cache key based on the original specifier
  const cacheKey = `module:${createHash('sha256').update(specifier).digest('hex')}`;
  
  try {
    if (specifier.startsWith('npm:')) {
      // npm:package-name@version/path format
      const npmPath = specifier.substring(4);
      const url = `https://unpkg.com/${npmPath}`;
      
      // Validate URL
      const urlObj = new URL(url);
      if (!ALLOWED_HOSTS.has(urlObj.hostname)) {
        throw new ActionError('error', 403, `Host not allowed: ${urlObj.hostname}`);
      }
      
      return { source: 'npm', url, cacheKey };
    } 
    else if (specifier.startsWith('deno:')) {
      // deno:module-url format
      const denoPath = specifier.substring(5);
      const url = denoPath.startsWith('http') ? denoPath : `https://deno.land/x/${denoPath}`;
      
      // Validate URL
      const urlObj = new URL(url);
      if (!ALLOWED_HOSTS.has(urlObj.hostname)) {
        throw new ActionError('error', 403, `Host not allowed: ${urlObj.hostname}`);
      }
      
      return { source: 'deno', url, cacheKey };
    } 
    else if (specifier.startsWith('http://') || specifier.startsWith('https://')) {
      // Direct URL format
      const urlObj = new URL(specifier);
      
      // Validate URL
      if (!ALLOWED_HOSTS.has(urlObj.hostname)) {
        throw new ActionError('error', 403, `Host not allowed: ${urlObj.hostname}`);
      }
      
      return { source: 'url', url: specifier, cacheKey };
    } 
    else {
      // Assume npm package without prefix
      const url = `https://unpkg.com/${specifier}`;
      return { source: 'npm', url, cacheKey };
    }
  } catch (error) {
    if (error instanceof ActionError) {
      throw error;
    }
    throw new ActionError('error', 400, `Invalid module specifier: ${specifier}`);
  }
} 