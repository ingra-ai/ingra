'use server';
import { Logger } from "@lib/logger";
import { Prisma } from "@prisma/client";
import { GoogleOAuthClient } from "@lib/google-oauth/client";
import { formatDistance, differenceInSeconds } from "date-fns";

type OAuthTokenProps = Prisma.OAuthTokenGetPayload<{
  select: {
    userId: true;
    accessToken: true;
    idToken: true;
    refreshToken: true;
    expiryDate: true;
  };
}> & {
  [key: string]: any;
};

/**
 * Renews the Google OAuth credentials by refreshing the access token if its almost expired.
 * @param oAuthToken - The OAuth token object containing the necessary properties.
 * @returns The new token response if successful, otherwise null.
 */
export const refreshGoogleOAuthCredentials = async (oAuthToken: OAuthTokenProps) => {
  const {
    userId = 'N/A',
    accessToken: access_token,
    refreshToken: refresh_token,
    idToken: id_token,
    expiryDate
  } = oAuthToken;

  // Check if the required properties are present
  if (!access_token || !refresh_token) {
    return null;
  }

  // Calculate the current date
  const currentDate = new Date();

  // Check if the expiry date is missing
  if ( !expiryDate ) {
    return null;
  }
  
  // Calculate the difference in seconds between the expiry date and the current date
  const diffInSeconds = differenceInSeconds(expiryDate, currentDate);
  if ( diffInSeconds > 0 ) {
    // Skipping since it has not been expired.
    return null;
  }

  // Check how long it has been expired
  const hasBeenExpiredFor = formatDistance(expiryDate, currentDate, { addSuffix: true });

  // Set the credentials for the OAuth2 client
  GoogleOAuthClient.setCredentials({
    access_token,
    id_token,
    refresh_token,
  });

  // Log the necessary information
  Logger.withTag('renewGoogleOAuthCredentials').withTag(userId).info('Refresh is necessary for token:', {
    hasBeenExpiredFor,
  });

  // Refresh the access token
  const newTokenResponse = await GoogleOAuthClient.refreshAccessToken().catch((err) => {
    Logger.withTag('renewGoogleOAuthCredentials').error('Error refreshing token', { err });
    return null;
  });

  return newTokenResponse;
}