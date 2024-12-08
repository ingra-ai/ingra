'use server';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

export type GetSessionByApiKeyReturnType = Prisma.ApiKeyGetPayload<{
  select: {
    userId: true;
    user: {
      include: {
        profile: true;
        oauthTokens: true;
        envVars: true;
        apiKeys: false;
      };
    };
  };
}>;

/**
 * Retrieves a session by their API key.
 * @param {string} apiKey - The API key used to find the user.
 * @returns A Promise that resolves to the user record, or null if the API key is not provided.
 */
export const getSessionByApiKey = async (apiKey: string): Promise<GetSessionByApiKeyReturnType | null> => {
  if (!apiKey) {
    return null;
  }

  return await db.apiKey.findUnique({
    select: {
      id: true,
      userId: true,
      user: {
        include: {
          profile: true,
          oauthTokens: true,
          envVars: true,
          apiKeys: false,
        },
      },
    },
    where: {
      key: apiKey, // Use the API key to find the session
    },
  });
};

/**
 * Retrieves all API keys associated with a given user ID.
 * @param userId - The user ID to find the API keys for.
 * @returns A Promise that resolves to an array of API keys.
 */
export const getApiKeysByUserId = async (userId: string, select?: Prisma.ApiKeySelect) => {
  if (!userId) {
    return [];
  }

  return await db.apiKey.findMany({
    ...(select && { select }),
    where: {
      userId,
    },
  });
};

/**
 * Updates the last updated timestamp of an API key in the database.
 * @param apiKey - The API key to update.
 * @returns A promise that resolves to a boolean indicating whether the update was successful.
 */
export const updateApiKeyLastUpdatedAt = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) {
    return false;
  }

  const updated = await db.apiKey.update({
    where: {
      key: apiKey,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return !!updated;
};

export const upsertApiKey = async (userId: string, key: string) => {
  if (!userId || !key) return null;

  return await db.apiKey.upsert({
    where: {
      key,
    },
    create: {
      key,
      userId,
    },
    update: {
      key,
      userId,
    },
  });
};

export const deleteApiKey = async (key: string, userId: string) => {
  return await db.apiKey.delete({
    where: {
      key,
      userId,
    },
  });
};
