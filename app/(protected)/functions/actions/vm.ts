'use server';
import { ApiUserTryContextArg } from '@app/api/utils/types';
import { getAuthSession } from '@app/auth/session';
import { ActionError } from '@lib/api-response';
import db from '@lib/db';
import * as vm from 'vm';

export type SandboxOutput = {
  type: 'log' | 'error' | 'output';
  message: string;
};

interface Sandbox {
  console: Pick<Console, 'log' | 'error'>;
  handler: ((ctx: ApiUserTryContextArg) => Promise<any>) | null;
  outputs: SandboxOutput[];
}

// Run the code in a sandbox
async function executeCodeSandbox(code: string, ctx: ApiUserTryContextArg) {
  // Create a context for the VM
  const sandbox: Sandbox = {
    outputs: [],
    console: {
      log: (...args: any[]) => {
        sandbox.outputs.push({
          type: 'log',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
        });
      },
      error: (...args: any[]) => {
        sandbox.outputs.push({
          type: 'error',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
        });
      },
    },
    handler: null,
  };

  // Contextify the sandbox
  const context = vm.createContext(sandbox);

  // Run the code in the sandbox
  vm.runInContext(code, context);

  // Execute the function and handle results
  if (sandbox.handler) {
    const result = await sandbox.handler(ctx).catch((err: any) => {
      sandbox.outputs.push({
        type: 'error',
        message: err.message || 'Failed to execute function',
      });
      return void 0;
    });

    sandbox.outputs.push({
      type: 'output',
      message: typeof result === 'object' ? JSON.stringify(result) : result,
    });
  
    return {
      outputs: sandbox.outputs,
      result,
    };
  } else {
    throw new ActionError('error', 400, 'Handler function is not defined.');
  }
}

export async function runCodeSandbox(functionId: string, args: Record<string, any> = {}) {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 400, `Invalid session.`);
  }

  const context: ApiUserTryContextArg = {
    envVars: {
      oauthTokens: authSession.user.oauthTokens || []
    }
  };

  if ( typeof args !== 'object' ) {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  // Spread args into context
  Object.assign(context, args);

  // Fetch the function code
  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      ownerUserId: authSession.user.id,
    },
    select: {
      code: true,
    }
  });

  if ( !functionRecord ) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  return await executeCodeSandbox(functionRecord.code, context);
}