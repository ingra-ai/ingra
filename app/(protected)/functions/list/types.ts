import { Prisma } from "@prisma/client";

export type FunctionListGetPayload = Prisma.FunctionGetPayload<{
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