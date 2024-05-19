import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@lib/api-response";
import { Logger } from "@lib/logger";
import * as handlers from "./handlers";

export async function GET(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;
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

  Logger.withTag('GET').withTag('user-api').info(`[${username}] invokes ${ handlerName } handler.`);
  return await handlerFn(requestArgs, username, ...restOfPaths);
};

export async function POST(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;
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

  Logger.withTag('POST').withTag('user-api').info(`[${username}] invokes ${ handlerName } handler.`);
  return await handlerFn(requestArgs, username, ...restOfPaths);
}


export async function PUT(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;
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

  Logger.withTag('PUT').withTag('user-api').info(`[${username}] invokes ${ handlerName } handler.`);
  return await handlerFn(requestArgs, username, ...restOfPaths);
}


export async function PATCH(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;
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

  Logger.withTag('PATCH').withTag('user-api').info(`[${username}] invokes ${ handlerName } handler.`);
  return await handlerFn(requestArgs, username, ...restOfPaths);
}

export async function DELETE(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;
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

  Logger.withTag('DELETE').withTag('user-api').info(`[${username}] invokes ${ handlerName } handler.`);
  return await handlerFn(requestArgs, username, ...restOfPaths);
};
