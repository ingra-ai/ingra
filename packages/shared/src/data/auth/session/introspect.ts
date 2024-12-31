'use server';
import { refreshGoogleOAuthCredentials } from "@repo/shared/lib/google-oauth/refreshGoogleOAuthCredentials";
import { OAuthTokenProps } from "./types";
import { Logger } from '@repo/shared/lib/logger';
import { revokeOAuth, updateOAuthToken } from "@repo/shared/actions/oauth";

/**
 * Attempts to renew OAuth tokens if they exist and are almost expired.
 * Updates the database if there are any changes.
 * If the token cannot be refreshed, it will be revoked.
 * 
 * @param token - The OAuth token properties.
 * @returns The updated OAuth token or null if the token could not be refreshed.
 */
export async function introspectOAuthToken (token: OAuthTokenProps) {
  /**
   * 1. Refresh Google OAuth credentials if necessary (only works if it's a Google OAuth token).
   */
  const newOAuth = await refreshGoogleOAuthCredentials(token)
    .catch(async (err) => {
      /**
       * 1.5 Handle errors during the refresh process.
       * Log the error, revoke the OAuth token, and suggest user re-authentication.
       */
      Logger.withTag('introspectOAuthToken').withTag(`user|${token.userId}`).error('Error refreshing OAuth credentials:', err?.message);
      // Logger.withTag('introspectOAuthToken').withTag(`user|${token.userId}`).error('Deleting OAuth token due to potential corruption.', { id: token?.id });
      // await revokeOAuth(token);
      return null;
    });

  /**
   * 2. If new credentials are obtained, update the OAuth token in the database.
   */
  if (newOAuth?.credentials) {
    const updatedOAuthRecord = await updateOAuthToken({
      id: token.id,
      primaryEmailAddress: newOAuth.primaryEmailAddress,
      accessToken: newOAuth.credentials?.access_token || '',
      refreshToken: newOAuth.credentials?.refresh_token || '',
      idToken: newOAuth.credentials?.id_token || '',
      tokenType: newOAuth.credentials?.token_type || '',
      expiryDate: new Date(newOAuth.credentials?.expiry_date || 0),
      scope: newOAuth.credentials?.scope || '',
      service: token.service as 'google-oauth',
    });

    if (updatedOAuthRecord?.data && updatedOAuthRecord?.data?.id) {
      const updatedOAuth = updatedOAuthRecord.data;

      Logger.withTag('introspectOAuthToken').withTag(`user|${token.userId}`).info('Refreshed OAuth tokens:', {
        oauthId: updatedOAuth.id,
        service: updatedOAuth.service,
        expiryDate: updatedOAuth.expiryDate,
      });

      return updatedOAuth;
    }
  }

  return null;
}