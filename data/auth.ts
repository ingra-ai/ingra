import type { User, MagicLinkToken, ActiveSession } from "@prisma/client";
import { generateToken } from "@lib/tokens";
import db from "@lib/db";

/**
 * ---------------------------------
 * MagicLink
 * ---------------------------------
 */

/**
 * Creates a magic link token for the given user.
 * @param user - The user for whom the magic link token is being upserted.
 * @param expiresSeconds - The number of seconds until the token expires. Default is 180 seconds (3 minutes).
 * @returns A Promise that resolves to the upserted magic link token, or null if the operation fails.
 */
export const createMagicLink = async (user: Pick<User, 'id' | 'email'>, expiresSeconds = 180): Promise<MagicLinkToken | null> => {
  const expiresTs = Date.now() + expiresSeconds * 1000;
  const expiresAt = new Date(expiresTs);
  const token = generateToken({ id: user.id, email: user.email, _expiresTs: expiresTs }, expiresSeconds);

  return await db.magicLinkToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });
}

/** 
 * ---------------------------------
 * ActiveSession
 * ---------------------------------
 */

/**
 * Creates an active session for the given user.
 * @param user - The user object.
 * @param expiresSeconds - The number of seconds until the session expires. Default is 86400 seconds (24 hours).
 * @returns A promise that resolves to the upserted active session, or null if the operation fails.
 */
export const createActiveSession = async (user: Pick<User, 'id' | 'email'>, expiresSeconds = 86400): Promise<ActiveSession | null> => {
  const expiresTs = Date.now() + expiresSeconds * 1000;
  const expiresAt = new Date(expiresTs);
  const token = generateToken({ id: user.id, email: user.email, _expiresTs: expiresTs }, expiresSeconds);

  return await db.activeSession.create({
    data: {
      userId: user.id,
      jwt: token,
      expiresAt
    }
  });
}
