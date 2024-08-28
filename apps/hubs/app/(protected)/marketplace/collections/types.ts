import type { BakaPaginationType } from "@repo/components/BakaPagination";
import { Prisma } from "@repo/db/prisma";

export type CollectionMarketplaceListGetPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    owner: {
      select: {
        profile: {
          select: {
            userName: true;
          };
        };
      };
    };
    functions: {
      select: {
        id: true;
        slug: true;
        code: false;
        description: false;
        httpVerb: false;
        isPrivate: true;
        isPublished: true;
        ownerUserId: false;
        createdAt: false;
        updatedAt: false;
        tags: {
          select: {
            id: true;
            name: true;
            functionId: false;
            function: false;
          };
        };
        arguments: false;
      };
    };
    _count: {
      select: {
        subscribers: true;
      };
    };
  };
}>;

export type CollectionSubscriptionMarketplaceListGetPayload =
  Prisma.CollectionSubscriptionGetPayload<{
    select: {
      collectionId: true;
    };
  }>;

export type FetchCollectionMarketplacePaginationType = BakaPaginationType & {
  records: CollectionMarketplaceListGetPayload[];
};
