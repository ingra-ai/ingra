'use server';

import * as z from 'zod';
import { ChatConfigSchema, MAX_CHAT_CONFIG_PER_USER } from '@repo/shared/schemas/chatConfig';
import { actionAuthTryCatch } from '@repo/shared/utils/actionAuthTryCatch';
import { validateAction } from '@repo/shared/lib/action-helpers';
import { kv } from '@vercel/kv';

const CHAT_CONFIG_KEY_PREFIX = 'chatConfig:';

export const upsertChatConfig = async (values: z.infer<typeof ChatConfigSchema>) => {
  const validatedValues = await validateAction(ChatConfigSchema, values);
  const { data } = validatedValues;
  
  return await actionAuthTryCatch(async (authSession) => {
    const configKey = data.key;

    if (!configKey) {
      throw new Error('Config key is required!');
    }

    const prefix = `${CHAT_CONFIG_KEY_PREFIX}${authSession.user.id}:`;
    const keys = await kv.keys(prefix);

    if (keys.length >= MAX_CHAT_CONFIG_PER_USER) {
      throw new Error(`You have reached the maximum limit of ${ MAX_CHAT_CONFIG_PER_USER } chat configurations.`);
    }

    const key = `${prefix}${configKey}`;

    // Save the configuration to Vercel KV
    await kv.set(key, data);

    return {
      status: 'ok',
      message: `Chat config "${configKey}" updated successfully!`,
      data: data,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to upsert chat config!`,
      data: null,
    };
  });
};

export const createChatConfig = async (values: z.infer<typeof ChatConfigSchema>) => {
  return await upsertChatConfig(values);
};

export const getChatConfig = async (configKey: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    if (!configKey) {
      throw new Error('Config key is required!');
    }

    const kvKey = `${CHAT_CONFIG_KEY_PREFIX}${authSession.user.id}:${configKey}`;
    const data = await kv.get(kvKey);

    if (!data) {
      throw new Error(`Chat config "${configKey}" not found!`);
    }

    return {
      status: 'ok',
      message: `Chat config "${configKey}" found!`,
      data: data,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to get chat config!`,
      data: null,
    };
  });
};

export const deleteChatConfig = async (configKey: string) => {
  return await actionAuthTryCatch(async (authSession) => {
    if (!configKey) {
      throw new Error('Config name is required!');
    }

    const key = `${CHAT_CONFIG_KEY_PREFIX}${authSession.user.id}:${configKey}`;
    await kv.del(key);

    return {
      status: 'ok',
      message: `Chat config "${configKey}" deleted successfully!`,
      data: null
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to delete chat config!`,
      data: null,
    };
  });
};

export const listChatConfigs = async () => {
  return await actionAuthTryCatch(async (authSession) => {
    const prefix = `${CHAT_CONFIG_KEY_PREFIX}${authSession.user.id}:`;
    const keys = await kv.keys(prefix + '*');

    const userChatConfigs = await Promise.all(
      keys.map(async (key) => {
        const data = await kv.get<z.infer<typeof ChatConfigSchema>>(key);

        return data;
      })
    );

    const userChatConfigsSorted = ( userChatConfigs.filter(Boolean) as z.infer<typeof ChatConfigSchema>[] ).sort((a, b) => a.key.localeCompare(b.key));

    return {
      status: 'ok',
      message: `Found ${userChatConfigsSorted.length} chat configs!`,
      data: userChatConfigsSorted,
    };
  })
  .catch((error) => {
    return {
      status: error?.status || 'error',
      message: error?.message || `Failed to list chat configs!`,
      data: null,
    };
  });
};