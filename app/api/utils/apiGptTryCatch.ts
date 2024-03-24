import { getUserByPhraseCode } from '@/data/user';
import { ActionError, type ApiError, type ApiSuccess } from '@lib/api-response';
import { APP_URL } from '@lib/constants';
import { apiTryCatch } from './apiTryCatch';
import { NextResponse } from 'next/server';

export type ApiGptTryCallbackArg = NonNullable<Awaited<ReturnType<typeof getUserByPhraseCode>>>;

export const apiGptTryCatch = async <T>(phraseCode: string, fn: (userWithProfile: ApiGptTryCallbackArg) => Promise<NextResponse<ApiError | ApiSuccess<T>>>): Promise<NextResponse<ApiError | ApiSuccess<T>>> => {
  return await apiTryCatch(async () => {
    const userWithProfile = await getUserByPhraseCode(phraseCode);

    if (!userWithProfile) {
      throw new ActionError('error', 400, `Invalid phrase code, consider to re-authenticate or visit ${APP_URL} to generate new phrase code`);
    }

    return await fn(userWithProfile);
  });
};
