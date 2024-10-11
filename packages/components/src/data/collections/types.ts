import { Prisma } from '@repo/db/prisma';
import type { FetchCollectionPaginationDataReturnType } from '@repo/shared/data/collections';

export type CollectionCardPayload = FetchCollectionPaginationDataReturnType['records'][0];

export type CollectionDetailViewPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    updatedAt: true;
    owner: {
      select: {
        id: true;
        profile: {
          select: {
            userName: true;
          };
        };
      };
    };
  };
}> & {
  subscribers: {
    id: string;
  }[];
};
