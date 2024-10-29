import { z } from 'zod';

/**
 * Maximum chat config per user.
 */
export const MAX_CHAT_CONFIG_PER_USER = 5;

export const ChatConfigSchema = z.object({
  key: z
    .string()
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/, {
      message: 'Key must start and end with an alphanumeric character and can only contain alphanumeric characters, underscores, and dashes.',
    })
    .min(4)
    .max(16)
    .default('Default'),
  model: z
    .enum(['gpt-4o', 'gpt-3.5-turbo'])
    .default('gpt-4o'),
  temperature: z
    .number()
    .min(0)
    .max(1)
    .default(0.1),
  collections: z
    .array(z.string())
    .default([]),
  systemPrompt: z
    .string()
    .default('You are a helpful assistant.')
});

export const CHAT_DEFAULT_CONFIG: z.infer<typeof ChatConfigSchema> = {
  key: 'default',
  model: "gpt-4o",
  temperature: 0,
  collections: [],
  systemPrompt: "You are a helpful assistant.",
};