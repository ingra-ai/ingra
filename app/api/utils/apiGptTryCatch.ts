import { getUserByPhraseCode } from '@/data/user';
import { ActionError } from '@lib/api-response';
import { APP_URL } from '@lib/constants';
import { apiTryCatch } from './apiTryCatch';
import type { ApiGptTryCallbackArg, ApiTryCatchReturnType } from './types';

export const apiGptTryCatch = async <T>(phraseCode: string, fn: (userWithProfile: ApiGptTryCallbackArg) => Promise<ApiTryCatchReturnType<T>>): Promise<ApiTryCatchReturnType<T>> => {
  return await apiTryCatch(async () => {
    const userWithProfile = await getUserByPhraseCode(phraseCode);

    if (!userWithProfile) {
      throw new ActionError('error', 400, `Invalid phrase code, consider to re-authenticate or visit ${APP_URL} to generate new phrase code`);
    }

    return await fn(userWithProfile);
  });
};
