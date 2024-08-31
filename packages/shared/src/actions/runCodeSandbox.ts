'use server';
import { executeFunction } from '../utils/vm/executeFunction';
import { getAuthSession } from '../data/auth/session';
import { ActionError } from '../types/api-response';

export async function runCodeSandbox(functionId: string, args: Record<string, any> = {}, isMarketplace = false) {
  const authSession = await getAuthSession();

  if (!authSession) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  return await executeFunction(authSession, functionId, args, isMarketplace);
}
