import { NextRequest, NextResponse } from "next/server";
import { ApiError } from '@v1/types/api-response';
import { Logger } from "@lib/logger";
import handlerFn from "./handlers/functions";

export async function GET(req: NextRequest, { params }: { params: { functionSlug: string } }) {
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const { functionSlug } = params;

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

  Logger.withTag('marketplace-api').withTag('GET').info(`Function handler ${ functionSlug } invoked.`);
  return await handlerFn(functionSlug, requestArgs);
};

export async function POST(req: NextRequest, { params }: { params: { functionSlug: string } }) {
  const requestArgs = await req.json();
  const { functionSlug } = params;

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

  Logger.withTag('marketplace-api').withTag('POST').info(`Function handler ${ functionSlug } invoked.`);
  return await handlerFn(functionSlug, requestArgs);
}


export async function PUT(req: NextRequest, { params }: { params: { functionSlug: string } }) {
  const requestArgs = await req.json();
  const { functionSlug } = params;

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

  Logger.withTag('marketplace-api').withTag('PUT').info(`Function handler ${ functionSlug } invoked.`);
  return await handlerFn(functionSlug, requestArgs);
}


export async function PATCH(req: NextRequest, { params }: { params: { functionSlug: string } }) {
  const requestArgs = await req.json();
  const { functionSlug } = params;

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

  Logger.withTag('marketplace-api').withTag('PATCH').info(`Function handler ${ functionSlug } invoked.`);
  return await handlerFn(functionSlug, requestArgs);
}

export async function DELETE(req: NextRequest, { params }: { params: { functionSlug: string } }) {
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const { functionSlug } = params;

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

  Logger.withTag('marketplace-api').withTag('DELETE').info(`Function handler ${ functionSlug } invoked.`);
  return await handlerFn(functionSlug, requestArgs);
};
