import { NextRequest, NextResponse } from "next/server";
import { ApiError } from '@v1/types/api-response';
import { Logger } from "@lib/logger";
import handlerFn from "./handlers/functions";
import { getAnalyticsObject } from "@lib/utils";

export async function GET(req: NextRequest, { params }: { params: { userName: string, functionSlug: string } }) {
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const { userName, functionSlug } = params;

  // Check if the handler function exists
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Unable to understand the request.'
      } as ApiError,
      {
        status: 400
      }
    );
  }

  Logger.withTag('GET|functionsSubscriptions').log(`Function handler ${ functionSlug } of ${ userName } invoked.`);
  return await handlerFn(userName, functionSlug, requestArgs, getAnalyticsObject(req));
}

export async function POST(req: NextRequest, { params }: { params: { userName: string, functionSlug: string } }) {
  const requestArgs = await req.json();
  const { userName, functionSlug } = params;

  // Check if the handler function exists
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Unable to understand the request.'
      } as ApiError,
      {
        status: 400
      }
    );
  }

  Logger.withTag('POST|functionsSubscriptions').log(`Function handler ${ functionSlug } of ${ userName } invoked.`);
  return await handlerFn(userName, functionSlug, requestArgs, getAnalyticsObject(req));
}


export async function PUT(req: NextRequest, { params }: { params: { userName: string, functionSlug: string } }) {
  const requestArgs = await req.json();
  const { userName, functionSlug } = params;

  // Check if the handler function exists
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Unable to understand the request.'
      } as ApiError,
      {
        status: 400
      }
    );
  }

  Logger.withTag('PUT|functionsSubscriptions').log(`Function handler ${ functionSlug } of ${ userName } invoked.`);
  return await handlerFn(userName, functionSlug, requestArgs, getAnalyticsObject(req));
}


export async function PATCH(req: NextRequest, { params }: { params: { userName: string, functionSlug: string } }) {
  const requestArgs = await req.json();
  const { userName, functionSlug } = params;

  // Check if the handler function exists
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Unable to understand the request.'
      } as ApiError,
      {
        status: 400
      }
    );
  }

  Logger.withTag('PATCH|functionsSubscriptions').log(`Function handler ${ functionSlug } of ${ userName } invoked.`);
  return await handlerFn(userName, functionSlug, requestArgs, getAnalyticsObject(req));
}

export async function DELETE(req: NextRequest, { params }: { params: { userName: string, functionSlug: string } }) {
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const { userName, functionSlug } = params;

  // Check if the handler function exists
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Unable to understand the request.'
      } as ApiError,
      {
        status: 400
      }
    );
  }

  Logger.withTag('DELETE|functionsSubscriptions').log(`Function handler ${ functionSlug } of ${ userName } invoked.`);
  return await handlerFn(userName, functionSlug, requestArgs, getAnalyticsObject(req));
}
