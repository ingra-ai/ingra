import { ActionError } from '@repo/shared/types';
import { SandboxAnalytics } from '@repo/shared/utils/vm/getVmSandbox';
import { parseModuleSpecifier } from './moduleParser';
import { getFromCache, storeInCache, ModuleMemoryCache } from './moduleCache';
import { fetchModule } from './moduleFetcher';
import { evaluateModule } from './moduleEvaluator';

/**
 * Create the importModule function
 */
export function createImportModule(analytics: SandboxAnalytics) {
  // This function will hold loaded modules to avoid reloading them
  const moduleCache = new ModuleMemoryCache();
  
  // The actual importModule function that will be exposed to the sandbox
  const importModuleFn = async (specifier: string): Promise<any> => {
    try {
      // Increment API call count
      analytics.apiCallCount = (analytics.apiCallCount || 0) + 1;
      
      // Check local module cache first (in-memory)
      if (moduleCache.has(specifier)) {
        analytics.outputs.push({
          type: 'log',
          message: `Loaded module from memory: ${specifier}`,
        });
        return moduleCache.get(specifier);
      }
      
      // Parse and validate the module specifier
      const { source, url, cacheKey } = parseModuleSpecifier(specifier);
      
      // Try to get from cache first
      const cachedModule = await getFromCache(cacheKey);
      if (cachedModule) {
        analytics.outputs.push({
          type: 'log',
          message: `Loaded module from cache: ${specifier}`,
        });
        
        // Evaluate the module code and store in memory cache
        const moduleExports = evaluateModule(cachedModule, importModuleFn);
        moduleCache.set(specifier, moduleExports);
        
        return moduleExports;
      }
      
      // Not in cache, fetch from source
      analytics.outputs.push({
        type: 'log',
        message: `Fetching module: ${specifier}`,
      });
      
      const startTime = Date.now();
      const moduleCode = await fetchModule(url);
      const fetchTime = (Date.now() - startTime) / 1000;
      analytics.outputs.push({
        type: 'log',
        message: `Module fetched in ${fetchTime} seconds`,
      });
      
      // Store in cache for future use
      await storeInCache(cacheKey, moduleCode);
      
      // Evaluate the module code and store in memory cache
      const moduleExports = evaluateModule(moduleCode, importModuleFn);
      moduleCache.set(specifier, moduleExports);
      
      return moduleExports;
    } catch (error: any) {
      if (error instanceof ActionError) {
        analytics.outputs.push({
          type: 'error',
          message: `Import error: ${error.message}`,
        });
        throw error;
      }
      
      // For any other error types
      analytics.outputs.push({
        type: 'error',
        message: `Failed to import module ${specifier}: ${error.message}`,
      });
      throw new ActionError('error', 500, `Import error: ${error.message}`);
    }
  };
  
  return importModuleFn;
} 