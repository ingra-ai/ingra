"use server";

import * as z from "zod";
import { CollectionSchema } from "../schemas/collections";
import { validateAction } from "../lib/action-helpers";
import { actionAuthTryCatch } from "../utils/actionAuthTryCatch";
import {
  addNewCollection as dataAddNewCollection,
  editCollection as dataEditCollection,
  deleteCollection as dataDeleteCollection,
  subscribeToCollection as dataSubscribeToCollection,
  unsubscribeToCollection as dataUnsubscribeToCollection,
  toggleCollectionSubscription as dataToggleCollectionSubscription,
} from "../data/collections";

export const createCollection = async (
  values: z.infer<typeof CollectionSchema>,
) => {
  const validatedValues = await validateAction(CollectionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataAddNewCollection(
      data.name,
      data.slug,
      data.description,
      authSession.user.id,
    );

    return {
      status: "ok",
      message: `Collection "${result.slug}" created!`,
      data: result,
    };
  });
};

export const updateCollection = async (
  collectionId: string,
  values: z.infer<typeof CollectionSchema>,
) => {
  const validatedValues = await validateAction(CollectionSchema, values);
  const { data } = validatedValues;

  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataEditCollection(
      collectionId,
      data.name,
      data.slug,
      data.description,
      authSession.user.id,
    );

    return {
      status: "ok",
      message: `Collection "${result.slug}" updated!`,
      data: result,
    };
  });
};

export const deleteCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataDeleteCollection(
      collectionId,
      authSession.user.id,
    );

    return {
      status: "ok",
      message: `Collection has been deleted!`,
      data: result,
    };
  });
};

export const subscribeToCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataSubscribeToCollection(
      collectionId,
      authSession.user.id,
    );

    return {
      status: "ok",
      message: `Subscribed to collection!`,
      data: result,
    };
  });
};

export const unsubscribeToCollection = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataUnsubscribeToCollection(
      collectionId,
      authSession.user.id,
    );

    return {
      status: "ok",
      message: `Unsubscribed from collection!`,
      data: result,
    };
  });
};
export const subscribeToggleFunction = async (collectionId: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    const result = await dataToggleCollectionSubscription(
      collectionId,
      authSession.user.id,
    );

    return {
      status: "ok",
      message: result
        ? `Subscribed to collection!`
        : `Unsubscribed from collection!`,
      data: null,
    };
  });
};
