import db from '@repo/db/client';
import { Logger } from '@repo/shared/lib/logger';

export async function addNewCollection(name: string, slug: string, description: string, userId: string) {
  // Check if user has a collection with the same name
  const existingCollection = await db.collection.findFirst({
    where: {
      OR: [
        {
          userId,
          name,
        },
        {
          userId,
          slug,
        },
      ],
    },
  });

  if (existingCollection) {
    throw new Error('Collection with the same name or slug already exists');
  }

  const record = await db.collection.create({
    data: {
      name,
      slug,
      description,
      userId,
    },
  });

  return record;
}

export async function editCollection(collectionId: string, name: string, slug: string, description: string, userId: string) {
  const record = await db.collection.update({
    where: {
      id: collectionId,
      userId,
    },
    data: {
      name,
      slug,
      description,
    },
  });

  return record;
}

export async function addFunctionToCollection(collectionId: string, functionId: string, userId: string) {
  // Check if function exists, and owned by userId
  const functionRecord = await db.function.findFirst({
    where: {
      id: functionId,
      ownerUserId: userId,
    },
  });

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  const record = await db.collection.update({
    where: {
      id: collectionId,
      userId,
    },
    data: {
      functions: {
        connect: {
          id: functionId,
        },
      },
    },
  });

  return record;
}

export async function removeFunctionFromCollection(collectionId: string, functionId: string, userId: string) {
  // Check if function exists, and owned by userId
  const functionRecord = await db.function.findFirst({
    where: {
      id: functionId,
      ownerUserId: userId,
    },
  });

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  const record = await db.collection.update({
    where: {
      id: collectionId,
      userId,
    },
    data: {
      functions: {
        disconnect: {
          id: functionId,
        },
      },
    },
  });

  return record;
}

export async function subscribeToCollection(collectionId: string, userId: string) {
  const [userProfile, collectionRecord] = await Promise.all([
    db.profile.findFirst({
      where: {
        userId,
      },
    }),
    db.collection.findUnique({
      where: {
        id: collectionId,
      },
    }),
  ]);

  if (!userProfile) {
    throw new Error('User profile is not configured.');
  } else if (!userProfile?.userName) {
    throw new Error('Username is not configured.');
  }

  if (!collectionRecord) {
    throw new Error('Collection not found');
  }

  // Check if user has a collection with the same name
  const existingCollection = await db.collection.findFirst({
    where: {
      userId,
      name: collectionRecord.name,
    },
  });

  if (existingCollection) {
    throw new Error('Collection with the same name already exists');
  }

  const record = await db.collectionSubscription.create({
    data: {
      collectionId,
      userId,
    },
  });

  return {
    record,
    isSubscribed: true,
  };
}

export async function unsubscribeToCollection(collectionId: string, userId: string) {
  // Check if user is already subscribed to collection
  const existingSubscription = await db.collectionSubscription.findFirst({
    where: {
      collectionId,
      userId,
    },
  });

  if (!existingSubscription) {
    throw new Error('Unable to unsubscribe as the user is not subscribed to the collection.');
  }

  await db.collectionSubscription.delete({
    where: {
      collectionId_userId: {
        collectionId,
        userId,
      },
    },
  });

  return {
    record: null,
    isSubscribed: false,
  };
}

export async function deleteCollection(collectionId: string, userId: string) {
  try {
    await db.$transaction(async (prisma) => {
      // Delete related collection subscriptions
      await prisma.collectionSubscription.deleteMany({
        where: {
          collectionId,
        },
      });

      // Get all functions in this collection
      const collectionRecord = await prisma.collection.findUnique({
        where: {
          id: collectionId,
          userId,
        },
        select: {
          functions: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!collectionRecord) {
        throw new Error('Collection not found');
      }

      if (collectionRecord?.functions.length) {
        // Disconnect all functions in this collection
        await prisma.collection.update({
          where: {
            id: collectionId,
            userId,
          },
          data: {
            functions: {
              disconnect: collectionRecord.functions.map((f) => ({ id: f.id })),
            },
          },
        });
      }

      // Delete the collection
      const record = await prisma.collection.delete({
        where: {
          id: collectionId,
          userId,
        },
      });

      return record;
    });

    await Logger.withTag('action|deleteCollection').withTag(`user|${userId}`).info('Collection and all related records deleted successfully.');
    return true;
  } catch (error) {
    await Logger.withTag('action|deleteCollection').withTag(`user|${userId}`).error('Error deleting collection and related records', { error });
    throw error;
  }
}

export * from './getCollectionAccessibleByUser';
export * from './getCollectionsByUserId';
export * from './fetchCollectionsForFunction';
export * from './fetchPaginationData';
