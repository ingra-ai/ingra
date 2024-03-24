import { ActionError, type ApiError, type ApiSuccess } from '@lib/api-response';
import { Logger } from '@lib/logger';
import { NextResponse } from 'next/server';
import type { ApiTryCatchReturnType } from './types';

export const apiTryCatch = async <T>( fn: () => Promise<ApiTryCatchReturnType<T>> ): Promise<ApiTryCatchReturnType<T>> => {
  try {
    return await fn();
  }
  catch ( error: any ) {
    Logger.error( '[apiTryCatch]', 'Error:', error );

    if ( error instanceof ActionError ) {
      return NextResponse.json( error.toJson(),
        {
          status: error.status || 500
        }
      );
    }
    else {
      return NextResponse.json(
        {
          status: 400,
          code: 'BAD_REQUEST',
          message: error?.message || 'Something went wrong. Please try again.'
        } as ApiError,
        {
          status: 400
        }
      );
    }
  }
};
