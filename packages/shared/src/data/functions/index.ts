import { z } from 'zod';
import db from '@repo/db/client';
import { FunctionSchema } from '../../schemas/function';
import { Logger } from '../../lib/logger';

export async function upsertFunction(values: z.infer<typeof FunctionSchema>, userId: string) {
  const { id: recordId, slug, code, isPrivate, isPublished, httpVerb, description, arguments: functionArguments, tags: functionTags } = values;
  const isEditMode = !!recordId;
  const result = await db.$transaction(async (prisma) => {
    /**
     * If recordId presents, it's an edit mode.
     */
    if (isEditMode) {
      // Check if the function exists
      const existingFunction = await prisma.function.findUnique({
        where: {
          id: values.id,

          // Always check if the user is the owner
          ownerUserId: userId,
        },
      });

      if (!existingFunction) {
        throw new Error('Function not found');
      }

      // Delete existing arguments and tags
      await Promise.all([
        prisma.functionArgument.deleteMany({
          where: { functionId: existingFunction.id },
        }),
        prisma.functionTag.deleteMany({
          where: { functionId: existingFunction.id },
        }),
      ]);

      // Update the function
      const updatedFunction = await prisma.function.update({
        where: {
          id: existingFunction.id,

          // Always check if the user is the owner
          ownerUserId: userId,
        },
        data: {
          slug,
          code,
          isPrivate,
          isPublished,
          httpVerb,
          description,
          updatedAt: new Date(),
        },
      });

      // Insert new arguments and tags
      const insertArgAndTagPromises = [];

      // Insert new arguments
      if (functionArguments) {
        insertArgAndTagPromises.push(
          prisma.functionArgument.createMany({
            data: functionArguments.map((arg) => ({
              ...arg,
              functionId: existingFunction.id,
            })),
          })
        );
      }

      // Insert new tags
      if (functionTags) {
        insertArgAndTagPromises.push(
          prisma.functionTag.createMany({
            data: functionTags.map((tag) => ({
              ...tag,
              functionId: existingFunction.id,
            })),
          })
        );
      }

      await Promise.all(insertArgAndTagPromises);
      return updatedFunction;
    } else {
      /**
       * Otherwise, create a new record.
       */
      // Create new function and arguments
      const newFunction = await prisma.function.create({
        data: {
          slug,
          code,
          isPrivate,
          isPublished,
          httpVerb,
          description,
          arguments: {
            create: (functionArguments || []).map((arg) => ({
              name: arg.name,
              type: arg.type,
              isRequired: arg.isRequired,
              defaultValue: arg.defaultValue,
              description: arg.description,
            })),
          },
          tags: {
            create: (functionTags || []).map((tag) => ({
              name: tag.name,
            })),
          },
          ownerUserId: userId,
        },
      });

      return newFunction;
    }
  });

  return result;
}

export async function deleteFunction(functionId: string, userId: string) {
  try {
    await db.$transaction(async (prisma) => {
      // Delete related child records in the correct order
      const relationshipRemovePromises = [
        // Delete function arguments
        prisma.functionArgument.deleteMany({
          where: {
            functionId,
          },
        }),

        // Delete function tags
        prisma.functionTag.deleteMany({
          where: {
            functionId,
          },
        }),

        // Delete associated function subscriptions where this function is the original function
        // Other users who subscribed to this functions will be impacted.
        prisma.functionSubscription.deleteMany({
          where: {
            functionId,
          },
        }),

        // Delete associated function reactions
        prisma.functionReaction.deleteMany({
          where: {
            functionId,
          },
        }),
      ];

      await Promise.all(relationshipRemovePromises);
      const result = await prisma.function.delete({
        where: {
          id: functionId,
          ownerUserId: userId,
        },
      });

      return result;
    });

    await Logger.withTag('action|deleteFunction').withTag(`user|${userId}`).info('Function and all related records deleted successfully.');
    return true;
  } catch (error) {
    await Logger.withTag('action|deleteFunction').withTag(`user|${userId}`).info('Error deleting function and related records', { error });
    return false;
  }
}

export async function subscribeToFunction(functionId: string, userId: string) {
  const [userProfile, functionRecord] = await Promise.all([
    db.profile.findFirst({
      where: {
        userId,
      },
    }),
    db.function.findUnique({
      where: {
        id: functionId,
        isPublished: true,
      },
    }),
  ]);

  if (!userProfile) {
    throw new Error('User profile is not configured.');
  } else if (!userProfile?.userName) {
    throw new Error('Username is not configured.');
  }

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  // Check if function with the same "slug" exists on user's functions
  const existingFunction = await db.function.findFirst({
    where: {
      ownerUserId: userId,
      slug: functionRecord.slug,
    },
  });

  if (existingFunction) {
    throw new Error('Function with the same slug already exists');
  }

  const subscription = await db.functionSubscription.create({
    data: {
      functionId,
      userId,
    },
  });

  return {
    functionSlug: functionRecord.slug,
    isSubscribed: true,
  };
}

export async function unsubscribeToFunction(functionId: string, userId: string) {
  // Check if the user is already subscribed to the function
  const existingSubscription = await db.functionSubscription.findFirst({
    where: {
      functionId,
      userId,
    },
    include: {
      function: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!existingSubscription) {
    throw new Error('Unable to unsubscribe as the user is not subscribed to the function.');
  }

  const record = await db.functionSubscription.delete({
    where: {
      id: existingSubscription.id,
    },
  });

  return {
    functionSlug: existingSubscription.function.slug,
    isSubscribed: false,
  };
}

export async function cloneFunction(functionId: string, userId: string) {
  const [userProfile, functionRecord] = await Promise.all([
    db.profile.findFirst({
      where: {
        userId,
      },
    }),
    db.function.findUnique({
      where: {
        id: functionId,
        OR: [
          // User is the sole owner
          {
            ownerUserId: userId,
          },

          // User is a subscriber
          {
            subscribers: {
              some: {
                userId,
              },
            },
          },

          // Function is in marketplace
          {
            isPublished: true,
            isPrivate: false,
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    }),
  ]);

  if (!userProfile) {
    throw new Error('User profile is not configured.');
  } else if (!userProfile?.userName) {
    throw new Error('Username is not configured.');
  }

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  // Create a new slug for the cloned function
  const newSlug = `cloned-${functionRecord.slug}`;

  // Clone the function
  const clonedFunction = await db.function.create({
    data: {
      slug: newSlug,
      code: functionRecord.code,
      isPrivate: functionRecord.isPrivate,
      isPublished: functionRecord.isPublished,
      ownerUserId: userId,
      httpVerb: functionRecord.httpVerb,
      description: functionRecord.description,
      arguments: {
        create: functionRecord.arguments.map((arg) => ({
          name: arg.name,
          type: arg.type,
          defaultValue: arg.defaultValue,
          description: arg.description,
          isRequired: arg.isRequired,
        })),
      },
      tags: {
        create: functionRecord.tags.map((tag) => ({
          name: tag.name,
        })),
      },
    },
  });

  return clonedFunction;
}

export * from './getFunctionAccessibleByUser';
export * from './fetchPaginationData';
