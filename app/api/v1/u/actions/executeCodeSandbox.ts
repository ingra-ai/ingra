import { ApiUserTryContextArg } from '@app/api/utils/types';
import * as vm from 'vm';

interface Sandbox {
  console: Console;
  handler: ((ctx: ApiUserTryContextArg) => Promise<any>) | null;
}

// Run the code in a sandbox
export async function executeCodeSandbox(code: string, ctx: ApiUserTryContextArg) {
  // Create a context for the VM
  const sandbox: Sandbox = {
    console: console,
    handler: null,
  };

  // Contextify the sandbox
  const context = vm.createContext(sandbox);

  // Run the code in the sandbox
  vm.runInContext(code, context);

  // Execute the function and handle results
  if (sandbox.handler) {
    try {
      const result = await sandbox.handler(ctx);
      console.log('Function executed successfully');
      return result;  // Return the result from the handler
    } catch (err) {
      console.error('Error executing function:', err);
      throw err;  // Rethrow or handle error as needed
    }
  } else {
    console.error('Handler function is not defined.');
    throw new Error('Handler function is not defined.');
  }
}
