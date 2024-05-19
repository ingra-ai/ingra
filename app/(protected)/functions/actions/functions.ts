'use server';

import * as z from 'zod';
import { ActionError, PrismaActionError } from '@lib/api-response';
import { FunctionMetaSchema, FunctionSchema } from '@/schemas/function';
import { validateAction } from '@lib/action-helpers';
import db from '@lib/db';
import { Logger } from '@lib/logger';
import { getAuthSession } from '@app/auth/session';

export const upsertFunction = async (values: z.infer<typeof FunctionSchema>) => {
  const validatedValues = await validateAction(FunctionSchema, values);
  const { authSession, data } = validatedValues;

  const {
    id: recordId, slug, code, isPrivate, httpVerb, description, arguments: functionArguments
  } = data;

  try {
    const result = await db.$transaction(async (prisma) => {
      // If recordId exists, that means user is editing.
      if (recordId) {
        // Check if the function exists
        const existingFunction = await prisma.function.findUnique({
          where: {
            id: values.id,
            ownerUserId: authSession.user.id,
          },
        });

        if ( !existingFunction ) {
          throw new Error('Function not found');
        }

        // Delete existing arguments
        await prisma.functionArgument.deleteMany({
          where: { functionId: existingFunction.id },
        });

        // Update the function
        await prisma.function.update({
          where: {
            id: existingFunction.id,
            ownerUserId: authSession.user.id,
          },
          data: {
            slug,
            code,
            isPrivate,
            httpVerb,
            description,
            updatedAt: new Date()
          },
        });

        // Insert new arguments
        if (functionArguments) {
          await prisma.functionArgument.createMany({
            data: functionArguments.map(arg => ({
              ...arg,
              functionId: existingFunction.id
            })),
          });
        }
      } else {
        // Create new function and arguments
        const newFunction = await prisma.function.create({
          data: {
            slug,
            code,
            isPrivate,
            httpVerb,
            description,
            ownerUserId: authSession.user.id
          },
        });

        const hasArguments = functionArguments && Array.isArray(functionArguments) && functionArguments.length;
        if ( hasArguments ) {
          await prisma.functionArgument.createMany({
            data: functionArguments.map(arg => ({
              ...arg,
              functionId: newFunction.id
            })),
          });
        }

        return newFunction;
      }
    });

    return {
      success: 'Function upserted successfully!',
      data: result,
    };
  } catch (error: any) {
    Logger.error('Failed to upsert function', error);
    throw new PrismaActionError(error);
  }
};

export const upsertFunctionMeta = async (values: z.infer<typeof FunctionMetaSchema>) => {
  const validatedValues = await validateAction(FunctionMetaSchema, values); 
  const { data } = validatedValues;

  const { id, functionId, openApiSpec = {}, responses = {} } = data;
  const dbFunctionMeta = await db.functionMeta.upsert({
    where: {
      id: id || undefined,
      functionId,
    },
    update: {
      openApiSpec,
      responses
    },
    create: {
      openApiSpec,
      responses,
      functionId,
    },
  });

  if (!dbFunctionMeta) {
    Logger.error('Failed to upsert function meta');
    throw new ActionError('error', 400, 'Failed to update function meta!');
  }

  return {
    success: 'Function meta updated!',
    data: dbFunctionMeta,
  };
}

export const deleteFunction = async (functionId: string) => {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 400, 'User not authenticated!');
  }
  
  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      ownerUserId: authSession.user.id,
    },
  });

  if (!functionRecord) {
    throw new ActionError('error', 404, 'Function not found');
  }

  await db.function.delete({
    where: {
      id: functionId,
      ownerUserId: authSession.user.id
    },
  });

  return {
    success: 'Function deleted!',
  };
}