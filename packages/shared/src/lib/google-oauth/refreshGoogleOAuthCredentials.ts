'use server';
import { OAuthTokenProps } from '@repo/shared/data/auth/session/types';
import { Logger } from '@repo/shared/lib/logger';
import { GoogleOAuthClient, Credentials } from '@repo/shared/lib/google-oauth/client';
import { formatDistance, differenceInSeconds } from 'date-fns';

// Define a specific return type for clarity and to avoid inferred types
type RefreshTokenResponse = {
  userId: string;
  primaryEmailAddress: string;
  credentials: Credentials;
} | null;

/**
 * Renews the Google OAuth credentials by refreshing the access token if its almost expired.
 * Only works if it's a google-oauth token.
 * @param oAuthToken - The OAuth token object containing the necessary properties.
 * @returns The new token response if successful, otherwise null.
 */
export const refreshGoogleOAuthCredentials = async (oAuthToken: OAuthTokenProps) => {
  const { userId = 'N/A', primaryEmailAddress = '', accessToken: access_token, refreshToken: refresh_token, idToken: id_token, expiryDate } = oAuthToken;

  // Check if this is google-oauth
  if (oAuthToken.service !== 'google-oauth') {
    Logger.withTag('action|refreshGoogleOAuthCredentials').withTag(`user|${userId}`).error(`${ oAuthToken.service } is not a Google OAuth token.`);
    return null;
  }

  // Check if the required properties are present
  if (!access_token || !refresh_token) {
    Logger.withTag('action|refreshGoogleOAuthCredentials').withTag(`user|${userId}`).error('Missing either "access_token" or "refresh_token".');
    return null;
  }

  // Check if userId and primaryEmailAddress are present
  if (!userId || !primaryEmailAddress) {
    Logger.withTag('action|refreshGoogleOAuthCredentials').withTag(`user|${userId}`).error('Missing either "userId" or "primaryEmailAddress".');
    return null;
  }

  // Calculate the current date
  const currentDate = new Date();

  // Check if the expiry date is missing
  if (!expiryDate) {
    return null;
  }

  // Calculate the difference in seconds between the expiry date and the current date
  const diffInSeconds = differenceInSeconds(expiryDate, currentDate);
  if (diffInSeconds > 0) {
    Logger.withTag('action|refreshGoogleOAuthCredentials').withTag(`user|${userId}`).info(`Skipping since it has not been expired. ${diffInSeconds} seconds left.`);
    // Skipping since it has not been expired.
    return null;
  }

  // Check how long it has been expired
  const hasBeenExpiredFor = formatDistance(expiryDate, currentDate, {
    addSuffix: true,
  });

  // Set the credentials for the OAuth2 client
  GoogleOAuthClient.setCredentials({
    access_token,
    id_token,
    refresh_token,
  });

  // Log the necessary information
  Logger.withTag('action|refreshGoogleOAuthCredentials').withTag(`user|${userId}`).info('Refresh is necessary for token:', {
    primaryEmailAddress,
    hasBeenExpiredFor,
  });

  // Refresh the access token
  const newTokenResponse = await GoogleOAuthClient.refreshAccessToken();

  if (!newTokenResponse?.credentials) {
    Logger.withTag('action|refreshGoogleOAuthCredentials').withTag(`user|${userId}`).error('Failed to refresh access token.');
    return null;
  }

  const result: RefreshTokenResponse = {
    userId,
    primaryEmailAddress,
    credentials: newTokenResponse.credentials,
  };

  return result;
};
