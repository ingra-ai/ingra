import {
  ActionError,
  PrismaActionError,
  type ApiError,
} from "../types/api-response";
import { Logger } from "../lib/logger";
import { NextResponse } from "next/server";
import type { ApiTryCatchReturnType } from "./types";
import { Prisma } from "@repo/db/prisma";

export const apiTryCatch = async <T>(
  fn: () => Promise<ApiTryCatchReturnType<T>>,
): Promise<ApiTryCatchReturnType<T>> => {
  try {
    return await fn();
  } catch (error: any) {
    Logger.withTag("apiTryCatch").error(
      error?.message || "Something went wrong.",
    );

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = new PrismaActionError(error);

      const apiError = prismaError.toJson();

      return NextResponse.json(apiError, {
        status: apiError.status || 500,
      });
    } else if (error instanceof ActionError) {
      const apiError = error.toJson();

      return NextResponse.json(apiError, {
        status: apiError.status || 500,
      });
    } else {
      return NextResponse.json(
        {
          status: 400,
          code: "BAD_REQUEST",
          message: error?.message || "Something went wrong. Please try again.",
        } as ApiError,
        {
          status: 400,
        },
      );
    }
  }
};
