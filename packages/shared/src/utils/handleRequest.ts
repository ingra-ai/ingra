import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@repo/shared/types';
import { Logger } from '../lib/logger';
import { getAnalyticsObject } from '../lib/utils/getAnalyticsObject';

export async function getRequestArgs(req: NextRequest) {
  const method = req.method.toUpperCase();
  const contentType = req.headers.get('Content-Type');

  let requestArgs: Record<string, any> = {};

  if (method === 'GET' || method === 'DELETE') {
    const { searchParams } = new URL(req.url);
    requestArgs = Object.fromEntries(searchParams);
  } else {
    if ( contentType === 'application/x-www-form-urlencoded' ) {
      const formData = await req.formData();
      requestArgs = Object.fromEntries(formData);
    }
    else {
      requestArgs = await req.json();
    }
  }

  return requestArgs;
}

// Common handler for all HTTP methods
export async function handleRequest<T extends {}, U extends {}>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', req: NextRequest, params: T, handlerFn: (args: U) => Promise<Response | NextResponse>) {
  const requestArgs = await getRequestArgs(req);

  // Check if the handler function exists
  if (typeof handlerFn !== 'function') {
    return NextResponse.json(
      {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Unable to understand the request.',
      } as ApiError,
      {
        status: 400,
      }
    );
  }

  Logger.withTag(`${method}`).log(`Request handler ${req.url} invoked.`);

  const args: U = {
    params,
    requestArgs,
    requestHeaders: req.headers,
    analyticsObject: getAnalyticsObject(req),
  } as unknown as U;

  return await handlerFn(args);
}
