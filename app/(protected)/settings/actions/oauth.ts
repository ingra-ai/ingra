'use server';

import { ActionError } from '@v1/types/api-response';
import { OAuthToken } from "@prisma/client";
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { deleteAllUserCaches } from '@lib/db/extensions/redis';

export const revokeOAuth = async (token: OAuthToken) => {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  const result = await db.oAuthToken.delete({
    where: {
      id: token.id,
    },
  });

  if ( !result ) {
    throw new ActionError('error', 400, 'Failed to revoke token!');
  }

  // Delete kv caches for this user
  deleteAllUserCaches(authSession.user.id);

  return {
    success: 'Token has been revoked!',
    data: null,
  };
};
