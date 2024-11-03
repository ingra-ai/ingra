'use server';

import * as z from 'zod';
import { ActionError } from '@repo/shared/types';
import { FunctionArgumentSchema, FunctionSchema, FunctionTagsSchema } from '@repo/shared/schemas/function';
import { validateAction } from '@repo/shared/lib/action-helpers';
import db from '@repo/db/client';
import { actionAuthTryCatch } from '@repo/shared/utils/actionAuthTryCatch';
import {
  upsertFunction as dataUpsertFunctions,
  deleteFunction as dataDeleteFunctions,
  cloneFunction as dataCloneFunction,
  subscribeToFunction as dataSubscribeToFunction,
  unsubscribeToFunction as dataUnsubscribeToFunction,
} from '@repo/shared/data/functions';
import { addFunctionToCollection, removeFunctionFromCollection } from '@repo/shared/data/collections';
import { getUserRepoFunctionsEditUri } from '@repo/shared/lib/constants/repo';
import isNil from 'lodash/isNil';
import isBoolean from 'lodash/isBoolean';
import { generateUserVars } from '@repo/shared/utils/vm/generateUserVars';
import { generateCodeDefaultTemplate } from '@repo/shared/utils/vm/functions/generateCodeDefaultTemplate';

export const createNewFunction = async (functionPayload: z.infer<typeof FunctionSchema>, collectionRecordIdOrSlug?: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    if (!functionPayload || typeof functionPayload !== 'object' || Object.keys(functionPayload).length === 0) {
      throw new Error('Function payload is empty or invalid. Are you passing the patch data as "{ function: { ... } }"?');
    }
  
    if (functionPayload.id) {
      throw new Error("Creating new function doesn't require an ID. Please remove the ID from the payload.");
    }
  
    if (isNil(functionPayload.slug.trim())) {
      throw new Error('Function slug is required to create a new function.');
    }
  
    if (isNil(functionPayload.description.trim())) {
      throw new Error('Function description is required to create a new function.');
    }

    // Validate username
    if (!authSession.user.profile?.userName) {
      throw new ActionError('error', 400, 'Profile username is not setup.');
    }
    
    const providedFields: (keyof z.infer<typeof FunctionSchema>)[] = ['slug', 'description'];

    /**
     * Populate skeleton function record with user and environment variables as code template.
     */
    const optionalEnvVars = authSession.user.envVars.map((envVar) => ({
        id: envVar.id,
        ownerUserId: envVar.ownerUserId,
        key: envVar.key,
        value: envVar.value,
      })),
      userVarsRecord = generateUserVars(authSession),
      allUserAndEnvKeys = Object.keys(userVarsRecord).concat(optionalEnvVars.map((envVar) => envVar.key));

    const safeFunctionRecord = {
      slug: functionPayload.slug.trim(),
      code: generateCodeDefaultTemplate(allUserAndEnvKeys),
      isPrivate: true,
      isPublished: true,
      httpVerb: 'GET',
      description: functionPayload.description.trim(),
      arguments: [] as z.infer<typeof FunctionArgumentSchema>[],
      tags: [] as z.infer<typeof FunctionTagsSchema>[],
    } as z.infer<typeof FunctionSchema>;

    /**
     * Populate all the provided fields from the payload. If the field is not provided, it will be populated with the default value.
     */
    const acceptableFieldNames: (keyof z.infer<typeof FunctionSchema>)[] = [
      'code', 
      'httpVerb', 
      'isPrivate', 
      'isPublished', 
      'arguments', 
      'tags'
    ];

    /**
     * Iterate through all the acceptable field names and populate the fields that are provided in the payload.
     */
    acceptableFieldNames.forEach((acceptableFieldName) => {
      // Check if the field is provided in the payload
      if (Object.prototype.hasOwnProperty.call(functionPayload, acceptableFieldName)) {
        // Add the field to the provided fields list
        providedFields.push(acceptableFieldName);

        // Populate all the fields that are provided
        switch (acceptableFieldName) {
          case 'code':
            safeFunctionRecord[acceptableFieldName] = functionPayload[acceptableFieldName];
            break;
          case 'httpVerb':
            safeFunctionRecord[acceptableFieldName] = functionPayload[acceptableFieldName];
            break;
          case 'isPrivate':
          case 'isPublished':
            safeFunctionRecord[acceptableFieldName] = isBoolean(functionPayload[acceptableFieldName]) ? functionPayload[acceptableFieldName] : safeFunctionRecord[acceptableFieldName];
            break;
          case 'arguments':
            safeFunctionRecord.arguments = (functionPayload.arguments || [])
              .filter((elem) => elem.name.trim())
              .map((elem) => {
                const newArgument: z.infer<typeof FunctionArgumentSchema> = {
                  functionId: '',
                  name: elem.name,
                  type: elem.type,
                  defaultValue: elem.defaultValue,
                  description: elem.description,
                  isRequired: elem.isRequired,
                };

                return newArgument;
              });
            break;
          case 'tags':
            safeFunctionRecord.tags = (functionPayload.tags || [])
              .filter((elem) => elem.name.trim())
              .map((elem) => {
                const newTag: z.infer<typeof FunctionTagsSchema> = {
                  functionId: '',
                  name: elem.name,
                };

                return newTag;
              });
            break;
          default:
            break;
        }
      }
    });

    const { data } = await validateAction(FunctionSchema, safeFunctionRecord);
    const result = await dataUpsertFunctions(data, authSession.user.id, collectionRecordIdOrSlug);

    return {
      status: 'ok' as const,
      message: `Function "${result.slug}" has been created.`,
      data: result,
    };
  });
}

export const upsertFunction = async (values: z.infer<typeof FunctionSchema>, collectionRecordIdOrSlug?: string) => {
  const validatedValues = await validateAction(FunctionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    // Validate username
    if (!authSession.user.profile?.userName) {
      throw new ActionError('error', 400, 'Profile username is not setup.');
    }

    const result = await dataUpsertFunctions(data, authSession.user.id, collectionRecordIdOrSlug);

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

    if ( !ownerUsername ) {
      throw new ActionError('error', 400, 'Profile username is not setup.');
    }

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

export const togglePublishFunction = async (functionId: string) => {
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

    const result = await db.function.update({
      where: {
        id: functionRecord.id,
      },
      data: {
        isPublished: !functionRecord.isPublished,
      },
    });

    return {
      status: 'ok',
      message: `Function "${functionRecord.slug}" has been ${result.isPublished ? 'published' : 'unpublished'}!`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to publish function!`,
      data: null,
    };
  });
}

export const subscribeToFunction = async (functionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    // Validate username
    if (!authSession.user.profile?.userName) {
      throw new ActionError('error', 400, 'Profile username is not setup.');
    }

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
    // Validate username
    if (!authSession.user.profile?.userName) {
      throw new ActionError('error', 400, 'Profile username is not setup.');
    }

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
