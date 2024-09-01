import { ActionError } from '../types/api-response';
import type { ActionTryCatchReturnType } from './types';
import { actionTryCatch } from './actionTryCatch';
import { getAuthSession } from '../data/auth/session';
import { AuthSessionResponse } from '../data/auth/session/types';

export const actionAuthTryCatch = async <T>(fn: (authSession: AuthSessionResponse) => Promise<ActionTryCatchReturnType<T>>) => {
  return await actionTryCatch<T>(async () => {
    const authSession = await getAuthSession();

    if (!authSession) {
      throw new ActionError('error', 401, `Unauthorized session.`);
    }

    return await fn(authSession);
  });
};
