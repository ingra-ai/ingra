import { NextRequest, NextResponse } from "next/server";
import { ApiError } from '@v1/types/api-response';
import { Logger } from "@lib/logger";
import * as handlers from "./handlers";
import { WHITELIST_GET_ROUTES, WHITELIST_POST_ROUTES, WHITELIST_PUT_ROUTES, WHITELIST_PATCH_ROUTES, WHITELIST_DELETE_ROUTES } from "./handlerWhitelists";

export async function GET(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const [handlerName, ...restOfPaths] = paths;

  // Check whitelist
  if ( WHITELIST_GET_ROUTES.indexOf(handlerName) === -1 ) {
    return NextResponse.json(
      {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You are not allowed to access this route.'
      } as ApiError,
      {
        status: 403
      }
    );
  }

  // Check if the handler function exists
  const handlerFn = ( handlers as any )?.[handlerName];
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

  Logger.withTag('user-api').withTag('GET').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
};

export async function POST(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const requestArgs = await req.json();
  const [handlerName, ...restOfPaths] = paths;

  // Check whitelist
  if ( WHITELIST_POST_ROUTES.indexOf(handlerName) === -1 ) {
    return NextResponse.json(
      {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You are not allowed to access this route.'
      } as ApiError,
      {
        status: 403
      }
    );
  }

  // Check if the handler function exists
  const handlerFn = ( handlers as any )?.[handlerName];
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

  Logger.withTag('user-api').withTag('POST').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
}


export async function PUT(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const requestArgs = await req.json();
  const [handlerName, ...restOfPaths] = paths;

  // Check whitelist
  if ( WHITELIST_PUT_ROUTES.indexOf(handlerName) === -1 ) {
    return NextResponse.json(
      {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You are not allowed to access this route.'
      } as ApiError,
      {
        status: 403
      }
    );
  }

  // Check if the handler function exists
  const handlerFn = ( handlers as any )?.[handlerName];
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

  Logger.withTag('user-api').withTag('PUT').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
}


export async function PATCH(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const requestArgs = await req.json();
  const [handlerName, ...restOfPaths] = paths;

  // Check whitelist
  if ( WHITELIST_PATCH_ROUTES.indexOf(handlerName) === -1 ) {
    return NextResponse.json(
      {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You are not allowed to access this route.'
      } as ApiError,
      {
        status: 403
      }
    );
  }

  // Check if the handler function exists
  const handlerFn = ( handlers as any )?.[handlerName];
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

  Logger.withTag('user-api').withTag('PATCH').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
}

export async function DELETE(req: NextRequest, { params }: { params: { paths: string[] } }) {
  const { paths } = params;
  const { searchParams } = new URL(req.url);
  const requestArgs = Object.fromEntries(searchParams);
  const [handlerName, ...restOfPaths] = paths;

  // Check whitelist
  if ( WHITELIST_DELETE_ROUTES.indexOf(handlerName) === -1 ) {
    return NextResponse.json(
      {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You are not allowed to access this route.'
      } as ApiError,
      {
        status: 403
      }
    );
  }

  // Check if the handler function exists
  const handlerFn = ( handlers as any )?.[handlerName];
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

  Logger.withTag('user-api').withTag('DELETE').info(`handler ${ handlerName } invoked.`);
  return await handlerFn(requestArgs, ...restOfPaths);
};
