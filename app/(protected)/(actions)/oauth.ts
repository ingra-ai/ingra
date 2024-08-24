'use server';

import { ActionError } from '@v1/types/api-response';
import { OAuthToken } from "@prisma/client";
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';
import { clearAuthCaches } from '@data/auth/session/caches';
import { 
  deleteOAuthToken,
  setTokenAsDefault as dataSetTokenAsDefault,
} from '@/data/oauthToken';

export const revokeOAuth = async (token: OAuthToken) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await deleteOAuthToken(token.id, authSession.user.id);
  
    if ( !result ) {
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
  
    if ( !result ) {
      throw new ActionError('error', 400, 'Failed to set token as default!');
    }
  
    // Delete kv caches for this user
    await clearAuthCaches(authSession);
  
    return {
      status: 'ok',
      message: `Token "${ token.primaryEmailAddress }" has been set as default!`,
      data: null,
    };
  });
}