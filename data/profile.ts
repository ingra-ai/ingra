import { z } from 'zod';
import db from '@lib/db';
import type { User, Profile } from '@prisma/client';
import { ProfileSchema } from '@/schemas/profile';
import { Logger } from '@lib/logger';
import { deleteCollection } from './collections';
import { deleteFunction } from './functions';

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

export const destroyAccount = async ( userId: string ) => {
  try {
    await db.$transaction(async (prisma) => {
      // Delete related records in the correct order

      // Fetch and delete all collections associated with the user
      const collections = await prisma.collection.findMany({
        where: { userId: userId },
        select: { id: true },
      });

      const collectionsDeletionPromises = [];

      if ( collections.length ) {
        collectionsDeletionPromises.push( collections.map((collection) => deleteCollection(collection.id, userId)) );
        await Promise.all(collectionsDeletionPromises);
      }

      // Fetch and delete all functions associated with the user
      const functions = await prisma.function.findMany({
        where: { ownerUserId: userId },
        select: { id: true },
      });

      const functiosnDeletionsPromises = [];

      if ( functions.length ) {
        functiosnDeletionsPromises.push( functions.map((func) => deleteFunction(func.id, userId)) );
        await Promise.all(functiosnDeletionsPromises);
      }

      // Delete other related records directly linked to the User
      await Promise.all([
        prisma.profile.deleteMany({ where: { userId } }),
        prisma.activeSession.deleteMany({ where: { userId } }),
        prisma.magicLinkToken.deleteMany({ where: { userId } }),
        prisma.oAuthToken.deleteMany({ where: { userId } }),
        prisma.apiKey.deleteMany({ where: { userId } }),
        prisma.envVars.deleteMany({ where: { ownerUserId: userId } }),
        prisma.functionReaction.deleteMany({ where: { userId } }),
        prisma.functionSubscription.deleteMany({ where: { userId } })
      ]);

      // Finally, delete the User
      await prisma.user.delete({ where: { id: userId } });
    });

    await Logger.withTag('destroyAccount').info('User and all related records deleted successfully.');
    return true;
  } catch (error) {
    await Logger.withTag('destroyAccount').info('Error deleting user and related records', { error });
    return false;
  }
}
