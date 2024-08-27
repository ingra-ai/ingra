import type { GetActiveSessionByJwtReturnType } from "../../activeSession";
import type { GetSessionByApiKeyReturnType } from "../../apiKey";

/**
 * Declare type contract for reusability and caching purposes.
 */
export type AuthSessionResponse =
  | GetActiveSessionByJwtReturnType
  | GetSessionByApiKeyReturnType;
