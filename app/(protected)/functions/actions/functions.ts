'use server';

import * as z from 'zod';
import { ActionError, PrismaActionError } from '@v1/types/api-response';
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
            arguments: {
              create: (functionArguments || []).map(arg => ({
                name: arg.name,
                type: arg.type,
                isRequired: arg.isRequired,
                defaultValue: arg.defaultValue,
                description: arg.description,
              })),
            },
            tags: {
              create: (functionTags || []).map(tag => ({
                name: tag.name,
              })),
            },
            ownerUserId: authSession.user.id
          },
        });

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
    throw new ActionError('error', 401, `Unauthorized session.`);
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

  const relationshipRemovePromises = [
    // Delete function arguments
    db.functionArgument.deleteMany({
      where: {
        functionId,
      },
    }),

    // Delete function tags
    db.functionTag.deleteMany({
      where: {
        functionId,
      },
    }),

    // Delete associated function forks where this function is the original function
    db.functionFork.deleteMany({
      where: {
        originalFunctionId: functionId,
      },
    }),

    // Delete associated function forks where this function is the forked function
    db.functionFork.deleteMany({
      where: {
        forkedFunctionId: functionId,
      },
    }),
  ];

  await Promise.all(relationshipRemovePromises);
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

export const forkFunction = async (functionId: string) => {
  const authSession = await getAuthSession();

  if (!authSession) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      isPublished: true,
      isPrivate: false,
    },
    include: {
      arguments: true,
      tags: true,
    },
  });

  if (!functionRecord) {
    throw new ActionError('error', 404, 'Function not found');
  }

  // Check if the new slug is already taken by the current user
  const existingFunction = await db.function.findFirst({
    where: {
      ownerUserId: authSession.user.id,
      slug: functionRecord.slug,
    },
  });

  if ( existingFunction ) {
    throw new ActionError('error', 400, 'Function with the same slug already exists');
  }

  const newFunction = await db.function.create({
    data: {
      slug: functionRecord.slug,
      code: functionRecord.code,
      isPrivate: true,
      isPublished: false,
      httpVerb: functionRecord.httpVerb,
      description: functionRecord.description,
      ownerUserId: authSession.user.id,
      arguments: {
        create: functionRecord.arguments.map(arg => ({
          name: arg.name,
          type: arg.type,
          isRequired: arg.isRequired,
          defaultValue: arg.defaultValue,
          description: arg.description,
        })),
      },
      tags: {
        create: functionRecord.tags.map(tag => ({
          name: tag.name,
        })),
      },
    },
  });

  // Create a record in FunctionFork
  await db.functionFork.create({
    data: {
      originalFunctionId: functionRecord.id,
      forkedFunctionId: newFunction.id,
      createdAt: new Date(),
    },
  });

  return {
    success: 'Function forked!',
    data: newFunction,
  };
}
