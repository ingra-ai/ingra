'use server';

import * as z from 'zod';
import { ActionError } from '@v1/types/api-response';
import { validateAction } from '@lib/action-helpers';
import { ProfileSchema } from '@/schemas/profile';
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';
import { clearAuthCaches } from '@app/auth/session/caches';
import { updateProfile as dataUpdateProfile } from '@/data/profile';

export const updateProfile = async (values: z.infer<typeof ProfileSchema>) => {
  const validatedValues = await validateAction(ProfileSchema, values); 
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const profile = await dataUpdateProfile( data, authSession.user.id )
  
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
