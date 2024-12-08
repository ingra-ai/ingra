import * as z from 'zod';

export const oAuthTokenSchema = z.object({
  userId: z.string().uuid(),
  primaryEmailAddress: z.string().max(255),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  tokenType: z.string().default("Bearer"),
  scope: z.string().optional().default(""),
  service: z.enum(["google-oauth", "ingra-oauth"]),
  expiryDate: z.date(),
});

export const updateOAuthTokenSchema = z.object({
  id: z.string().uuid(),
  primaryEmailAddress: z.string().max(255),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  tokenType: z.string().default("Bearer"),
  scope: z.string().optional().default(""),
  service: z.enum(["google-oauth", "ingra-oauth"]),
  expiryDate: z.date(),
});