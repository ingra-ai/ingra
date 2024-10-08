import type { BakaPaginationType } from '@repo/components/search/BakaPagination';
import { Prisma } from '@repo/db/prisma';

export type MineCollectionListGetPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
    updatedAt: true,
    _count?: {
      select: {
        subscribers: true;
      };
    };
  };
}>;

export type MineCollectionMenuListGetPayload = Prisma.CollectionGetPayload<{
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

export type FetchMineCollectionListPaginationType = BakaPaginationType & {
  records: MineCollectionListGetPayload[];
};
