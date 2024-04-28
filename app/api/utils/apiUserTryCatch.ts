
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
      envVars: {
        oAuthTokens: userProfile.user?.oauthTokens || []
      }
    };

    return await fn(context);
  });
}