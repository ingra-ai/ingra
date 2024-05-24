import { AuthSessionResponse } from "@app/auth/session/types";

/**
 * Generates necessary user variables to run VM from the user's profile.
 * @param { AuthSessionResponse } authSession - The authentication session response object.
 * @returns { Record<string, any> } A record of user variables.
 */
export const generateUserVars = (authSession: AuthSessionResponse): Record<string, string> => {
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
        const prefix = token.service.split(/[^a-zA-Z0-9]/g).filter( Boolean ).join('_').toUpperCase();

        userVars[`${prefix}_ACCESS_TOKEN`] = token.accessToken;
        userVars[`${prefix}_ID_TOKEN`] = token.idToken || '';
        userVars[`${prefix}_EMAIL_ADDRESS`] = token.primaryEmailAddress || '';
      }
    }
  }

  if (authSession.user?.profile) {
    userVars['USER_NAME'] = authSession.user.profile.userName || '';
    userVars['USER_TIMEZONE'] = authSession.user.profile.timeZone || 'America/New_York';
  }

  return userVars;
}
