import type { GetActiveSessionByJwtReturnType } from "@/data/activeSession";
import type { GetSessionByApiKeyReturnType } from "@/data/apiKey";

/**
 * Declare type contract for reusability and caching purposes.
 */
export type AuthSessionResponse = GetActiveSessionByJwtReturnType | GetSessionByApiKeyReturnType;
