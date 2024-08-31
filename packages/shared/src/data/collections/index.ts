'use server';
import db from '@repo/db/client';
import { Logger } from '../../lib/logger';

export async function addNewCollection(name: string, slug: string, description: string, userId: string) {
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

export async function toggleCollectionSubscription(collectionId: string, userId: string) {
  const existingSubscription = await db.collectionSubscription.findUnique({
    where: {
      collectionId_userId: {
        collectionId,
        userId,
      },
    },
  });

  if (existingSubscription) {
    await unsubscribeToCollection(collectionId, userId);
    return false;
  } else {
    await subscribeToCollection(collectionId, userId);
    return true;
  }
}

export async function subscribeToCollection(collectionId: string, userId: string) {
  const collectionRecord = await db.collection.findUnique({
    where: {
      id: collectionId,
    },
  });

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
    return false;
  }
}
