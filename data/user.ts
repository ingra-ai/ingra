'use server';
import type { User } from '@prisma/client';
import db from '@lib/db';

/**
 * Fetches a user from the database by their email.
 *
 * @param email - The email of the user to fetch.
 * @returns A promise that resolves to the user if found, or null if not found.
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await db.user.findUnique({
    where: { email },
  });
};

export const getUserIdByProfileName = async (profileName: string): Promise<string | undefined> => {
  const user = await db.user.findFirst({
    where: {
      profile: {
        userName: profileName,
      },
    },
    select: {
      id: true
    },
  });

  return user?.id;
};

/**
 * Retrieves an existing user by email or creates a new user if none exists.
 *
 * @param email - The email address of the user.
 * @returns A Promise that resolves to the existing user if found, or a newly created user if not found.
 */
export const getOrCreateUserByEmail = async (email: string): Promise<User | null> => {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return existingUser;
  }

  return await db.user.create({
    data: {
      email,
    },
  });
};

/**
 * Retrieves a user by their JWT.
 *
 * @warning Heavy function calls, being used in almost all API calls;
 * @todo Make this faster.
 *
 * @param code - The phrase code to search for.
 * @returns A Promise that resolves to the user object containing the user ID, email, role, and profile.
 */
export const getUserByJwt = async (jwt: string) => {
  if (!jwt) {
    return null;
  }

  return await db.activeSession.findUnique({
    select: {
      id: true,
      expiresAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: true,
          oauthTokens: true,
          envVars: true,
        },
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

export const getUserByApiKey = async (apiKey: string) => {
  if (!apiKey) {
    return null;
  }

  const [record] = await Promise.all([
    db.apiKey.findUnique({
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: true,
            oauthTokens: true,
            envVars: true,
          },
        },
      },
      where: {
        key: apiKey, // Use the API key to find the session
      },
    }),

    db.apiKey.update({
      where: { key: apiKey },
      data: { lastUsedAt: new Date() },
    })
  ]);

  return record;
}
