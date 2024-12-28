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

export const revokeOAuth = async (token: Pick<OAuthToken, 'id'>) => {
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
