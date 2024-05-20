'use server';

import { ActionError } from '@v1/types/api-response';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import crypto from 'crypto';
import { MAX_API_KEYS_PER_USER } from '@/schemas/apiKey';

export const generateApiKey = async () => {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  // Generate random string with 32 characters
  const length = 42;
  const prefix = 'bb';
  const randomBytes = [prefix, crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)].join('-');

  // Get the number of api keys this user has
  const totalUserApiKeys = await db.apiKey.count({
    where: {
      userId: authSession.user.id,
    }
  });

  if ( totalUserApiKeys >= MAX_API_KEYS_PER_USER ) {
    throw new ActionError('error', 400, 'You have reached the maximum number of API keys allowed!');
  }

  const apiKey = await db.apiKey.create({
    data: {
      key: randomBytes,
      userId: authSession.user.id,
    },
  });

  if (!apiKey) {
    throw new ActionError('error', 400, 'Failed to generate api key!');
  }

  return {
    success: 'New API key generated!',
    data: {
      key: apiKey.key
    },
  };
};

export const deleteApiKey = async (key: string) => {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  const apiKey = await db.apiKey.findUnique({
    where: {
      userId: authSession.user.id,
      key,
    },
  });

  if (!apiKey || apiKey.userId !== authSession.user.id) {
    throw new ActionError('error', 400, 'Invalid API key!');
  }

  await db.apiKey.delete({
    where: {
      key,
    },
  });

  return {
    success: 'API key deleted!',
  };
}