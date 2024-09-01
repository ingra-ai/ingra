'use server';
import db from '@repo/db/client';

export async function upsertEnvVar(key: string, value: string, ownerUserId: string) {
  const record = await db.envVars.upsert({
    where: {
      ownerUserId_key: {
        ownerUserId,
        key,
      },
    },
    create: {
      key,
      value,
      updatedAt: new Date(),
      ownerUserId,
    },
    update: {
      value,
      updatedAt: new Date(),
    },
  });

  return record;
}

export async function deleteEnvVar(id: number, ownerUserId: string) {
  const record = await db.envVars.delete({
    where: {
      id,
      ownerUserId,
    },
  });

  return record;
}
