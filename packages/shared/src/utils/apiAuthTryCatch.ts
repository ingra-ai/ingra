import type { ApiTryCatchReturnType } from './types';
import { apiTryCatch } from './apiTryCatch';
import { ActionError } from '../types/api-response';
import { getAuthSession } from '../data/auth/session';
import { AuthSessionResponse, GetAuthSessionOptions } from '../data/auth/session/types';

export async function apiAuthTryCatch<T>(
  fn: (authSession: AuthSessionResponse) => Promise<ApiTryCatchReturnType<T>>,
  opts?: GetAuthSessionOptions
): Promise<ApiTryCatchReturnType<T>> {
  return await apiTryCatch(async () => {
    const authSession = await getAuthSession(opts);

    if (!authSession) {
      throw new ActionError('error', 401, `Unauthorized session.`);
    }

    return await fn(authSession);
  });
}
