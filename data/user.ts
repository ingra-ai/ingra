"use server"
import type { User } from "@prisma/client";
import db from "@lib/db";

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
      email
    },
  });
}

/**
 * Retrieves a user by their phrase code.
 * This function is used to grab the user ID by using the phrase code.
 *
 * @param code - The phrase code to search for.
 * @returns A Promise that resolves to the user object containing the user ID, email, role, and profile.
 */
export const getUserByPhraseCode = async (code: string) => {
  if ( !code ) {
    return null;
  }

  const phraseCode = await db.phraseCode.findUnique({
    where: {
      code,
    },
    select: {
      expiresAt: true,
      userId: true,
      isAuthenticated: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: true,
        },
      },
    }
  });

  return phraseCode?.user || null;
}