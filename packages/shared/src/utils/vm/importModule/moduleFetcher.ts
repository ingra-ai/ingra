import { ActionError } from '@repo/shared/types';
import { MAX_MODULE_SIZE } from './moduleConstants';

/**
 * Fetch a module from a remote source
 */
export async function fetchModule(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/javascript, text/javascript, application/json, text/plain, */*',
        'User-Agent': 'IngraModuleLoader/1.0',
      },
      method: 'GET',
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new ActionError(
        'error', 
        response.status, 
        `Failed to fetch module from ${url}: ${response.statusText}`
      );
    }

    // Check content length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_MODULE_SIZE) {
      throw new ActionError('error', 413, `Module size exceeds limit of ${MAX_MODULE_SIZE} bytes`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('javascript') && 
        !contentType.includes('json') && 
        !contentType.includes('text/plain')) {
      throw new ActionError('error', 415, `Unsupported content type: ${contentType}`);
    }

    return await response.text();
  } catch (error: any) {
    if (error instanceof ActionError) {
      throw error;
    }
    throw new ActionError('error', 500, `Failed to fetch module: ${error?.message || 'Unknown error'}`);
  }
}