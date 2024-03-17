import type { User, MagicLinkToken, ActiveSession } from '@prisma/client';
import { generateToken } from '@lib/tokens';
import db from '@lib/db';

/**
 * ---------------------------------
 * MagicLink
 * ---------------------------------
 */

/**
 * Generates a random number with the specified length.
 *
 * @param {number} length - The length of the random number. Defaults to 6.
 * @returns {string} The generated random number as a string.
 */
const generateRandomNumber = (length = 6) => {
  // Generate a random number between 0 and 999999
  const randomNumber = Math.floor(Math.random() * 10 ** length);
  // Convert to a string and pad with leading zeros to ensure it is 6 digits
  const paddedRandomNumber = randomNumber.toString().padStart(6, '0');
  return paddedRandomNumber;
};

/**
 * Creates a magic link token for the given user.
 * @param user - The user for whom the magic link token is being upserted.
 * @param expiresSeconds - The number of seconds until the token expires. Default is 180 seconds (3 minutes).
 * @returns A Promise that resolves to the upserted magic link token, or null if the operation fails.
 */
export const createMagicLink = async (user: Pick<User, 'id' | 'email'>, expiresSeconds = 180): Promise<MagicLinkToken | null> => {
  const expiresTs = Date.now() + expiresSeconds * 1000;
  const expiresAt = new Date(expiresTs);
  // Generate 6 digits authentication code
  const otpCode = generateRandomNumber(6);
  const token = generateToken({ id: user.id, email: user.email, code: otpCode }, expiresSeconds);

  return await db.magicLinkToken.create({
    data: {
      userId: user.id,
      token,
      otpCode,
      expiresAt,
    },
  });
};

/**
 * Retrieves a magic link with user information based on the provided OTP code.
 * @param user - The user object containing the 'id' property.
 * @param otpCode - The OTP code to search for.
 * @returns A Promise that resolves to the magic link with user information, or null if not found.
 */
export const getMagicLinkByOtp = async (user: Pick<User, 'id'>, otpCode: string) => {
  const magicLinkWithUser = await db.magicLinkToken.findFirst({
    select: {
      token: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    where: {
      otpCode,
      userId: user.id,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  return magicLinkWithUser;
};

/**
 * Expires a magic link token by updating its expiration date to a specific value.
 * @param token - The magic link token to expire.
 * @returns A promise that resolves to the updated magic link token.
 */
export const expireMagicLinkByToken = async (token: string) => {
  return await db.magicLinkToken.update({
    where: {
      token,
    },
    data: {
      expiresAt: new Date(0),
    },
  });
};

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
      expiresAt,
    },
  });
};
