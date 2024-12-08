import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';

/**
 * Generates necessary user variables to run VM from the user's profile.
 * @param { AuthSessionResponse } authSession - The authentication session response object.
 * @returns { Record<string, any> } A record of user variables.
 */
export const generateUserVars = (authSession: Pick<AuthSessionResponse, 'user'>): Record<string, string> => {
  /**
   * Generate necessary user variables to run VM from the user's profile
   * 1. OAuthTokens - e.g. GOOGLE_OAUTH_ACCESS_TOKEN
   * 2. Profile - e.g. USER_NAME, USER_TIMEZONE
   */
  const userVars: Record<string, string> = {};

  const userOauths = authSession.user?.oauthTokens || [];

  if (userOauths.length) {
    for (let i = 0; i < userOauths.length; i++) {
      const token = userOauths[i];

      if (token?.service) {
        const prefix = token.service
          .split(/[^a-zA-Z0-9]/g)
          .filter(Boolean)
          .join('_')
          .toUpperCase();

        /**
         * Each token's service, only has 1 default. If it's default and the userVars is not set, set it.
         * This will allow the user to run VM with the default token per service.
         */

        if (token.isDefault) {
          userVars[`${prefix}_ACCESS_TOKEN`] = token.accessToken;
          userVars[`${prefix}_ID_TOKEN`] = token.idToken || '';
          userVars[`${prefix}_EMAIL_ADDRESS`] = token.primaryEmailAddress || '';
        } else if (
          /**
           * If user has no default set, then set the first token as default.
           */
          !userVars[`${prefix}_ACCESS_TOKEN`]
        ) {
          userVars[`${prefix}_ACCESS_TOKEN`] = token.accessToken;
          userVars[`${prefix}_ID_TOKEN`] = token.idToken || '';
          userVars[`${prefix}_EMAIL_ADDRESS`] = token.primaryEmailAddress || '';
        }
      }
    }
  }

  if (authSession.user?.profile) {
    userVars['USER_NAME'] = authSession.user.profile.userName || '';
    userVars['USER_TIMEZONE'] = authSession.user.profile.timeZone || 'America/New_York';
  }

  return userVars;
};
