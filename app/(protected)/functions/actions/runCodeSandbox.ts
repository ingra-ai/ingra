'use server';
import { ApiUserTryContextArg } from '@app/api/utils/types';
import { getAuthSession } from '@app/auth/session';
import { ActionError } from '@lib/api-response';
import db from '@lib/db';
import { run } from './vm';

export async function runCodeSandbox(functionId: string, args: Record<string, any> = {}) {
  const authSession = await getAuthSession();

  if (!authSession) {
    throw new ActionError('error', 400, `Invalid session.`);
  }

  const context: ApiUserTryContextArg = {
    envVars: {
      oauthTokens: authSession.user.oauthTokens || []
    }
  };

  if (typeof args !== 'object') {
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

  if (!functionRecord) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  return await run(functionRecord.code, context);
}
