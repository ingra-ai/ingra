'use server';
import { ApiUserTryContextArg } from '@app/api/utils/types';
import { ActionError } from '@lib/api-response';
import * as vm from 'vm';

export type SandboxOutput = {
  type: 'log' | 'error' | 'output';
  message: string;
};

interface Sandbox {
  console: Pick<Console, 'log' | 'error'>;
  handler: ((ctx: ApiUserTryContextArg) => Promise<any>) | null;
  fetch: typeof fetch;
}

// Run the code in a sandbox
export async function run(code: string, ctx: ApiUserTryContextArg) {
  // Create outputs
  const outputs: SandboxOutput[] = [];

  // Create a context for the VM
  const sandbox: Sandbox = {
    console: {
      log: (...args: any[]) => {
        outputs.push({
          type: 'log',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
        });
      },
      error: (...args: any[]) => {
        outputs.push({
          type: 'error',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
        });
      },
    },
    fetch: fetch,
    handler: null,
  };

  // Contextify the sandbox
  const context = vm.createContext(sandbox);

  // Run the code in the sandbox
  vm.runInContext(code, context);

  // Execute the function and handle results
  if (sandbox.handler) {
    const result = await sandbox.handler(ctx).catch((err: any) => {
      outputs.push({
        type: 'error',
        message: err.message || 'Failed to execute function',
      });
      return void 0;
    });

    outputs.push({
      type: 'output',
      message: typeof result === 'object' ? JSON.stringify(result) : result,
    });
  
    return {
      outputs,
      result,
    };
  } else {
    throw new ActionError('error', 400, 'Handler function is not defined.');
  }
}
