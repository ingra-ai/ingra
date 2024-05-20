'use server';

import * as z from 'zod';
import { ActionError } from '@v1/types/api-response';
import { validateAction } from '@lib/action-helpers';
import { ProfileSchema } from '@/schemas/profile';
import db from '@lib/db';
import { deleteAllUserCaches } from '@lib/db/extensions/redis';

export const updateProfile = async (values: z.infer<typeof ProfileSchema>) => {
  const validatedValues = await validateAction(ProfileSchema, values); 
  const { authSession, data } = validatedValues;

  const { firstName, lastName, userName, timeZone } = data;

  const profile = await db.profile.upsert({
    where: {
      userId: authSession.user.id,
    },
    update: {
      firstName,
      lastName,
      userName,
      timeZone,
    },
    create: {
      firstName,
      lastName,
      userName,
      timeZone,
      userId: authSession.user.id,
    },
  });

  if (!profile) {
    throw new ActionError('error', 400, 'Failed to update profile!');
  }

  // Delete kv caches for this user
  deleteAllUserCaches(authSession.user.id);

  return {
    success: 'Profile updated!',
    data: profile,
  };
};
