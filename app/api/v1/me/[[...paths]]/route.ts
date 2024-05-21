import { NextRequest, NextResponse } from "next/server";
import { ApiError } from '@v1/types/api-response';
import { Logger } from "@lib/logger";
import * as handlers from "./handlers";

export async function GET(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const [handlerName, ...restOfPaths] = paths;

  // Check if the handler exists
  const handlerFn = ( handlers as any )?.[handlerName];
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Unable to complete the request.'
      } as ApiError,
      {
        status: 404
      }
    );
  }

  Logger.withTag('user-api').withTag('GET').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
};

export async function POST(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const requestArgs = await req.json();
  const [handlerName, ...restOfPaths] = paths;

  // Check if the handler exists
  const handlerFn = ( handlers as any )?.[handlerName];
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Unable to complete the request.'
      } as ApiError,
      {
        status: 404
      }
    );
  }

  Logger.withTag('user-api').withTag('POST').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
}


export async function PUT(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const requestArgs = await req.json();
  const [handlerName, ...restOfPaths] = paths;

  // Check if the handler exists
  const handlerFn = ( handlers as any )?.[handlerName];
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Unable to complete the request.'
      } as ApiError,
      {
        status: 404
      }
    );
  }

  Logger.withTag('user-api').withTag('PUT').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
}


export async function PATCH(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const requestArgs = await req.json();
  const [handlerName, ...restOfPaths] = paths;

  // Check if the handler exists
  const handlerFn = ( handlers as any )?.[handlerName];
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Unable to complete the request.'
      } as ApiError,
      {
        status: 404
      }
    );
  }

  Logger.withTag('user-api').withTag('PATCH').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
}

export async function DELETE(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const [handlerName, ...restOfPaths] = paths;

  // Check if the handler exists
  const handlerFn = ( handlers as any )?.[handlerName];
  if ( typeof handlerFn !== 'function' ) {
    return NextResponse.json(
      {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Unable to complete the request.'
      } as ApiError,
      {
        status: 404
      }
    );
  }

  Logger.withTag('user-api').withTag('DELETE').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
};