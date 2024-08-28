import { Prisma } from "@repo/db/prisma";

export type CollectionListGetPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: false;
    functions: {
      select: {
        id: true;
        slug: true;
      };
    };
  };
}>;
