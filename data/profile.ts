import type { User, Profile } from "@prisma/client";
import db from "@lib/db";

/**
 * Retrieves the user profile for a given user.
 * @param user - The user object.
 * @returns A Promise that resolves to the user's profile, or null if not found.
 */
export const getUserProfile = async (user: User): Promise<Profile | null> => {
  return await db.profile.findUnique({
    where: { userId: user.id },
  });
};
