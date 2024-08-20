import { Prisma } from "@prisma/client";

export type CollectionViewDetailPayload = Prisma.CollectionGetPayload<{
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
    updatedAt: true,
    functions: {
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
        }
      }
    }
  },
}>;