"use server";
import type { User } from "@repo/db/prisma";
import db from "@repo/db/client";

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

export const getUserIdByProfileName = async (
  profileName: string,
): Promise<string | undefined> => {
  const user = await db.user.findFirst({
    where: {
      profile: {
        userName: profileName,
      },
    },
    select: {
      id: true,
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
export const getOrCreateUserByEmail = async (
  email: string,
): Promise<User | null> => {
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
