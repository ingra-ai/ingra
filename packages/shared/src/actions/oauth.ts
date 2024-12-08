'use server';

import { ActionError } from '@repo/shared/types';
import { OAuthToken } from '@repo/db/prisma';
import { actionAuthTryCatch } from '@repo/shared/utils/actionAuthTryCatch';
import { clearAuthCaches } from '@repo/shared/data/auth/session/caches';
import { 
  deleteOAuthToken, 
  setTokenAsDefault as dataSetTokenAsDefault, 
  createOAuthToken as dataCreateOAuthToken,
  updateOAuthToken as dataUpdateOAuthToken,
} from '@repo/shared/data/oauthToken';
import { z } from 'zod';
import { oAuthTokenSchema, updateOAuthTokenSchema } from '@repo/shared/schemas/oAuthToken';
import { validateAction } from '@repo/shared/lib/action-helpers';
import { createAppCredentials } from '@repo/shared/data/auth';
import db from '@repo/db/client';

export const createOAuthToken = async (values: z.infer<typeof oAuthTokenSchema>) => {
  const validatedValues = await validateAction(oAuthTokenSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const oAuthToken = await dataCreateOAuthToken(data, authSession.user.id);

    return {
      status: 'ok',
      message: 'oAuthToken created!',
      data: oAuthToken,
    };
  });
};

export const updateOAuthToken = async (values: z.infer<typeof updateOAuthTokenSchema>) => {
  const validatedValues = await validateAction(updateOAuthTokenSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const oAuthToken = await dataUpdateOAuthToken(data, data.id, authSession.user.id);

    return {
      status: 'ok',
      message: 'oAuthToken updated!',
      data: oAuthToken,
    };
  });
};

export const getOrCreateAppOAuthToken = async (clientId: string, scope: string, shouldRenew = false) => {
  return await actionAuthTryCatch(async (authSession) => {
    // Check if current user has ingra-oauth oAuthToken
    let appOAuthToken = await db.oAuthToken.findFirst({
      where: {
        userId: authSession.userId,
        service: 'ingra-oauth'
      },
    });

    // If it doesn't exist, create one
    if (!appOAuthToken) {
      const appCredentials = await createAppCredentials(authSession, clientId, scope, 86400);

      appOAuthToken = await dataCreateOAuthToken({
        ...appCredentials,
        primaryEmailAddress: authSession.user.email,
        service: 'ingra-oauth',
        scope: scope || '',
      }, authSession.user.id);
    }
    else if ( appOAuthToken && appOAuthToken.id && shouldRenew ) {
      const appCredentials = await createAppCredentials(authSession, clientId, scope, 86400);

      appOAuthToken = await dataUpdateOAuthToken({
        ...appCredentials,
        primaryEmailAddress: authSession.user.email,
        service: 'ingra-oauth',
        scope: scope || '',
      }, appOAuthToken.id, authSession.user.id);
    }

    // If appOAuthToken is still not found, return error
    if (!appOAuthToken) {
      throw new ActionError('error', 400, 'Failed to retrieve token!');
    }

    return {
      status: 'ok',
      message: 'Token retrieved successfully!',
      data: appOAuthToken,
    };
  });
}

export const revokeOAuth = async (token: OAuthToken) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await deleteOAuthToken(token.id, authSession.user.id);

    if (!result) {
      throw new ActionError('error', 400, 'Failed to revoke token!');
    }

    // Delete kv caches for this user
    await clearAuthCaches(authSession);

    return {
      status: 'ok',
      message: 'Token has been revoked!',
      data: null,
    };
  });
};

export const setTokenAsDefault = async (token: OAuthToken) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataSetTokenAsDefault(token.id, token.service, authSession.user.id);

    if (!result) {
      throw new ActionError('error', 400, 'Failed to set token as default!');
    }

    // Delete kv caches for this user
    await clearAuthCaches(authSession);

    return {
      status: 'ok',
      message: `Token "${token.primaryEmailAddress}" has been set as default!`,
      data: null,
    };
  });
};
