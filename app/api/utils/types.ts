import { getUserByPhraseCode } from "@/data/user";
import { type ApiSuccess, type ApiError } from "@lib/api-response";
import { type NextResponse } from "next/server";

export type ApiTryCatchReturnType<T> = NextResponse<ApiError | ApiSuccess<T>> | NextResponse<unknown>;

export type ApiGptTryCallbackArg = NonNullable<Awaited<ReturnType<typeof getUserByPhraseCode>>>;

export type ApiUserTryContextArg = {
  envVars: {
    oauthTokens: {
      scope: string;
      tokenType: string;
      service: string;
      idToken: string | null;
      accessToken: string;
      primaryEmailAddress: string;
    }[];
  };
  [key: string]: any;
};
