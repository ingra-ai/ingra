'use server';

import * as z from 'zod';
import { ActionError } from '@v1/types/api-response';
import { CollectionSchema } from '@/schemas/collections';
import { validateAction } from '@lib/action-helpers';
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';
import {
  addNewCollection as dataAddNewCollection,
  editCollection as dataEditCollection,
  deleteCollection as dataDeleteCollection,
  
} from '@/data/collections';

export const createCollection = async (values: z.infer<typeof CollectionSchema>) => {
  const validatedValues = await validateAction(CollectionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataAddNewCollection(data.name, data.slug, data.description, authSession.user.id);

    return {
      status: 'ok',
      message: `Collection "${result.slug}" created!`,
      data: result
    };
  });
}

export const updateCollection = async (collectionId: string, values: z.infer<typeof CollectionSchema>) => {
  const validatedValues = await validateAction(CollectionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataEditCollection(collectionId, data.name, data.slug, data.description, authSession.user.id);

    return {
      status: 'ok',
      message: `Collection "${result.slug}" updated!`,
      data: result
    };
  });
}

export const deleteCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataDeleteCollection(collectionId, authSession.user.id);

    return {
      status: 'ok',
      message: `Collection has been deleted!`,
      data: result
    };
  });
}
