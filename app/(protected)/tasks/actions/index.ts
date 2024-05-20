'use server';

import * as z from 'zod';
import { TaskSchema } from '@/schemas/task';
import { ActionError } from '@v1/types/api-response';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';

export const createTask = async (values: z.infer<typeof TaskSchema>) => {
  const validatedFields = TaskSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new ActionError('error', 400, 'Invalid fields!');
  }

  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  const { title, description, status, priority } = validatedFields.data;

  const task = await db.task.create({
    data: {
      title,
      description,
      status,
      priority,
      userId: authSession.user.id,
    },
  });

  if (!task) {
    throw new ActionError('error', 400, 'Failed to create task!');
  }

  return {
    success: 'Task created!',
    data: task,
  };
};

export const updateTask = async (id: number, values: z.infer<typeof TaskSchema>) => {
  const validatedFields = TaskSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new ActionError('error', 400, 'Invalid fields!');
  }

  const authSession = await getAuthSession();

  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  const { title, description, status, priority } = validatedFields.data;

  const task = await db.task.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      status,
      priority,
    },
  });

  if (!task) {
    throw new ActionError('error', 400, 'Failed to update task!');
  }

  return {
    success: 'Task updated!',
    data: task,
  };
};
