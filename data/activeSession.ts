'use server';
import db from "@lib/db";
import { Prisma } from "@prisma/client";

export type GetActiveSessionByJwtReturnType = Prisma.ActiveSessionGetPayload<{
  select: {
    id: true;
    userId: true;
    user: {
      include: {
        profile: true;
        oauthTokens: true;
        envVars: true;
        apiKeys: true;
      }
    };
  };
}> | null;

/**
 * Retrieves a user by their JWT.
 *
 * @warning Heavy function calls, being used in almost all API calls;
 * @todo Make this faster.
 *
 * @param code - The phrase code to search for.
 * @returns A Promise that resolves to the user object containing the user ID, email, role, and profile.
 */
export const getActiveSessionByJwt = async (jwt: string): Promise<GetActiveSessionByJwtReturnType> => {
  if (!jwt) {
    return null;
  }

  return await db.activeSession.findUnique({
    select: {
      id: true,
      userId: true,
      user: {
        include: {
          profile: true,
          oauthTokens: true,
          envVars: true,
          apiKeys: true,
        }
      },
    },
    where: {
      jwt: jwt, // Use the JWT to find the session
      expiresAt: {
        gte: new Date(),
      },
    },
  });
};
