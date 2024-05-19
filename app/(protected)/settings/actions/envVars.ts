'use server';

import * as z from 'zod';
import { ActionError } from '@lib/api-response';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { EnvVarsSchema } from '@/schemas/envVars';
import { validateAction } from '@lib/action-helpers';

export const upsertEnvVar = async (values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { authSession, data } = validatedValues;

  const { id: recordId, key, value } = data;

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

  return {
    success: 'Environment variable operation successful!',
    data: record,
  };
}

export const createEnvVar = async (values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { authSession, data } = validatedValues;

  const { key, value } = data;

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

  return {
    success: 'Environment variable created!',
    data: record,
  };
};

export const updateEnvVar = async (id: number, values: z.infer<typeof EnvVarsSchema>) => {
  const validatedValues = await validateAction(EnvVarsSchema, values);
  const { authSession, data } = validatedValues;

  const { key, value } = data;

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

  return {
    success: 'Environment variable updated!',
    data: record,
  };
};

export const deleteEnvVar = async (id: number) => {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 400, 'User not authenticated!');
  }

  const record = await db.envVars.delete({
    where: {
      id,
      ownerUserId: authSession.user.id,
    },
  });

  if (!record) {
    throw new ActionError('error', 400, 'Failed to delete Environment variable!');
  }

  return {
    success: 'Environment variable deleted!',
    data: null,
  };
}