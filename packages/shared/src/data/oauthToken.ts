'use server';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

type OAuthTokenCredentials = Pick<Prisma.OAuthTokenCreateInput, 'primaryEmailAddress' | 'service' | 'accessToken' | 'refreshToken' | 'idToken' | 'scope' | 'tokenType' | 'expiryDate'>;

export type GetActiveSessionByOAuthReturnType = Prisma.ActiveSessionGetPayload<{
  select: {
    userId: true;
    user: {
      include: {
        profile: true;
        oauthTokens: true;
        envVars: true;
        apiKeys: true;
      };
    };
  };
}>;

export async function createOAuthToken(credentials: OAuthTokenCredentials, userId: string) {
  if (!userId || !credentials.primaryEmailAddress || !credentials?.accessToken) {
    return null;
  }

  // Check if user has oauthToken that is default
  const defaultOAuthToken = await db.oAuthToken.findFirst({
    where: {
      userId,
      service: credentials.service,
      isDefault: true,
    },
  });

  // If user has default oauthToken, then the new token is not default
  let isDefault = !defaultOAuthToken;

  const oauthToken = await db.oAuthToken.create({
    data: {
      userId: userId,
      primaryEmailAddress: credentials.primaryEmailAddress || '',
      service: credentials.service,
      accessToken: credentials.accessToken || '',
      refreshToken: credentials.refreshToken || '',
      idToken: credentials.idToken || '',
      scope: credentials.scope || '',
      tokenType: credentials.tokenType || '',
      isDefault,
      expiryDate: new Date(credentials.expiryDate || 0),
    },
  });

  return oauthToken;
}

export async function updateOAuthToken(credentials: OAuthTokenCredentials, recordId: string, userId: string) {
  if (!userId || !credentials.primaryEmailAddress || !credentials?.accessToken) {
    return null;
  }

  const updateData: Prisma.OAuthTokenUpdateInput = {
    idToken: credentials.idToken || '',
    accessToken: credentials.accessToken || '',
    scope: credentials.scope || '',
    tokenType: credentials.tokenType || '',
    expiryDate: new Date(credentials.expiryDate || Date.now()),
    updatedAt: new Date(),
  };

  if (credentials.refreshToken) {
    updateData.refreshToken = credentials.refreshToken;
  }

  const oauthToken = await db.oAuthToken.update({
    where: {
      id: recordId,
      userId_primaryEmailAddress: {
        userId,
        primaryEmailAddress: credentials.primaryEmailAddress,
      },
    },
    data: updateData,
  });

  return oauthToken;
}

export async function getAppOAuthTokenByIdOrRefreshToken(idOrRefreshToken: string) {
  const record = await db.oAuthToken.findFirst({
    where: {
      service: 'ingra-oauth',
      OR: [
        {
          idToken: idOrRefreshToken,
        },
        {
          refreshToken: idOrRefreshToken,
        },
      ],
    },
  });

  if ( !record ) {
    return null;
  }

  return record;
}

export async function getActiveSessionByAccessToken(accessToken: string): Promise<GetActiveSessionByOAuthReturnType | null> {
  const record = await db.oAuthToken.findFirst({
    select: {
      id: true,
      userId: true,
      user: {
        include: {
          profile: true,
          oauthTokens: true,
          envVars: true,
          apiKeys: true,
        },
      },
    },
    where: {
      service: 'ingra-oauth',
      accessToken,
      expiryDate: {
        gte: new Date(),
      },
    },
  });

  if ( !record ) {
    return null;
  }

  return record;
}

export async function deleteOAuthToken(recordId: string, userId: string) {
  const record = await db.oAuthToken.findFirst({
    where: {
      id: recordId,
      userId,
    },
  });

  if (!record) {
    return null;
  }

  return await db.oAuthToken.delete({
    where: {
      id: recordId,
      userId,
    },
  });
}

export async function setTokenAsDefault(recordId: string, tokenService: string, userId: string) {
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
