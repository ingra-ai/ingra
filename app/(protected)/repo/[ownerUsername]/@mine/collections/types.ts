import type { BakaPaginationType } from "@components/BakaPagination";
import { Prisma } from "@prisma/client";

export type CollectionListGetPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
    functions: {
      select: {
        id: true,
        slug: true,
        code: false,
        description: false,
        httpVerb: false,
        isPrivate: true,
        isPublished: true,
        ownerUserId: false,
        createdAt: false,
        updatedAt: false,
        tags: {
          select: {
            id: true,
            name: true,
            functionId: false,
            function: false,
          }
        },
        arguments: false
      },
    },
    _count: {
      select: {
        subscribers: true,
      }
    }
  },
}>;


export type FetchCollectionListPaginationType = BakaPaginationType & {
  records: CollectionListGetPayload[];
};
