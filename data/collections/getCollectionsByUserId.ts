import db from "@lib/db"

export const getCollectionsByUserId = async (userId: string) => {
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
          slug: true
        }
      }
    },
  });

  return records;
};
