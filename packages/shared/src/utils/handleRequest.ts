import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "../types/api-response";
import { Logger } from "../lib/logger";
import { getAnalyticsObject } from "../lib/utils/getAnalyticsObject";

// Common handler for all HTTP methods
export async function handleRequest<T extends {}, U extends {}>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  req: NextRequest,
  params: T,
  handlerFn: (args: U) => Promise<Response | NextResponse>,
) {
  let requestArgs: Record<string, any>;

  if (method === "GET" || method === "DELETE") {
    const { searchParams } = new URL(req.url);
    requestArgs = Object.fromEntries(searchParams);
  } else {
    requestArgs = await req.json();
  }

  // Check if the handler function exists
  if (typeof handlerFn !== "function") {
    return NextResponse.json(
      {
        status: 400,
        code: "BAD_REQUEST",
        message: "Unable to understand the request.",
      } as ApiError,
      {
        status: 400,
      },
    );
  }

  Logger.withTag(`${method}`).log(`Request handler ${req.url} invoked.`);

  const args: U = {
    params,
    requestArgs,
    analyticsObject: getAnalyticsObject(req),
  } as unknown as U;

  return await handlerFn(args);
}
