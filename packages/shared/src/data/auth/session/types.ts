import type { GetActiveSessionByJwtReturnType } from '../../activeSession';
import type { GetSessionByApiKeyReturnType } from '../../apiKey';

export type GetAuthSessionOptions = {
  introspectOAuthTokens?: boolean;
};

/**
 * Declare type contract for reusability and caching purposes.
 */
export type AuthSessionResponse = GetActiveSessionByJwtReturnType | GetSessionByApiKeyReturnType;
