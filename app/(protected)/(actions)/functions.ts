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
  cloneFunction as dataCloneFunction,
  toggleFunctionSubscription,
} from '@data/functions';
import { addFunctionToCollection, removeFunctionFromCollection } from '@data/collections';

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
      message: `Function "${functionRecord.slug}" deleted!`,
      data: result
    };
  });
};

export const cloneFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const clonedFunction = await dataCloneFunction(functionId, authSession.user.id);

    return {
      status: 'ok',
      message: `Function "${clonedFunction.slug}" has been cloned!`,
      data: {
        ...clonedFunction,
        href: `/repo/${authSession.user.profile?.userName}/functions/edit/${clonedFunction.id}`
      }
    };
  });
};

export const subscribeToggleFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const subscribedFunction = await toggleFunctionSubscription(functionId, authSession.user.id);

    return {
      status: 'ok',
      message: subscribedFunction.isSubscribed ? `Function "${subscribedFunction.functionSlug}" has been subscribed!` : `Function "${subscribedFunction.functionSlug}" has been unsubscribed!`,
      data: subscribedFunction
    };
  });
};

export const collectionToggleFunction = async (functionId: string, collectionId: string, action: 'add' | 'remove') => {
  return await actionAuthTryCatch(async (authSession) => {

    if ( action === 'add' ) {
      await addFunctionToCollection(functionId, collectionId, authSession.user.id);
      return {
        status: 'ok',
        message: 'Successfully added function to collection',
        data: null
      };
    }
    else if ( action === 'remove' ) {
      await removeFunctionFromCollection(functionId, collectionId, authSession.user.id);
      return {
        status: 'ok',
        message: 'Successfully removed function to collection',
        data: null
      };
    }
    else {
      throw new ActionError('error', 400, 'Invalid action');
    }
  });

};