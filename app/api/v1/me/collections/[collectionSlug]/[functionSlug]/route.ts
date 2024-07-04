import { NextRequest, NextResponse } from "next/server";
import { ApiError } from '@v1/types/api-response';
import { Logger } from "@lib/logger";
import handlerFn from "./handlers/functions";
import { getAnalyticsObject } from "@lib/utils";

export async function GET(req: NextRequest, { params }: { params: { collectionSlug: string, functionSlug: string } }) {
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const { collectionSlug, functionSlug } = params;

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

  Logger.withTag('GET|collections').log(`Function handler ${ functionSlug } in collection ${ collectionSlug } invoked.`);
  return await handlerFn(collectionSlug, functionSlug, requestArgs, getAnalyticsObject(req));
}

export async function POST(req: NextRequest, { params }: { params: { collectionSlug: string, functionSlug: string } }) {
  const requestArgs = await req.json();
  const { collectionSlug, functionSlug } = params;

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

  Logger.withTag('POST|collections').log(`Function handler ${ functionSlug } in collection ${ collectionSlug } invoked.`);
  return await handlerFn(collectionSlug, functionSlug, requestArgs, getAnalyticsObject(req));
}


export async function PUT(req: NextRequest, { params }: { params: { collectionSlug: string, functionSlug: string } }) {
  const requestArgs = await req.json();
  const { collectionSlug, functionSlug } = params;

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

  Logger.withTag('PUT|collections').log(`Function handler ${ functionSlug } in collection ${ collectionSlug } invoked.`);
  return await handlerFn(collectionSlug, functionSlug, requestArgs, getAnalyticsObject(req));
}


export async function PATCH(req: NextRequest, { params }: { params: { collectionSlug: string, functionSlug: string } }) {
  const requestArgs = await req.json();
  const { collectionSlug, functionSlug } = params;

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

  Logger.withTag('PATCH|collections').log(`Function handler ${ functionSlug } in collection ${ collectionSlug } invoked.`);
  return await handlerFn(collectionSlug, functionSlug, requestArgs, getAnalyticsObject(req));
}

export async function DELETE(req: NextRequest, { params }: { params: { collectionSlug: string, functionSlug: string } }) {
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const { collectionSlug, functionSlug } = params;

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

  Logger.withTag('DELETE|collections').log(`Function handler ${ functionSlug } in collection ${ collectionSlug } invoked.`);
  return await handlerFn(collectionSlug, functionSlug, requestArgs, getAnalyticsObject(req));
}
