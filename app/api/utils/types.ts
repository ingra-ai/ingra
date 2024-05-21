import { type ApiSuccess, type ApiError } from '@v1/types/api-response';
import { type NextResponse } from "next/server";

export type ActionTryCatchReturnType<T> = {
  status: 'ok' | 'error';
  message: string;
  data?: T | T[];
};

export type ApiTryCatchReturnType<T> = NextResponse<ApiError | ApiSuccess<T>> | NextResponse<unknown>;

