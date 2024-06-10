'use server';
import { ActionError } from '@v1/types/api-response';
import { parseStartAndEnd, parseDate } from "@app/api/utils/chronoUtils";
import { setTimeout } from 'timers/promises';
import nodeFetch, { type RequestInfo, type RequestInit } from 'node-fetch';
import type { SandboxOutput } from '@app/api/utils/vm/types';
import type { VmContextArgs } from '@app/api/utils/vm/generateVmContextArgs';
import * as vm from 'vm';
import { Octokit } from '@octokit/rest';

const EXECUTION_TIMEOUT_SECONDS = 60;

async function withTimeout(promise: Promise<any>, timeoutSeconds = EXECUTION_TIMEOUT_SECONDS) {
  const timeoutPromise = setTimeout(timeoutSeconds * 1e3).then(() => {
    throw new ActionError('error', 408, 'Execution timed out exceeded ' + timeoutSeconds + ' seconds');
  });
  return Promise.race([promise, timeoutPromise]);
}

interface Sandbox {
  console: Pick<typeof console, 'log' | 'error'>;
  handler: ((ctx: VmContextArgs) => Promise<any>) | null;
  fetch: typeof nodeFetch;
  utils: {
    date: {
      parseStartAndEnd: typeof parseStartAndEnd,
      parseDate: typeof parseDate,
    }
  },
  Buffer: typeof Buffer;
  URLSearchParams: typeof URLSearchParams;
  Octokit: typeof Octokit;
}

// Run the code in a sandbox
export async function run(code: string, ctx: VmContextArgs) {
  // Create outputs
  const outputs: SandboxOutput[] = [];
  let apiCallCount = 0;

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
    fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => {
      apiCallCount++;
      return nodeFetch(input, init);
    },
    utils: {
      date: {
        parseStartAndEnd,
        parseDate,
      }
    },
    Buffer,
    URLSearchParams,
    Octokit,
    handler: null,
  };

  // Contextify the sandbox
  const context = vm.createContext(sandbox);

  // Run the code in the sandbox
  vm.runInContext(code, context, {
    timeout: EXECUTION_TIMEOUT_SECONDS * 1e3,
  });

  // Execute the function and handle results
  if (sandbox.handler) {
    const start = Date.now();
    const memoryUsageBefore = process.memoryUsage().heapUsed;

    const sandboxHandlerPromise = sandbox.handler(ctx).catch((err: any) => {
        outputs.push({
          type: 'error',
          message: err.message || 'Failed to execute function',
        });
        return void 0;
      }),
      result = await withTimeout(sandboxHandlerPromise);

    outputs.push({
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
      value: apiCallCount,
    }, {
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
