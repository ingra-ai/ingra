
import type { ApiTryCatchReturnType } from './types';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';
import { ActionError } from '@lib/api-response';
import { AuthSessionResponse, getAuthSession } from '@app/auth/session';
import { VmContextArgs, generateVmContextArgs } from '@app/api/utils/vm/generateVmContextArgs';

/**
 * @todo Do additional check instead of using username.
 * @todo Do not use getAuthSession() since it relies on cookie, use apiKey to get auth session instead.
 * 
 */
export async function apiUserTryCatch<T>(username: string, apiKey: string, fn: (authSession: AuthSessionResponse, vmContext: VmContextArgs) => Promise<ApiTryCatchReturnType<T>>): Promise<ApiTryCatchReturnType<T>> {
  return await apiTryCatch(async () => {
    if ( !username || typeof username !== 'string' ) {
      throw new ActionError('error', 400, `Invalid username.`);
    }

    const authSession = await getAuthSession();

    if ( !authSession ) {
      throw new ActionError('error', 400, `Invalid session.`);
    }


    const context = generateVmContextArgs(authSession, {});

    return await fn(authSession, context);
  });
}