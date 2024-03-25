import { getUserByPhraseCode } from '@/data/user';
import { ActionError } from '@lib/api-response';
import { APP_GOOGLE_OAUTH_CALLBACK_URL, APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_URL } from '@lib/constants';
import { apiTryCatch } from './apiTryCatch';
import type { ApiGptTryCallbackArg, ApiTryCatchReturnType } from './types';
import { google } from 'googleapis';
import { type OAuth2Client } from 'google-auth-library';

// First overload signature for function without oAuthEmail
export function apiGptTryCatch<T>(
  phraseCode: string,
  fn: (userWithProfile: ApiGptTryCallbackArg) => Promise<ApiTryCatchReturnType<T>>
): Promise<ApiTryCatchReturnType<T>>;

// Second overload signature for function with oAuthEmail
export function apiGptTryCatch<T>(
  phraseCode: string,
  oAuthEmail: string,
  fn: (userWithProfile: ApiGptTryCallbackArg, oAuth2Client?: OAuth2Client) => Promise<ApiTryCatchReturnType<T>>
): Promise<ApiTryCatchReturnType<T>>;

// Implementation that covers both overloads
export async function apiGptTryCatch<T>(
  phraseCode: string,
  arg2: string | ((userWithProfile: ApiGptTryCallbackArg, oAuth2Client?: OAuth2Client) => Promise<ApiTryCatchReturnType<T>>),
  arg3?: (userWithProfile: ApiGptTryCallbackArg, oAuth2Client?: OAuth2Client) => Promise<ApiTryCatchReturnType<T>>
): Promise<ApiTryCatchReturnType<T>> {
  return await apiTryCatch(async () => {
    const userWithProfile = await getUserByPhraseCode(phraseCode);

    if (!userWithProfile) {
      throw new ActionError('error', 400, `Invalid phrase code, consider to re-authenticate or visit ${APP_URL} to generate new phrase code`);
    }

    // Determine if this is the overload with OAuthEmail
    if (typeof arg2 === 'string' && arg3) {
      const oAuthEmail = arg2;
      const fn = arg3;
      const userOAuthToken = userWithProfile.oauthTokens.find((token) => token.primaryEmailAddress === oAuthEmail);

      if (!userOAuthToken) {
        throw new ActionError('error', 400, `User does not have access to the calendar with email "${oAuthEmail}"`);
      }

      const oauth2Client = new google.auth.OAuth2(
        APP_GOOGLE_OAUTH_CLIENT_ID,
        APP_GOOGLE_OAUTH_CLIENT_SECRET,
        APP_GOOGLE_OAUTH_CALLBACK_URL
      );

      const credentials: Record<string, any> = {
        access_token: userOAuthToken.accessToken,
      };

      if (userOAuthToken.refreshToken) {
        credentials.refresh_token = userOAuthToken.refreshToken;
      }

      oauth2Client.setCredentials(credentials);

      return await fn(userWithProfile, oauth2Client);
    } else if (typeof arg2 === 'function') {
      return await arg2(userWithProfile);
    }

    throw new Error('Invalid function arguments');
  });
}