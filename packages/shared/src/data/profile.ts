import { z } from 'zod';
import db from '@repo/db/client';
import type { User, Profile } from '@repo/db/prisma';
import { ProfileSchema } from '../schemas/profile';
import { Logger } from '../lib/logger';
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

/**
 * Retrieves the user profile for a given username.
 * @param userName - The username.
 * @returns A Promise that resolves to the user's profile, or null if not found.
 */
export const getUserProfileByUsername = async (userName: string) => {
  if (!userName) {
    return null;
  }

  return await db.profile.findUnique({
    where: { userName },
    select: {
      userId: true,
      userName: true,
      firstName: true,
      lastName: true,
      timeZone: true,
    },
  });
};

export const updateProfile = async (values: z.infer<typeof ProfileSchema>, userId: string) => {
  const { firstName, lastName, userName, timeZone } = values;

  /**
   * Disable updating the username for now if user already has a username.
   * Since its tied up with collections subscription API endpoint.
   * @see USERS_API_FUNCTION_COLLECTION_SUBSCRIPTIONS_PATH constants
   * e.g. /api/v1/me/collections/:username/:slug
   */
  const existingRecord = await db.profile.findUnique({
    where: { userId },
  });

  if (existingRecord?.userName && existingRecord.userName !== userName) {
    throw new Error('Username cannot be updated once set. Please contact support for assistance.');
  }

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

export const destroyAccount = async (userId: string) => {
  try {
    await db.$transaction(async (prisma) => {
      // Delete related records in the correct order

      // Fetch and delete all collections associated with the user
      const collections = await prisma.collection.findMany({
        where: { userId: userId },
        select: { id: true },
      });

      const collectionsDeletionPromises = [];

      if (collections.length) {
        collectionsDeletionPromises.push(collections.map((collection) => deleteCollection(collection.id, userId)));
        await Promise.all(collectionsDeletionPromises);
      }

      // Fetch and delete all functions associated with the user
      const functions = await prisma.function.findMany({
        where: { ownerUserId: userId },
        select: { id: true },
      });

      const functiosnDeletionsPromises = [];

      if (functions.length) {
        functiosnDeletionsPromises.push(functions.map((func) => deleteFunction(func.id, userId)));
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
        prisma.functionSubscription.deleteMany({ where: { userId } }),
      ]);

      // Finally, delete the User
      await prisma.user.delete({ where: { id: userId } });
    });

    await Logger.withTag('action|destroyAccount').withTag(`user|${userId}`).info('User and all related records deleted successfully.');
    return true;
  } catch (error) {
    await Logger.withTag('action|destroyAccount').withTag(`user|${userId}`).info('Error deleting user and related records', { error });
    return false;
  }
};
