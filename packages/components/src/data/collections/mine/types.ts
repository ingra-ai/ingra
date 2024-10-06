import type { BakaPaginationType } from '@repo/components/search/BakaPagination';
import { Prisma } from '@repo/db/prisma';

export type MineCollectionListGetPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
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

export type MineCollectionViewDetailPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    updatedAt: true;
    functions: {
      select: {
        id: true;
        slug: true;
        code: false;
        description: true;
        httpVerb: true;
        isPrivate: true;
        isPublished: true;
        ownerUserId: true;
        createdAt: false;
        updatedAt: true;
        tags: {
          select: {
            id: true;
            name: true;
            functionId: false;
            function: false;
          };
        };
        arguments: {
          select: {
            id: true;
            name: true;
            description: false;
            type: true;
            defaultValue: false;
            isRequired: false;
          };
        };
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
