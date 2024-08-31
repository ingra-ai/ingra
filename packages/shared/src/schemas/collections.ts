import { z } from 'zod';
import { RESERVED_SLUGS, SLUG_REGEX } from './schema-constants';

/**
 * Maximum length constraint for collection name.
 */
const MAX_COLLECTION_NAME_LENGTH = 120;

/**
 * Regular expression pattern for validating collection names.
 */
const COLLECTION_NAME_REGEX = /^[a-zA-Z0-9_-\s]+$/;

export const MAX_COLLECTION_DESCRIPTION_LENGTH = 1e3;

/**
 * Represents the schema for a collection.
 * @ swagger
 * components:
 *   schemas:
 *     CollectionSchema:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 6
 *           maxLength: 120
 *           pattern: '^[a-zA-Z0-9_-\s]+$'
 *           description: |
 *             The name of the collection.
 *             - Must be at least 6 characters long.
 *             - Must be less than 120 characters long.
 *             - Must consist of alphanumeric characters, spaces, hyphens, and underscores only.
 *         slug:
 *           type: string
 *           minLength: 6
 *           maxLength: 64
 *           pattern: '^[a-zA-Z0-9-]+$'
 *           description: |
 *             The slug of the collection.
 *             - Must be at least 6 characters long.
 *             - Must be less than 64 characters long.
 *             - Must consist of alphanumeric characters and hyphens only.
 *             - Cannot start or end with a hyphen.
 *             - Cannot be a reserved slug.
 *         description:
 *           type: string
 *           nullable: true
 *           description: The description of the collection (optional).
 *         userId:
 *           type: string
 *           description: The ID of the user.
 */
export const CollectionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(6, {
      message: 'Name must be at least 6 characters long.',
    })
    .max(MAX_COLLECTION_NAME_LENGTH, {
      message: 'Name must be less than 120 characters long.',
    })
    .regex(COLLECTION_NAME_REGEX, {
      message: 'Invalid name format. Names must consist of alphanumeric characters, spaces, hyphens, and underscores only.',
    }),
  slug: z
    .string()
    .min(6, {
      message: 'Slug must be at least 6 characters long.',
    })
    .max(64, {
      message: 'Slug must be less than 64 characters long.',
    })
    .regex(SLUG_REGEX, {
      message: 'Invalid slug format. Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.',
    })
    .refine(
      (value) => RESERVED_SLUGS.indexOf(value) === -1,
      (value) => ({
        message: `The collection slug "${value}" is reserved and cannot be used.`,
      })
    ),
  description: z
    .string()
    .max(MAX_COLLECTION_DESCRIPTION_LENGTH, {
      message: `Description must be less than ${MAX_COLLECTION_DESCRIPTION_LENGTH} characters.`,
    })
    .optional()
    .default(''),
  userId: z.string().optional(),
});

/**
 * Represents the schema for a collection subscription.
 * @ swagger
 * components:
 *   schemas:
 *     CollectionSubscriptionSchema:
 *       type: object
 *       properties:
 *         collectionId:
 *           type: string
 *           description: The ID of the collection.
 *         userId:
 *           type: string
 *           description: The ID of the user.
 */
export const CollectionSubscriptionSchema = z.object({
  collectionId: z.string(),
  userId: z.string().optional(),
});
