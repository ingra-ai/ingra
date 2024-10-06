import type { BakaPaginationType } from '@repo/components/search/BakaPagination';
import { Prisma } from '@repo/db/prisma';

export type CommunityCollectionViewDetailPayload = Prisma.CollectionGetPayload<{
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

