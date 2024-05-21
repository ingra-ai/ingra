'use server';
import { run } from '@app/api/utils/vm/run';
import { AuthSessionResponse } from '@app/auth/session';
import { ActionError } from '@v1/types/api-response';
import db from '@lib/db';
import { generateVmContextArgs } from './generateVmContextArgs';

export async function executeFunction(authSession: AuthSessionResponse, functionId: string, requestArgs: Record<string, any> = {}) {
  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  if (typeof requestArgs !== 'object') {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  // Fetch the function code
  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      ownerUserId: authSession.user.id,
    },
    select: {
      code: true,
      arguments: true,
    }
  });

  if (!functionRecord) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  const context = generateVmContextArgs(authSession, functionRecord.arguments, requestArgs);

  // Spread args into context
  Object.assign(context, requestArgs);

  return await run(functionRecord.code, context);
}
