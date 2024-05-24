import { z } from 'zod';
import db from '@lib/db';
import type { User, Profile } from '@prisma/client';
import { ProfileSchema } from '@/schemas/profile';

/**
 * Retrieves the user profile for a given user.
 * @param user - The user object.
 * @returns A Promise that resolves to the user's profile, or null if not found.
 */
export const getUserProfile = async (user: User): Promise<Profile | null> => {
  return await db.profile.findUnique({
    where: { userId: user.id },
  });
};

export const updateProfile = async (values: z.infer<typeof ProfileSchema>, userId: string) => {
  const { firstName, lastName, userName, timeZone } = values;

  const record = await db.profile.upsert({
    where: {
      userId: userId,
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
      userId,
    },
  });

  return record;
};
