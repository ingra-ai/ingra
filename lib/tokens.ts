import jwt from 'jsonwebtoken';
import { Logger } from './logger';

/**
 * Generates a token with the given payload and expiration time.
 * @param payload - The payload to be encoded in the token.
 * @param expiresSeconds - The expiration time of the token in seconds. Default is 86400 seconds (24 hours) for JWT, However it could be 180 seconds for Magic Link.
 * @returns The generated token.
 */
export const generateToken = <T extends string | object>(payload: T, expiresSeconds = 86400): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: expiresSeconds });
  return token;
};

/**
 * Decodes a JWT token and returns the payload.
 * @template T - The type of the payload. Can be a string or an object.
 * @param {string} token - The JWT token to decode.
 * @returns {T | null} - The decoded payload or null if decoding fails.
 */
export const decodeToken = <T extends string | object>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    return decoded as T;
  } catch (error: Error | any) {
    Logger.withTag('action|decodeToken').error('Error decoding token:', error?.message);
    return null;
  }
};
