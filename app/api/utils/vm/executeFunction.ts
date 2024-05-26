'use server';
import { run } from '@app/api/utils/vm/run';
import { AuthSessionResponse } from "@app/auth/session/types";
import { ActionError } from '@v1/types/api-response';
import db from '@lib/db';
import { generateVmContextArgs } from './generateVmContextArgs';
import { Logger } from '@lib/logger';

export async function executeFunction(authSession: AuthSessionResponse, functionId: string, requestArgs: Record<string, any> = {}) {
  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  if (typeof requestArgs !== 'object') {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  // Fetch the function code from user's functions
  const functionToExecute = await db.function.findUnique({
    where: {
      id: functionId,
      ownerUserId: authSession.user.id,
    },
    select: {
      code: true,
      arguments: true,
    }
  });

  if (!functionToExecute) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  const context = generateVmContextArgs(authSession, functionToExecute.arguments, requestArgs);

  // Spread args into context
  Object.assign(context, requestArgs);

  // Log the actions
  Logger.withTag('executeFunction').withTag(`user:${ authSession.user.id }`).info('Executing function', { functionId });

  return await run(functionToExecute.code, context);
}
