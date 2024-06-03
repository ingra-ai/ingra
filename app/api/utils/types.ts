import { type ApiSuccess, type ApiError } from '@v1/types/api-response';
import { type NextResponse } from "next/server";

export type ActionTryCatchReturnType<T> = {
  status: 'ok';
  message: string;
  data: T;
} | {
  status: 'error';
  message: string;
  data?: null;
};

export type ApiTryCatchReturnType<T> = NextResponse<ApiError | ApiSuccess<T>> | NextResponse<unknown> | Response;

