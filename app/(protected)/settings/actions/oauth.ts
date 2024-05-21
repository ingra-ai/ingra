'use server';

import { ActionError } from '@v1/types/api-response';
import { OAuthToken } from "@prisma/client";
import db from '@lib/db';
import { deleteAllUserCaches } from '@lib/db/extensions/redis';
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';

export const revokeOAuth = async (token: OAuthToken) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await db.oAuthToken.delete({
      where: {
        id: token.id,
      },
    });
  
    if ( !result ) {
      throw new ActionError('error', 400, 'Failed to revoke token!');
    }
  
    // Delete kv caches for this user
    await deleteAllUserCaches(authSession.user.id);
  
    return {
      status: 'ok',
      message: 'Token has been revoked!',
      data: null,
    };
  });
};
