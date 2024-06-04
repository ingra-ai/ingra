import { z } from 'zod';
import db from '@lib/db';
import type { User, Profile } from '@prisma/client';
import { ProfileSchema } from '@/schemas/profile';
import { Logger } from '@lib/logger';

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

      // Fetch all functions associated with the user
      const functions = await prisma.function.findMany({
        where: { ownerUserId: userId },
        select: { id: true },
      });

      // Fetch all collections associated with the user
      const collections = await prisma.collection.findMany({
        where: { userId: userId },
        select: { id: true },
      });

      // Delete FunctionArguments and FunctionTags associated with each Function
      for (const func of functions) {
        await prisma.functionArgument.deleteMany({
          where: { functionId: func.id },
        });
        await prisma.functionTag.deleteMany({
          where: { functionId: func.id },
        });
      }

      // Delete FunctionReactions, FunctionSubscriptions, FunctionForks associated with each Function
      await prisma.functionReaction.deleteMany({
        where: { functionId: { in: functions.map((func) => func.id) } },
      });

      await prisma.functionSubscription.deleteMany({
        where: { functionId: { in: functions.map((func) => func.id) } },
      });

      // Delete Collection subscriptions
      await prisma.collectionSubscription.deleteMany({
        where: { collectionId: { in: collections.map((collection) => collection.id) } },
      });

      // Finally Delete Collections
      await prisma.collection.deleteMany({
        where: { userId },
      });

      // Finally Delete Functions
      await prisma.function.deleteMany({
        where: { ownerUserId: userId },
      });

      //

      // Delete other related records directly linked to the User
      await prisma.profile.deleteMany({ where: { userId } });
      await prisma.activeSession.deleteMany({ where: { userId } });
      await prisma.magicLinkToken.deleteMany({ where: { userId } });
      await prisma.oAuthToken.deleteMany({ where: { userId } });
      await prisma.apiKey.deleteMany({ where: { userId } });
      await prisma.envVars.deleteMany({ where: { ownerUserId: userId } });
      await prisma.functionReaction.deleteMany({ where: { userId } });
      await prisma.functionSubscription.deleteMany({ where: { userId } });

      // Finally, delete the User
      await prisma.user.delete({ where: { id: userId } });
    });

    await Logger.withTag('data').info('User and all related records deleted successfully.');
    return true;
  } catch (error) {
    await Logger.withTag('ERROR: data').info('Error deleting user and related records', { error });
    return false;
  }
}
