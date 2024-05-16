import { z } from 'zod';

export const FUNCTION_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

// Names must consist of alphanumeric characters and underscores only, and cannot start with a number.
export const FUNCTION_ARG_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// Define an Enum for HttpVerb
export const HttpVerbEnum = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

// Database allows 1024 characters for description as per openapi spec.
export const MAX_FUNCTION_DESCRIPTION_LENGTH = 600;

export const FUNCTION_ARGUMENT_ALLOWED_TYPES: readonly [string, ...string[]] = [
  'string',
  'number',
  'boolean',
  // Not supported at the moment.
  // 'object',
  // 'array'
];

export const CODE_DEFAULT_TEMPLATE = `
async function handler(ctx) {
  const { envVars, ...args } = ctx;

  /**
   * envVars: object containing environment variables related to the existing user
   * args: object containing the arguments passed to the function as part of API request
  */

  // Add your code here

  return 'hello world';
}
`.trim();

export const FunctionArgumentSchema = z.object({
  id: z.string().optional(),
  functionId: z.string(),
  name: z.string().regex(FUNCTION_ARG_NAME_REGEX, {
    message: "Invalid argument name. Names must consist of alphanumeric characters and underscores only, and cannot start with a number.",
  }),
  type: z.enum(FUNCTION_ARGUMENT_ALLOWED_TYPES, {
    errorMap: (issue, ctx) => {
      return {
        message: `Invalid argument type '${ issue }'. Must be one of: ${ FUNCTION_ARGUMENT_ALLOWED_TYPES.join(', ') }.`
      };
    },
  }).default('string'),
  defaultValue: z.string().optional(),
  description: z.string().max(MAX_FUNCTION_DESCRIPTION_LENGTH, {
    message: `Description must be less than ${MAX_FUNCTION_DESCRIPTION_LENGTH} characters.`,
  }).optional().default(""),
  isRequired: z.boolean().default(false)
});

export const FunctionSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(FUNCTION_SLUG_REGEX, {
    message: "Invalid slug format. Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.",
  }),
  code: z.string(),
  isPrivate: z.boolean().default(true),
  ownerUserId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  httpVerb: HttpVerbEnum.default('GET'),
  description: z.string().max(MAX_FUNCTION_DESCRIPTION_LENGTH, {
    message: `Description must be less than ${MAX_FUNCTION_DESCRIPTION_LENGTH} characters.`,
  }).default(""),
  arguments: z.array(FunctionArgumentSchema).optional(),
  originalFunctionId: z.string().optional()
});

export const FunctionMetaSchema = z.object({
  id: z.string().optional(),
  functionId: z.string(),
  openApiSpec: z.any().optional(),  // Customize according to what 'openApiSpec' will contain
  responses: z.any().optional()  // Customize as needed, can be further defined if structure is known
});
