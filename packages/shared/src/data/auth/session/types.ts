import type { GetActiveSessionByJwtReturnType } from '../../activeSession';
import type { GetSessionByApiKeyReturnType } from '../../apiKey';

/**
 * Options for getting an authentication session.
 */
export type GetAuthSessionOptions = {
  /**
   * Introspect auth tokens.
   * When set to true, the function will attempt to refresh current user OAuth tokens if they exist and expired.
   * @see {@link packages/shared/src/data/auth/session/index.ts getAuthSession}
   */
  introspectOAuthTokens?: boolean;
};

/**
 * Declare type contract for reusability and caching purposes.
 */
export type AuthSessionResponse = GetActiveSessionByJwtReturnType | GetSessionByApiKeyReturnType;
