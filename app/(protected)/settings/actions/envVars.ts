'use server';

import * as z from 'zod';
import { ActionError } from '@v1/types/api-response';
import db from '@lib/db';
import { EnvVarsSchema } from '@/schemas/envVars';
import { validateAction } from '@lib/action-helpers';
import { actionAuthTryCatch } from '@app/api/utils/actionAuthTryCatch';
import { clearAuthCaches } from '@app/auth/session/caches';

export const upsertEnvVar = async (values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { data } = validatedValues;
  const { id: recordId, key, value } = data;

  return await actionAuthTryCatch(async (authSession) => {
    const record = await db.envVars.upsert({
      where: {
        ownerUserId_key: {
          ownerUserId: authSession.user.id,
          key,
        },
      },
      create: {
        key,
        value,
        updatedAt: new Date(),
        ownerUserId: authSession.user.id,
      },
      update: {
        value,
        updatedAt: new Date(),
      },
    });
  
    // Delete kv caches for this user
    await clearAuthCaches(authSession);
  
    return {
      status: 'ok',
      message: 'Environment variable operation successful!',
      data: record,
    };
  });

}

export const createEnvVar = async (values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { data } = validatedValues;
  const { key, value } = data;

  return await actionAuthTryCatch(async (authSession) => {
    const record = await db.envVars.create({
      data: {
        key,
        value,
        updatedAt: new Date(),
        ownerUserId: authSession.user.id,
      },
    });
  
    if (!record) {
      throw new ActionError('error', 400, 'Failed to create environment variable!');
    }
  
    // Delete kv caches for this user
    await clearAuthCaches(authSession);
  
    return {
      status: 'ok',
      message: 'Environment variable created!',
      data: record,
    };
  });
};

export const updateEnvVar = async (id: number, values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { data } = validatedValues;
  const { key, value } = data;

  return await actionAuthTryCatch(async (authSession) => {
    const record = await db.envVars.update({
      where: {
        id,
        ownerUserId: authSession.user.id,
      },
      data: {
        key,
        value,
        updatedAt: new Date(),
      },
    });
  
    if (!record) {
      throw new ActionError('error', 400, 'Failed to update Environment variable!');
    }
  
    // Delete kv caches for this user
    await clearAuthCaches(authSession);
  
    return {
      status: 'ok',
      message: 'Environment variable updated!',
      data: record,
    };
  });
};

export const deleteEnvVar = async (id: number) => {
  return await actionAuthTryCatch(async (authSession) => {
    const record = await db.envVars.delete({
      where: {
        id,
        ownerUserId: authSession.user.id,
      },
    });
  
    if (!record) {
      throw new ActionError('error', 400, 'Failed to delete Environment variable!');
    }
  
    // Delete kv caches for this user
    await clearAuthCaches(authSession);
  
    return {
      status: 'ok',
      message: 'Environment variable deleted!',
      data: null,
    };
  });
}