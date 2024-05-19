
import type { ApiTryCatchReturnType } from './types';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';
import { ActionError } from '@lib/api-response';
import { AuthSessionResponse, getAuthSession } from '@app/auth/session';

/**
 * @todo Do additional check instead of using username.
 * @todo Do not use getAuthSession() since it relies on cookie, use apiKey to get auth session instead.
 * 
 */
export async function apiUserTryCatch<T>(apiKey: string, fn: (authSession: AuthSessionResponse) => Promise<ApiTryCatchReturnType<T>>): Promise<ApiTryCatchReturnType<T>> {
  return await apiTryCatch(async () => {
    const authSession = await getAuthSession();

    if ( !authSession ) {
      throw new ActionError('error', 400, `Invalid session.`);
    }

    return await fn(authSession);
  });
}