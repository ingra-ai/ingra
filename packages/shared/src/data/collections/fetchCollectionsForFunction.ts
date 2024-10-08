'use server';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

export async function fetchCollectionsForFunction(query: string, functionId: string, userId: string | null) {
  if (!userId) {
    return [];
  }

  const whereQuery: Prisma.CollectionWhereInput = {
    userId: userId,
  };

  if (query) {
    whereQuery.OR = [
      {
        slug: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];
  }

  const records = await db.collection.findMany({
    where: whereQuery,
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
        where: {
          id: functionId,
        },
      },
    },
    skip: 0,
    take: 10,
  });

  return records.map((record) => {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      isFunctionSubscribed: record.functions.length > 0,
    };
  });
}
