'use server';
import db from '@repo/db/client';

export async function getCollectionsByUserId(userId?: string | null) {
  if (!userId) {
    return [];
  }

  const records = await db.collection.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: false,
      functions: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  return records;
}
