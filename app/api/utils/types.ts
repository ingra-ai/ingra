import { getUserByPhraseCode } from "@/data/user";
import { type ApiSuccess, type ApiError } from "@lib/api-response";
import { type NextResponse } from "next/server";

export type ApiTryCatchReturnType<T> = NextResponse<ApiError | ApiSuccess<T>> | NextResponse<unknown>;

export type ApiGptTryCallbackArg = NonNullable<Awaited<ReturnType<typeof getUserByPhraseCode>>>;
