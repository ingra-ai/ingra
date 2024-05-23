
import type { ApiTryCatchReturnType } from './types';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';
import { ActionError } from '@v1/types/api-response';
import { getAuthSession } from '@app/auth/session';
import { AuthSessionResponse } from '@app/auth/session/types';

export async function apiAuthTryCatch<T>(fn: (authSession: AuthSessionResponse) => Promise<ApiTryCatchReturnType<T>>): Promise<ApiTryCatchReturnType<T>> {
  return await apiTryCatch(async () => {
    const authSession = await getAuthSession();

    if ( !authSession ) {
      throw new ActionError('error', 401, `Unauthorized session.`);
    }

    return await fn(authSession);
  });
}