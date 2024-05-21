import { z } from 'zod';

/**
 * The default template for the function code.
 */
export const CODE_DEFAULT_TEMPLATE = `
async function handler(ctx) {
  const { userVars, ...args } = ctx;

  /**
   * userVars:
   *   - userVars.oauthTokens: array of objects containing the OAuth tokens for the user.
   *   - userVars.profile: object containing the user profile information
   *   - userVars.[...envVars]: object containing the environment variables for the user
   * args: object containing the request arguments passed to the function as part of API request
   */
  const {
    oauthTokens = [],
    profile: { userName, timeZone },
    ...envVars
  } = userVars;

  // VM Context:
  // - console.log and console.error: For logging
  // - fetch: For making HTTP requests
  // - utils.date.parseStartAndEnd: To parse start and end dates with timezone adjustment
  // - utils.date.parseDate: To parse a single date with timezone adjustment

  // Add your code here
  return 'hello world';
}
`.trim();

/**
 * Regular expression pattern for validating function slugs.
 * Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.
 */
export const FUNCTION_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/**
 * Enum for HTTP verbs.
 * Valid values are 'GET', 'POST', 'PUT', 'PATCH', and 'DELETE'.
 */
export const HttpVerbEnum = z.enum([
  'GET', 
  'POST', 
  'PUT', 
  'PATCH', 
  'DELETE'
]);

/**
 * Maximum length constraint for function code.
 */
export const MAX_FUNCTION_CODE_LENGTH = 8000;

/**
 * Maximum length constraint for function description.
 * @note OpenAI only allows 300 length.
 */
export const MAX_FUNCTION_DESCRIPTION_LENGTH = 300;

/**
 * Regular expression pattern for validating function argument names.
 * Names must consist of alphanumeric characters and underscores only, and cannot start with a number.
 */
export const FUNCTION_ARG_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Regular expression pattern for validating function tag names.
 * 
 * The tag name must start with a letter, followed by any combination of letters, numbers, and underscores.
 * 
 * @remarks
 * This regular expression is used to enforce naming conventions for function tags.
 */
export const FUNCTION_TAG_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-\s]*$/;

/**
 * Maximum length constraint for function argument names.
 */
export const MAX_FUNCTION_ARG_NAME_LENGTH = 50;

/**
 * Maximum length constraint for function argument names.
 */
export const MAX_FUNCTION_TAG_NAME_LENGTH = 50;

/**
 * Reserved argument names that cannot be used.
 */
export const RESERVED_ARGUMENT_NAMES = ['userVars'];

/**
 * Allowed types for function arguments.
 * Valid values are 'string', 'number', and 'boolean'.
 */
export const FUNCTION_ARGUMENT_ALLOWED_TYPES: readonly [string, ...string[]] = [
  'string',
  'number',
  'boolean',
  // Not supported at the moment.
  // 'object',
  // 'array'
];

/**
 * Schema definition for function arguments.
 */
export const FunctionArgumentSchema = z.object({
  id: z.string().optional(),
  functionId: z.string(),
  name: z.string()
  .max(MAX_FUNCTION_ARG_NAME_LENGTH, {
    message: `Argument name must be less than ${MAX_FUNCTION_ARG_NAME_LENGTH} characters.`
  })
  .regex(FUNCTION_ARG_NAME_REGEX, {
    message: "Invalid argument name. Names must consist of alphanumeric characters and underscores only, and cannot start with a number.",
  })
  .refine(
    (value) => RESERVED_ARGUMENT_NAMES.indexOf(value) === -1, 
    (value) => (
      { message: `The argument name "${value}" is reserved and cannot be used.` }
    )
  ),
  type: z.enum(FUNCTION_ARGUMENT_ALLOWED_TYPES, {
    errorMap: (issue, ctx) => {
      return {
        message: `Invalid argument type '${issue}'. Must be one of: ${FUNCTION_ARGUMENT_ALLOWED_TYPES.join(', ')}.`
      };
    },
  }).default('string'),
  defaultValue: z.string().optional(),
  description: z.string().max(MAX_FUNCTION_DESCRIPTION_LENGTH, {
    message: `Description must be less than ${MAX_FUNCTION_DESCRIPTION_LENGTH} characters.`,
  }).optional().default(""),
  isRequired: z.boolean().default(false)
});

/**
 * Schema definition for function tags.
 */
export const FunctionTagsSchema = z.object({
  id: z.string().optional(),
  functionId: z.string(),
  name: z.string()
    .max(MAX_FUNCTION_TAG_NAME_LENGTH, {
      message: `Tag name must be less than ${MAX_FUNCTION_TAG_NAME_LENGTH} characters.`
    })
    .regex(FUNCTION_TAG_NAME_REGEX, {
      message: "Invalid tag name. Names must start with a letter, followed by any combination of letters, numbers, and underscores."
    })
});

/**
 * Schema definition for functions.
 */
export const FunctionSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(FUNCTION_SLUG_REGEX, {
    message: "Invalid slug format. Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.",
  }),
  code: z.string().max(MAX_FUNCTION_CODE_LENGTH, {
    message: `Code must be less than ${MAX_FUNCTION_CODE_LENGTH} characters.`,
  }),
  isPrivate: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  ownerUserId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  httpVerb: HttpVerbEnum.default('GET'),
  description: z.string().max(MAX_FUNCTION_DESCRIPTION_LENGTH, {
    message: `Description must be less than ${MAX_FUNCTION_DESCRIPTION_LENGTH} characters.`,
  }).default(""),
  arguments: z.array(FunctionArgumentSchema).optional().refine((args) => {
    if (!args || !args.length) return true; // If args are not provided, skip the check
    const uniqueArgs = new Set(args.map(arg => arg.name.trim().toLowerCase()));
    return uniqueArgs.size === args.length;
  }, {
    message: 'Duplicate arguments are not allowed'
  }),
  tags: z.array(FunctionTagsSchema).optional().refine((tags) => {
    if (!tags || !tags.length) return true; // If tags are not provided, skip the check
    const uniqueTags = new Set(tags.map(tag => tag.name.trim().toLowerCase()));
    return uniqueTags.size === tags.length;
  }, {
    message: 'Duplicate tags are not allowed'
  }),
  originalFunctionId: z.string().optional()
});
