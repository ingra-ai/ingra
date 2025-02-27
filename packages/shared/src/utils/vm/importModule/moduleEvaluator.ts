import * as vm from 'vm';
import { ActionError } from '@repo/shared/types';

/**
 * Evaluate a module in a VM and return its exports
 */
export function evaluateModule(code: string, importFn: (specifier: string) => Promise<any>): any {
  // Create a CommonJS module-like environment
  const module = { exports: {} };
  const exports = module.exports;
  
  try {
    // Create a wrapped code that executes in CommonJS style
    const wrappedCode = `
      (function(module, exports, require) {
        ${code}
      })(module, exports, require);
    `;
    
    // Create a minimal context with only what's needed
    const context = vm.createContext({
      module,
      exports,
      require: importFn,
      console,
      Buffer,
      setTimeout,
      clearTimeout,
      process: { env: {} },
      __dirname: '',
      __filename: '',
    });
    
    // Execute the code in the context
    vm.runInContext(wrappedCode, context, {
      timeout: 3000,
      displayErrors: true,
      filename: 'module.js',
    });
    
    return module.exports;
  } catch (error: any) {
    throw new ActionError('error', 500, `Failed to evaluate module: ${error.message}`);
  }
} 