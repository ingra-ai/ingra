'use server';
import { executeFunction } from '@app/api/utils/vm/executeFunction';
import { getAuthSession } from '@app/auth/session';
import { ActionError } from '@lib/api-response';

export async function runCodeSandbox(functionId: string, args: Record<string, any> = {}) {
  const authSession = await getAuthSession();

  if (!authSession) {
    throw new ActionError('error', 400, `Invalid session.`);
  }

  return await executeFunction(authSession, functionId, args);
}
