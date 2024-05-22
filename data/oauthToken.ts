'use server';
import db from "@lib/db";
import type { Credentials } from "@lib/google-oauth/client";

export async function upsertOAuthToken( userId: string, primaryEmailAddress: string, credentials: Credentials ) {
  if ( !userId || !primaryEmailAddress || !credentials?.access_token ) {
    return null;
  }

  const oauthToken = await db.oAuthToken.upsert({
    where: {
      userId_primaryEmailAddress: {
        userId,
        primaryEmailAddress,
      },
    },
    create: {
      userId: userId,
      primaryEmailAddress: primaryEmailAddress || '',
      service: 'google-oauth',
      accessToken: credentials.access_token || '',
      refreshToken: credentials.refresh_token || '',
      idToken: credentials.id_token || '',
      scope: credentials.scope || '',
      tokenType: credentials.token_type || '',
      expiryDate: new Date(credentials.expiry_date || 0),
    },
    update: {
      idToken: credentials.id_token || '',
      accessToken: credentials.access_token || '',
      scope: credentials.scope || '',
      tokenType: credentials.token_type || '',
      expiryDate: new Date(credentials.expiry_date || 0),
      updatedAt: new Date(),
    },
  });

  return oauthToken;
}
