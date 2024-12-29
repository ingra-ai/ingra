'use server';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

type OAuthTokenCredentials = Pick<Prisma.OAuthTokenCreateInput, 'primaryEmailAddress' | 'service' | 'accessToken' | 'refreshToken' | 'idToken' | 'scope' | 'code' | 'state' | 'tokenType' | 'expiryDate'>;

export type GetActiveSessionByOAuthReturnType = Prisma.ActiveSessionGetPayload<{
  select: {
    userId: true;
    user: {
      include: {
        profile: true;
        oauthTokens: true;
        envVars: true;
        apiKeys: false;
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
      code: credentials.code || '',
      state: credentials.state || '',
      isDefault,
      expiryDate: new Date(credentials.expiryDate || 0),
    },
  });

  return oauthToken;
}

export async function updateOAuthToken(credentials: Partial<OAuthTokenCredentials>, recordId: string, userId: string) {
  if (!userId || !credentials.primaryEmailAddress || !credentials?.accessToken || !credentials?.service) {
    return null;
  }

  const updateData: Prisma.OAuthTokenUpdateInput = {
    ...credentials,
    expiryDate: new Date(credentials.expiryDate || Date.now()),
    updatedAt: new Date(),
  };

  if (credentials.refreshToken) {
    updateData.refreshToken = credentials.refreshToken;
  }

  const oauthToken = await db.oAuthToken.update({
    where: {
      id: recordId,
      userId_primaryEmailAddress_service: {
        userId,
        primaryEmailAddress: credentials.primaryEmailAddress,
        service: credentials.service,
      },
    },
    data: updateData,
  });

  return oauthToken;
}

/**
 * Retrieves an OAuth token record by either code or token.
 *
 * @param {string} codeOrToken - The OAuth code or token to search for. Must be at least 10 characters long.
 * @returns {Promise<null | object>} - Returns the OAuth token record if found, otherwise returns null.
 *
 * @example
 * const token = await getAppOAuthTokenByCodeOrToken('someCodeOrToken');
 * if (token) {
 *   console.log('Token found:', token);
 * } else {
 *   console.log('Token not found');
 * }
 */
export async function getAppOAuthTokenByCodeOrToken(codeOrToken: string) {
  if ( codeOrToken?.length < 10 ) {
    return null;
  }

  const record = await db.oAuthToken.findFirst({
    include: {
      user: true,
    },
    where: {
      service: 'ingra-oauth',
      OR: [
        {
          code: codeOrToken,
        },
        {
          idToken: codeOrToken,
        },
        {
          refreshToken: codeOrToken,
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
          apiKeys: false,
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
