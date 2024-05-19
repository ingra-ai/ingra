'use server';

import * as z from 'zod';
import { ActionError, PrismaActionError } from '@lib/api-response';
import { FunctionSchema } from '@/schemas/function';
import { validateAction } from '@lib/action-helpers';
import db from '@lib/db';
import { Logger } from '@lib/logger';
import { getAuthSession } from '@app/auth/session';

export const upsertFunction = async (values: z.infer<typeof FunctionSchema>) => {
  const validatedValues = await validateAction(FunctionSchema, values);
  const { authSession, data } = validatedValues;

  const {
    id: recordId,
    slug,
    code,
    isPrivate,
    isPublished,
    httpVerb,
    description,
    arguments: functionArguments,
    tags: functionTags,
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

        // Delete existing arguments and tags
        await Promise.all([
          prisma.functionArgument.deleteMany({
            where: { functionId: existingFunction.id },
          }),
          prisma.functionTag.deleteMany({
            where: { functionId: existingFunction.id },
          }),
        ]);

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
            isPublished,
            httpVerb,
            description,
            updatedAt: new Date()
          },
        });

        // Insert new arguments and tags
        const insertArgAndTagPromises = [];

        // Insert new arguments
        if (functionArguments) {
          insertArgAndTagPromises.push(
            prisma.functionArgument.createMany({
              data: functionArguments.map(arg => ({
                ...arg,
                functionId: existingFunction.id
              })),
            })
          );
        }

        // Insert new tags
        if (functionTags) {
          insertArgAndTagPromises.push(
            prisma.functionTag.createMany({
              data: functionTags.map(tag => ({
                ...tag,
                functionId: existingFunction.id
              })),
            })
          );
        }

        await Promise.all(insertArgAndTagPromises);
      } else {
        // Create new function and arguments
        const newFunction = await prisma.function.create({
          data: {
            slug,
            code,
            isPrivate,
            isPublished,
            httpVerb,
            description,
            ownerUserId: authSession.user.id
          },
        });

        // Insert new arguments and tags
        const insertArgAndTagPromises = [];

        const hasArguments = functionArguments && Array.isArray(functionArguments) && functionArguments.length;
        if ( hasArguments ) {
          insertArgAndTagPromises.push(
            prisma.functionArgument.createMany({
              data: functionArguments.map(arg => ({
                ...arg,
                functionId: newFunction.id
              })),
            })
          );
        }

        const hasTags = functionTags && Array.isArray(functionTags) && functionTags.length;
        if ( hasTags ) {
          insertArgAndTagPromises.push(
            prisma.functionTag.createMany({
              data: functionTags.map(tag => ({
                ...tag,
                functionId: newFunction.id
              })),
            })
          );
        }

        await Promise.all(insertArgAndTagPromises);

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

  // Delete function arguments
  await db.functionArgument.deleteMany({
    where: {
      functionId,
    },
  });

  // Delete function tags
  await db.functionTag.deleteMany({
    where: {
      functionId,
    },
  });

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