import { ActionError, ApiError } from '@lib/api-response';
import { Logger } from '@lib/logger';
import { NextResponse } from 'next/server';

export const apiTryCatch = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    Logger.withTag('apiTryCatch').error('Error:', error);

    if (error instanceof ActionError) {
      NextResponse.json(error.toJson(), {
        status: error.status || 500,
      });
    } else {
      NextResponse.json(
        {
          status: 400,
          code: 'BAD_REQUEST',
          message: error?.message || 'Something went wrong. Please try again.',
        } as ApiError,
        {
          status: 400,
        }
      );
    }

    return error;
  }
};
