import { APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_GOOGLE_OAUTH_CALLBACK_URL } from "@lib/constants";
import { google } from "googleapis";

// Create a new OAuth2 client
export const GoogleOAuthClient = new google.auth.OAuth2(
  APP_GOOGLE_OAUTH_CLIENT_ID,
  APP_GOOGLE_OAUTH_CLIENT_SECRET,
  APP_GOOGLE_OAUTH_CALLBACK_URL // e.g., http://localhost:3000/api/auth/google-oauth/callback
);

export type RefreshAccessTokenCallback = Parameters<typeof GoogleOAuthClient.refreshAccessToken>[0];
export type GetTokenOptions = Parameters<typeof GoogleOAuthClient.getToken>[0];
export type Credentials = Parameters<typeof GoogleOAuthClient.setCredentials>[0];