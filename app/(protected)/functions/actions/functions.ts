'use server';

import * as z from 'zod';
import { ActionError } from '@v1/types/api-response';
import { FunctionSchema } from '@/schemas/function';
import { validateAction } from '@lib/action-helpers';
import db from '@lib/db';
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';
import {
  upsertFunction as dataUpsertFunctions,
  deleteFunction as dataDeleteFunctions,
  forkFunction as dataForkFunctions,
} from '@/data/functions';

export const upsertFunction = async (values: z.infer<typeof FunctionSchema>) => {
  const validatedValues = await validateAction(FunctionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataUpsertFunctions(data, authSession.user.id);

    return {
      status: 'ok',
      message: `Function "${result.slug}" has been ${data.id ? 'updated' : 'created'}.`,
      data: result
    };
  });
};

export const deleteFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const functionRecord = await db.function.findUnique({
      where: {
        id: functionId,
        ownerUserId: authSession.user.id,
      },
    });

    if (!functionRecord) {
      throw new ActionError('error', 404, 'Function not found');
    }

    const result = await dataDeleteFunctions(functionRecord.id, authSession.user.id);

    return {
      status: 'ok',
      message: `Function "${result.slug}" deleted!`,
      data: result
    };
  });
}

export const forkFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const forkedFunction = await dataForkFunctions(functionId, authSession.user.id);

    return {
      status: 'ok',
      message: `Function "${forkedFunction.slug}" has been forked!`,
      data: forkedFunction
    };
  });
}
