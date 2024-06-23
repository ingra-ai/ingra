'use server';
import { ActionError } from '@v1/types/api-response';
import { setTimeout } from 'timers/promises';
import type { VmContextArgs } from '@app/api/utils/vm/generateVmContextArgs';
import * as vm from 'vm';
import { SandboxAnalytics, getVmSandbox } from './getVmSandbox';

const EXECUTION_TIMEOUT_SECONDS = 60;

async function withTimeout(promise: Promise<any>, timeoutSeconds = EXECUTION_TIMEOUT_SECONDS) {
  const timeoutPromise = setTimeout(timeoutSeconds * 1e3).then(() => {
    throw new ActionError('error', 408, 'Execution timed out exceeded ' + timeoutSeconds + ' seconds');
  });
  return Promise.race([promise, timeoutPromise]);
}


// Run the code in a sandbox
export async function run(code: string, ctx: VmContextArgs) {
  // Create outputs
  const analytics: SandboxAnalytics = {
    apiCallCount: 0,
    outputs: [],
  }

  // Create a context for the VM
  const sandbox = getVmSandbox(ctx, analytics);

  // Contextify the sandbox
  const context = vm.createContext(sandbox);

  try {
    // Run the code in the sandbox
    vm.runInContext(code, context, {
      timeout: EXECUTION_TIMEOUT_SECONDS * 1e3,
    });
  }
  catch ( err: any ) {
    analytics.outputs.push({
      type: 'error',
      message: err?.stack || err?.message || 'Failed to execute code.',
    });

    return {
      outputs: analytics.outputs,
      result: null,
    };
  }

  // Execute the function and handle results
  if (sandbox.handler) {
    const start = Date.now();
    const memoryUsageBefore = process.memoryUsage().heapUsed;

    const sandboxHandlerPromise = sandbox.handler(ctx).catch((err: any) => {
        analytics.outputs.push({
          type: 'error',
          message: err.message || 'Failed to execute function',
        });
        return void 0;
      }),
      result = await withTimeout(sandboxHandlerPromise);

    analytics.outputs.push({
      type: 'metric',
      metric: 'executionTime',
      value: Date.now() - start,
    }, {
      type: 'metric',
      metric: 'memoryUsed',
      value: process.memoryUsage().heapUsed - memoryUsageBefore,
    }, {
      type: 'metric',
      metric: 'apiCallCount',
      value: analytics.apiCallCount || 0,
    }, {
      type: 'output',
      message: typeof result === 'object' ? JSON.stringify(result) : result,
    });
  
    return {
      outputs: analytics.outputs,
      result,
    };
  } else {
    throw new ActionError('error', 400, 'Handler function is not defined.');
  }
}
