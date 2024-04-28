'use server';

import { ActionError } from '@lib/api-response';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import crypto from 'crypto';

export const generateApiKey = async () => {
  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    throw new ActionError('error', 400, 'User not authenticated!');
  }

  // Generate random string with 32 characters
  const length = 42;
  const prefix = 'bb';
  const randomBytes = [prefix, crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)].join('-');

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

  if (!authSession || authSession.expiresAt < new Date()) {
    throw new ActionError('error', 400, 'User not authenticated!');
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