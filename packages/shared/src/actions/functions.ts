'use server';

import * as z from 'zod';
import { ActionError } from '../types/api-response';
import { FunctionSchema } from '../schemas/function';
import { validateAction } from '../lib/action-helpers';
import db from '@repo/db/client';
import { actionAuthTryCatch } from '../utils/actionAuthTryCatch';
import {
  upsertFunction as dataUpsertFunctions,
  deleteFunction as dataDeleteFunctions,
  cloneFunction as dataCloneFunction,
  subscribeToFunction as dataSubscribeToFunction,
  unsubscribeToFunction as dataUnsubscribeToFunction,
  toggleFunctionSubscription,
} from '../data/functions';
import { addFunctionToCollection, removeFunctionFromCollection } from '../data/collections';
import { getUserRepoFunctionsEditUri } from '../lib/constants/repo';

export const upsertFunction = async (values: z.infer<typeof FunctionSchema>) => {
  const validatedValues = await validateAction(FunctionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataUpsertFunctions(data, authSession.user.id);

    return {
      status: 'ok',
      message: `Function "${result.slug}" has been ${data.id ? 'updated' : 'created'}.`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to ${data.id ? 'update' : 'create'} function!`,
      data: null,
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
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to delete function!`,
      data: null,
    };
  });
};

export const cloneFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const clonedFunction = await dataCloneFunction(functionId, authSession.user.id),
      ownerUsername = authSession.user.profile?.userName;

    return {
      status: 'ok',
      message: `Function "${clonedFunction.slug}" has been cloned!`,
      data: {
        ...clonedFunction,
        ...(ownerUsername && {
          href: getUserRepoFunctionsEditUri(ownerUsername, clonedFunction.slug),
        }),
      },
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to clone function!`,
      data: null,
    };
  });
};

export const subscribeToFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const record = await dataSubscribeToFunction(functionId, authSession.user.id);

    return {
      status: 'ok',
      message: record.isSubscribed ? `Function "${record.functionSlug}" has been subscribed!` : `Function "${record.functionSlug}" has been unsubscribed!`,
      data: record,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to subscribe to function!`,
      data: null,
    };
  });
};

export const unsubscribeToFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const record = await dataUnsubscribeToFunction(functionId, authSession.user.id);

    return {
      status: 'ok',
      message: record.isSubscribed ? `Function "${record.functionSlug}" has been subscribed!` : `Function "${record.functionSlug}" has been unsubscribed!`,
      data: record,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to unsubscribe to function!`,
      data: null,
    };
  });
};

export const subscribeToggleFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const subscribedFunction = await toggleFunctionSubscription(functionId, authSession.user.id);

    return {
      status: 'ok',
      message: subscribedFunction.isSubscribed ? `Function "${subscribedFunction.functionSlug}" has been subscribed!` : `Function "${subscribedFunction.functionSlug}" has been unsubscribed!`,
      data: subscribedFunction,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to perform operation!`,
      data: null,
    };
  });
};

export const collectionToggleFunction = async (functionId: string, collectionId: string, action: 'add' | 'remove') => {
  return await actionAuthTryCatch(async (authSession) => {
    if (action === 'add') {
      await addFunctionToCollection(functionId, collectionId, authSession.user.id);
      return {
        status: 'ok',
        message: 'Successfully added function to collection',
        data: null,
      };
    } else if (action === 'remove') {
      await removeFunctionFromCollection(functionId, collectionId, authSession.user.id);
      return {
        status: 'ok',
        message: 'Successfully removed function to collection',
        data: null,
      };
    } else {
      throw new ActionError('error', 400, 'Invalid action');
    }
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to perform operation!`,
      data: null,
    };
  });
};
