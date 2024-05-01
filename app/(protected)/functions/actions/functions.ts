'use server';

import * as z from 'zod';
import { ActionError } from '@lib/api-response';
import { FunctionMetaSchema, FunctionSchema } from '@/schemas/function';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';

/**
 * Validates the given values against the provided schema and performs authentication check.
 * 
 * @template T - The type of the schema.
 * @param {T} schema - The schema to validate against.
 * @param {z.infer<T>} values - The values to be validated.
 * @returns {Promise<{ authSession: AuthSession, data: z.infer<T> }>} - The validated data along with the authentication session.
 * @throws {ActionError} - If the fields are invalid or the user is not authenticated.
 */
const _validate = async <T extends z.ZodType<any, any>>(schema: T, values: z.infer<T>) => {
  const validatedFields = schema.safeParse(values);

  if (!validatedFields.success) {
    throw new ActionError('error', 400, 'Invalid fields!');
  }

  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    throw new ActionError('error', 400, 'User not authenticated!');
  }

  return {
    authSession,
    data: validatedFields.data as z.infer<T>
  };
};

export const upsertFunction = async (values: z.infer<typeof FunctionSchema>) => {
  const validatedValues = await _validate(FunctionSchema, values); 
  const { authSession, data } = validatedValues;

  const { slug, code, isPrivate } = data;
  const dbFunction = await db.function.upsert({
    where: {
      ownerUserId: authSession.user.id,
    },
    update: {
      slug,
      code,
      isPrivate
    },
    create: {
      slug,
      code,
      isPrivate,
      ownerUserId: authSession.user.id,
    },
  });


  if (!dbFunction) {
    throw new ActionError('error', 400, 'Failed to update function!');
  }

  return {
    success: 'Function updated!',
    data: dbFunction,
  };
};

export const upsertFunctionMeta = async (values: z.infer<typeof FunctionMetaSchema>) => {
  const validatedValues = await _validate(FunctionMetaSchema, values); 
  const { authSession, data } = validatedValues;

  const { id, functionId, openApiSpec = {} } = data;
  const dbFunctionMeta = await db.functionMeta.upsert({
    where: {
      id,
      functionId,
    },
    update: {
      openApiSpec,
    },
    create: {
      openApiSpec,
      functionId,
    },
  });

  if (!dbFunctionMeta) {
    throw new ActionError('error', 400, 'Failed to update function meta!');
  }

  return {
    success: 'Function meta updated!',
    data: dbFunctionMeta,
  };
}