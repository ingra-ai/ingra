import type { BakaPaginationType } from '@repo/components/search/BakaPagination';
import { Prisma } from '@repo/db/prisma';

export type CommunityFunctionListGetPayload = Prisma.FunctionGetPayload<{
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
  isSubscribed: boolean;
};

export type FetchCommunityFunctionListPaginationType = BakaPaginationType & {
  records: CommunityFunctionListGetPayload[];
};
