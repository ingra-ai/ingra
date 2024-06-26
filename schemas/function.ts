import { z } from 'zod';
import { RESERVED_SLUGS, SLUG_REGEX } from './schema-constants';

/**
 * The default template for the function code.
 */
export const CODE_DEFAULT_TEMPLATE = `
/*
VM Context:
- 'console.log' and 'console.error'
- 'fetch': Node fetch
- 'Buffer': Node Buffer
- 'utils.date.parseStartAndEnd': To parse start and end dates with natural language and timezone adjustment
  e.g. utils.date.parseStartAndEnd('today at 23:59', 'tomorrow at 12:00', 'America/New_York'))
- 'utils.date.parseDate': To parse a single date with natural language and timezone adjustment
  e.g. utils.date.parseDate('today at 23:59', 'America/New_York'))
- 'Octokit': GitHub REST API client library
- 'Cheerio': jQuery for Node.js
*/

async function handler(ctx) {
  // View all your environment variables, user variables and arguments by logging them to the console
  console.log({ ctx });

  // Add your code here below this line.
  return 'hello world';
}
`.trim();

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
const MAX_FUNCTION_CODE_LENGTH = 1e4;

/**
 * Maximum length constraint for function description.
 * @note OpenAI only allows 300 length.
 */
export const MAX_FUNCTION_DESCRIPTION_LENGTH = 300;

/**
 * Regular expression pattern for validating function argument names.
 * Names must consist of alphanumeric characters and underscores only, and cannot start with a number.
 */
const FUNCTION_ARG_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Regular expression pattern for validating function tag names.
 * 
 * The tag name must start with a letter, followed by any combination of letters, numbers, and underscores.
 * 
 * @remarks
 * This regular expression is used to enforce naming conventions for function tags.
 */
const FUNCTION_TAG_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-\s]*$/;

/**
 * Maximum length constraint for function argument names.
 */
const MAX_FUNCTION_ARG_NAME_LENGTH = 50;

/**
 * Maximum length constraint for function argument names.
 */
const MAX_FUNCTION_TAG_NAME_LENGTH = 50;

/**
 * Reserved argument names that cannot be used.
 */
const RESERVED_ARGUMENT_NAMES: string[] = [];

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
 * @swagger
 * components:
 *   schemas:
 *     FunctionArgument:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           default: ''
 *           description: Unique identifier for the function argument.
 *         name:
 *           type: string
 *           default: ''
 *           description: The name of the argument.
 *         type:
 *           type: string
 *           enum: [string, number, boolean]
 *           default: 'string'
 *           description: The data type of the argument (e.g., string, number, boolean).
 *         defaultValue:
 *           type: string
 *           nullable: true
 *           default: ''
 *           description: The default value of the argument.
 *         description:
 *           type: string
 *           nullable: true
 *           default: ''
 *           description: A description of the argument.
 *         isRequired:
 *           type: boolean
 *           default: false
 *           description: Indicates if the argument is required.
 */
// * Schema definition for function arguments.
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
 * @swagger
 * components:
 *   schemas:
 *     FunctionTag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           default: ''
 *           description: Unique identifier for the function tag.
 *         functionId:
 *           type: string
 *           format: uuid
 *           default: ''
 *           description: The ID of the function this tag belongs to.
 *         name:
 *           type: string
 *           default: ''
 *           description: The name of the tag.
 */
// * Schema definition for function tags.
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
 * @swagger
 * components:
 *   schemas:
 *     Function:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           default: ''
 *           description: Unique identifier for the function.
 *         slug:
 *           type: string
 *           default: ''
 *           description: A unique slug for the function.
 *         code:
 *           type: string
 *           default: ''
 *           description: The code for the function.
 *         isPrivate:
 *           type: boolean
 *           default: true
 *           description: Indicates if the function is private.
 *         isPublished:
 *           type: boolean
 *           default: false
 *           description: Indicates if the function is published.
 *         httpVerb:
 *           type: string
 *           enum: [GET, POST, PUT, PATCH, DELETE]
 *           default: 'GET'
 *           description: The HTTP verb used by the function.
 *         description:
 *           type: string
 *           default: ''
 *           description: A description of the function.
 *         arguments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FunctionArgument'
 *           description: A list of arguments for the function.
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FunctionTag'
 *           description: A list of tags associated with the function.
 */
// * Schema definition for functions.
export const FunctionSchema = z.object({
  id: z.string().optional(),
  slug: z.string()
  .min(6, {
    message: 'Slug must be at least 6 characters long.'
  })
  .max(64, {
    message: 'Slug must be less than 64 characters long.'
  })
  .regex(SLUG_REGEX, {
    message: "Invalid slug format. Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.",
  })
  .refine(
    (value) => RESERVED_SLUGS.indexOf(value) === -1, 
    (value) => (
      { message: `The function slug "${value}" is reserved and cannot be used.` }
    )
  ),
  code: z.string().max(MAX_FUNCTION_CODE_LENGTH, {
    message: `Code must be less than ${MAX_FUNCTION_CODE_LENGTH} characters.`,
  }),
  isPrivate: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  ownerUserId: z.string().optional(),
  createdAt: z.date().optional().default(() => new Date()),
  updatedAt: z.date().optional().default(() => new Date()),
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
