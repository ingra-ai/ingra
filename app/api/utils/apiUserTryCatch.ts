
import type { ApiTryCatchReturnType, ApiUserTryContextArg } from './types';
import { apiTryCatch } from './apiTryCatch';
import { getProfileByUsername } from '@/data/user';
import { ActionError } from '@lib/api-response';

export async function apiUserTryCatch<T>(username: string, apiKey: string, fn: (context: ApiUserTryContextArg) => Promise<ApiTryCatchReturnType<T>>): Promise<ApiTryCatchReturnType<T>> {
  return await apiTryCatch(async () => {
    if ( !username || typeof username !== 'string' ) {
      throw new ActionError('error', 400, `Invalid username.`);
    }

    const userProfile = await getProfileByUsername(username);

    if (!userProfile) {
      throw new ActionError('error', 400, `Unable to find profile.`);
    }

    const context: ApiUserTryContextArg = {
      userVars: {
        oauthTokens: (userProfile.user.oauthTokens || []).map((token) => ({
          scope: token.scope,
          tokenType: token.tokenType,
          service: token.service,
          idToken: token.idToken,
          accessToken: token.accessToken,
          primaryEmailAddress: token.primaryEmailAddress
        })),
        profile: {
          userName: userProfile?.userName || '',
          timeZone: userProfile?.timeZone || ''
        }
      }
    };

    return await fn(context);
  });
}