import db from "@repo/db/client";
import { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import { CollectionForToolsGetPayload } from "./types";

export const getCollectionsForTools = async (
  authSession: AuthSessionResponse,
) => {
  const [myCollections, myCollectionSubscriptions] = await Promise.all([
    // Get the collections of the user
    db.collection.findMany({
      where: {
        userId: authSession.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
        functions: {
          select: {
            id: true,
            code: false,
            isPrivate: false,
            ownerUserId: false,
            httpVerb: true,
            slug: true,
            description: true,
            arguments: true,
            tags: true,
          },
        },
      },
    }),

    // Get the collections that the user is subscribed to
    db.collection.findMany({
      where: {
        subscribers: {
          some: {
            userId: authSession.user.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
        functions: {
          select: {
            id: true,
            code: false,
            isPrivate: false,
            ownerUserId: false,
            httpVerb: true,
            slug: true,
            description: true,
            arguments: true,
            tags: true,
          },
        },
      },
    }),
  ]);

  return [myCollections, myCollectionSubscriptions] as [
    CollectionForToolsGetPayload[],
    CollectionForToolsGetPayload[],
  ];
};
