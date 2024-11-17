'use server';

import { ActionError } from '@repo/shared/types';
import db from '@repo/db/client';
import crypto from 'crypto';
import { MAX_API_KEYS_PER_USER } from '../schemas/apiKey';
import { actionAuthTryCatch } from '../utils/actionAuthTryCatch';
import { deleteApiKey as dataDeleteApiKey, upsertApiKey as dataUpsertApiKey } from '../data/apiKey';

export const generateApiKey = async () => {
  return await actionAuthTryCatch(async (authSession) => {
    // Generate random string with 32 characters
    const length = 42;
    const prefix = 'bb';
    const randomBytes = [
      prefix,
      crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length),
    ].join('-');

    // Get the number of api keys this user has
    const totalUserApiKeys = await db.apiKey.count({
      where: {
        userId: authSession.user.id,
      },
    });

    if (totalUserApiKeys >= MAX_API_KEYS_PER_USER) {
      throw new ActionError('error', 400, 'You have reached the maximum number of API keys allowed!');
    }

    const apiKey = await dataUpsertApiKey(authSession.user.id, randomBytes);

    if (!apiKey) {
      throw new ActionError('error', 400, 'Failed to generate api key!');
    }

    return {
      status: 'ok',
      message: 'New API key generated!',
      data: {
        key: apiKey.key,
      },
    };
  });
};

export const deleteApiKey = async (key: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const record = await dataDeleteApiKey(key, authSession.user.id);

    if (!record) {
      throw new ActionError('error', 400, 'Failed to delete API key!');
    }

    return {
      status: 'ok',
      message: 'API key deleted!',
      data: null,
    };
  });
};
