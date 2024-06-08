
import type { BakaPaginationType } from "@components/BakaPagination";
import { Prisma } from "@prisma/client";

export type FunctionSubscriptionListGetPayload = Prisma.FunctionSubscriptionGetPayload<{
  include: {
    function: {
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
        tags: {
          select: {
            id: true,
            name: true,
            functionId: false,
            function: false,
          }
        },
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                id: true,
                userName: true,
              }
            }
          }
        }
      }
    }
  }
}>;

export type FetchFunctionSubscriptionListPaginationType = BakaPaginationType & {
  records: FunctionSubscriptionListGetPayload[];
};
