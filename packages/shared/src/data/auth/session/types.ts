import { Prisma } from '@repo/db/prisma';
import type { GetActiveSessionByJwtReturnType } from '@repo/shared/data/activeSession';
import type { GetSessionByApiKeyReturnType } from '@repo/shared/data/apiKey';
import type { GetActiveSessionByOAuthReturnType } from '@repo/shared/data/oauthToken';

/**
 * Options for getting an authentication session.
 */
export type GetAuthSessionOptions = {
  /**
   * Introspect auth tokens.
   * When set to true, the function will attempt to refresh current user's OAuth tokens if they exist and expired.
   * E.g. Google OAuth, Facebook OAuth, etc..
   * @default false
   * @see {@link packages/shared/src/data/auth/session/index.ts getAuthSession}
   */
  introspectOAuthTokens?: boolean;
};

/**
 * Declare type contract for reusability and caching purposes.
 */
export type AuthSessionResponse = GetActiveSessionByJwtReturnType | GetSessionByApiKeyReturnType | GetActiveSessionByOAuthReturnType;

export type OAuthTokenProps = Prisma.OAuthTokenGetPayload<{
  select: {
    id: true;
    userId: true;
    primaryEmailAddress: true;
    accessToken: true;
    idToken: true;
    refreshToken: true;
    expiryDate: true;
    service: true;
  };
}>;
