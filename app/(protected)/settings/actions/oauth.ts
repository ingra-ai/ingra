'use server';

import { ActionError } from '@v1/types/api-response';
import { OAuthToken } from "@prisma/client";
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';
import { clearAuthCaches } from '@app/auth/session/caches';
import { deleteOAuthToken } from '@/data/oauthToken';

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
