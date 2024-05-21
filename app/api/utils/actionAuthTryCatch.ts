import { ActionError } from '@v1/types/api-response';
import type { ActionTryCatchReturnType } from './types';
import { getAuthSession, type AuthSessionResponse } from '@app/auth/session';
import { actionTryCatch } from './actionTryCatch';

export const actionAuthTryCatch = async <T>( fn: (authSession: AuthSessionResponse) => Promise<ActionTryCatchReturnType<T>> ) => {
  return await actionTryCatch<T>(async () => {
    const authSession = await getAuthSession();

    if ( !authSession ) {
      throw new ActionError('error', 401, `Unauthorized session.`);
    }

    return await fn(authSession);
  });
};
