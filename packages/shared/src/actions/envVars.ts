'use server';

import * as z from 'zod';
import { ActionError } from '@repo/shared/types';
import { EnvVarsSchema } from '../schemas/envVars';
import { validateAction } from '../lib/action-helpers';
import { actionAuthTryCatch } from '../utils/actionAuthTryCatch';
import { clearAuthCaches } from '../data/auth/session/caches';
import { upsertEnvVar as dataUpsertEnvVar, deleteEnvVar as dataDeleteEnvVar } from '../data/envVars';

export const upsertEnvVar = async (values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { data } = validatedValues;
  const { id: recordId, key, value } = data;

  return await actionAuthTryCatch(async (authSession) => {
    const record = await dataUpsertEnvVar(key, value, authSession.user.id);

    // Delete kv caches for this user
    await clearAuthCaches(authSession);

    return {
      status: 'ok',
      message: 'Environment variable operation successful!',
      data: record,
    };
  });
};

export const deleteEnvVar = async (id: number) => {
  return await actionAuthTryCatch(async (authSession) => {
    const record = await dataDeleteEnvVar(id, authSession.user.id);

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
};
