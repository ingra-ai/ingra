import { Prisma } from "@prisma/client";
import type { BakaPaginationType } from "@components/BakaPagination";

export type FunctionMarketListGetPayload = Prisma.FunctionGetPayload<{
  select: {
    id: true,
    slug: true,
    code: false,
    description: true,
    httpVerb: true,
    isPrivate: true,
    isPublished: true,
    ownerUserId: true,
    createdAt: false,
    updatedAt: true,
    owner: {
      select: {
        profile: {
          select: {
            userName: true,
          }
        }
      }
    },
    tags: {
      select: {
        id: true,
        name: true,
        functionId: false,
        function: false,
      }
    },
    arguments: {
      select: {
        id: true,
        name: true,
        description: false,
        type: true,
        defaultValue: false,
        isRequired: false,
      }
    },
    _count: {
      select: {
        forksTo: true
      }
    }
  }
}>;
export type FetchFunctionMarketplacePaginationType = BakaPaginationType & {
  records: FunctionMarketListGetPayload[];
};
