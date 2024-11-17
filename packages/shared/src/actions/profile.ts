'use server';

import * as z from 'zod';
import { ActionError } from '@repo/shared/types';
import { validateAction } from '../lib/action-helpers';
import { ProfileSchema } from '../schemas/profile';
import { actionAuthTryCatch } from '../utils/actionAuthTryCatch';
import { clearAuthCaches } from '../data/auth/session/caches';
import { updateProfile as dataUpdateProfile, destroyAccount as dataDestroyAccount } from '../data/profile';
import { Logger } from '../lib/logger';

export const updateProfile = async (values: z.infer<typeof ProfileSchema>) => {
  const validatedValues = await validateAction(ProfileSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const profile = await dataUpdateProfile(data, authSession.user.id);

    if (!profile) {
      throw new ActionError('error', 400, 'Failed to update profile!');
    }

    // Delete kv caches for this user
    await clearAuthCaches(authSession);

    return {
      status: 'ok',
      message: 'Profile updated!',
      data: profile,
    };
  });
};

export const destroyProfile = async () => {
  // Delete all
  return await actionAuthTryCatch(async (authSession) => {
    /**
     * @todo Add some more defensive checks here
     */
    const [isDestroyed, isCacheCleared] = await Promise.all([
      dataDestroyAccount(authSession.user.id),

      // Delete kv caches for this user
      clearAuthCaches(authSession),

      Logger.withTag('action|destroyProfile').withTag(`user|${authSession.user.id}`).info('Destroying user account'),
    ]);

    if (!isDestroyed) {
      throw new ActionError('error', 400, 'Failed to delete profile!');
    }

    return {
      status: 'ok',
      message: 'Profile deleted!',
      data: null,
    };
  });
};
