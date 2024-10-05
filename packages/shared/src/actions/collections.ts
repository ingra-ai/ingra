'use server';

import * as z from 'zod';
import { CollectionSchema } from '../schemas/collections';
import { validateAction } from '../lib/action-helpers';
import { actionAuthTryCatch } from '../utils/actionAuthTryCatch';
import {
  addNewCollection as dataAddNewCollection,
  editCollection as dataEditCollection,
  deleteCollection as dataDeleteCollection,
  subscribeToCollection as dataSubscribeToCollection,
  unsubscribeToCollection as dataUnsubscribeToCollection
} from '../data/collections';

export const createCollection = async (values: z.infer<typeof CollectionSchema>) => {
  const validatedValues = await validateAction(CollectionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataAddNewCollection(data.name, data.slug, data.description, authSession.user.id);

    return {
      status: 'ok',
      message: `Collection "${result.slug}" created!`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to create collection!`,
      data: null,
    };
  });
};

export const updateCollection = async (collectionId: string, values: z.infer<typeof CollectionSchema>) => {
  const validatedValues = await validateAction(CollectionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataEditCollection(collectionId, data.name, data.slug, data.description, authSession.user.id);

    return {
      status: 'ok',
      message: `Collection "${result.slug}" updated!`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to update collection!`,
      data: null,
    };
  });
};

export const deleteCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataDeleteCollection(collectionId, authSession.user.id);

    return {
      status: 'ok',
      message: `Collection has been deleted!`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to delete collection!`,
      data: null,
    };
  });
};

export const subscribeToCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataSubscribeToCollection(collectionId, authSession.user.id);

    return {
      status: 'ok',
      message: `Subscribed to collection!`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to subscribe to collection!`,
      data: null,
    };
  });
};

export const unsubscribeToCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataUnsubscribeToCollection(collectionId, authSession.user.id);

    return {
      status: 'ok',
      message: `Unsubscribed from collection!`,
      data: result,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to unsubscribe to collection!`,
      data: null,
    };
  });
};