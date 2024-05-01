import { z } from 'zod';

export const FunctionSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, {
    message: "Invalid slug format. Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.",
  }),
  code: z.string(),
  isPrivate: z.boolean().default(true).optional(),
  ownerUserId: z.string().optional(),
  createdAt: z.date().default(() => new Date()).optional(),
  updatedAt: z.date().default(() => new Date()).optional()
});

export const FunctionMetaSchema = z.object({
  id: z.string().optional(),
  openApiSpec: z.object({}).optional(),
  functionId: z.string(),
});