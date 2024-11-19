'use server';
import db from '@repo/db/client';
import { Logger } from '@repo/shared/lib/logger';
import { sanitizeJson } from '../lib/utils/sanitizeJson';

export async function logFunctionExecution({
  functionId,
  userId,
  requestData,
  responseData,
  executionTime,
  error,
}: {
  functionId: string;
  userId?: string | null;
  requestData?: any;
  responseData?: any;
  executionTime?: number;
  error?: string | null;
}) {
  try {
    return await db.functionExecutionLog.create({
      data: {
        functionId,
        userId,
        requestData: sanitizeJson(requestData),
        responseData: sanitizeJson(responseData),
        executionTime,
        error,
      },
    });
  } catch (err) {
    Logger.withTag('logFunctionExecution').error('Failed to log function execution', error);
    return false;
  }
}
