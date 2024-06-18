'use server';
import db from "@lib/db";
import type { Credentials } from "@lib/google-oauth/client";
import { Prisma } from "@prisma/client";

export async function createOAuthToken( userId: string, primaryEmailAddress: string, credentials: Credentials ) {
  if ( !userId || !primaryEmailAddress || !credentials?.access_token ) {
    return null;
  }

  // Check if user has oauthToken that is default
  const defaultOAuthToken = await db.oAuthToken.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  // If user has default oauthToken, then the new token is not default
  let isDefault = !defaultOAuthToken;

  const oauthToken = await db.oAuthToken.create({
    data: {
      userId: userId,
      primaryEmailAddress: primaryEmailAddress || '',
      service: 'google-oauth',
      accessToken: credentials.access_token || '',
      refreshToken: credentials.refresh_token || '',
      idToken: credentials.id_token || '',
      scope: credentials.scope || '',
      tokenType: credentials.token_type || '',
      isDefault,
      expiryDate: new Date(credentials.expiry_date || 0),
    },
  });

  return oauthToken;
}

export async function updateOAuthToken( userId: string, primaryEmailAddress: string, credentials: Credentials ) {
  if ( !userId || !primaryEmailAddress || !credentials?.access_token ) {
    return null;
  }

  const updateData: Prisma.OAuthTokenUpdateInput = {
    idToken: credentials.id_token || '',
    accessToken: credentials.access_token || '',
    scope: credentials.scope || '',
    tokenType: credentials.token_type || '',
    expiryDate: new Date(credentials.expiry_date || 0),
    updatedAt: new Date(),
  };

  if ( credentials.refresh_token ) {
    updateData.refreshToken = credentials.refresh_token;
  }

  const oauthToken = await db.oAuthToken.update({
    where: {
      userId_primaryEmailAddress: {
        userId,
        primaryEmailAddress,
      },
    },
    data: updateData,
  });

  return oauthToken;
}

export async function deleteOAuthToken( recordId: string, userId: string ) {
  const record = await db.oAuthToken.findFirst({
    where: {
      id: recordId,
      userId,
    },
  });

  if ( !record ) {
    return null;
  }

  return await db.oAuthToken.delete({
    where: {
      id: recordId,
      userId,
    },
  });
}

export async function setTokenAsDefault ( recordId: string, tokenService: string, userId: string ) {
  // Update all oauth token for the service to be not default
  await db.oAuthToken.updateMany({
    where: {
      userId,
      service: tokenService,
    },
    data: {
      isDefault: false,
    },
  });

  return await db.oAuthToken.update({
    where: {
      id: recordId,
      userId,
      service: tokenService,
    },
    data: {
      isDefault: true,
    },
  });
}