import { Prisma } from "@prisma/client";

export type CollectionListGetPayload = Prisma.CollectionGetPayload<{
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
}>;