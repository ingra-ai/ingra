'use server';

import { ActionError } from '@lib/api-response';
import { OAuthToken } from "@prisma/client";
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';

export const revokeOAuth = async (token: OAuthToken) => {
  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    throw new ActionError('error', 400, 'User not authenticated!');
  }

  const result = await db.oAuthToken.delete({
    where: {
      id: token.id,
    },
  });

  if ( !result ) {
    throw new ActionError('error', 400, 'Failed to revoke token!');
  }

  return {
    success: 'Token has been revoked!',
    data: null,
  };
};
