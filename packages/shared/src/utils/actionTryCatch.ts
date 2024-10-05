import { ActionError, PrismaActionError } from '../types/api-response';
import { Logger } from '../lib/logger';
import type { ActionTryCatchReturnType } from './types';
import { Prisma } from '@repo/db/prisma';

export const actionTryCatch = async <T>(fn: () => Promise<ActionTryCatchReturnType<T>>) => {
  try {
    return await fn();
  } catch (error: any) {
    Logger.withTag('actionTryCatch').error(error?.message || 'Something went wrong.');

    let actionError: ActionTryCatchReturnType<any> = {
      status: 'error',
      message: error?.message || 'Something went wrong.',
      data: null,
    };

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = new PrismaActionError(error);
      const apiError = prismaError.toJson();
      actionError.message = apiError.message;
    } else if (typeof error?.toJson === 'function' || error instanceof ActionError) {
      const apiError = error.toJson();
      actionError.message = apiError.message;
    }

    return actionError;
  }
};
