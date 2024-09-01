import { ActionError } from '@v1/types/api-response';
import { z } from 'zod';

/**
 * Validates the given values against the provided schema and performs authentication check.
 *
 * @template T - The type of the schema.
 * @param {T} schema - The schema to validate against.
 * @param {z.infer<T>} values - The values to be validated.
 * @returns {Promise<{ authSession: AuthSession, data: z.infer<T> }>} - The validated data along with the authentication session.
 * @throws {ActionError} - If the fields are invalid or the user is not authenticated.
 */
export const validateAction = async <T extends z.ZodType<any, any>>(schema: T, values: z.infer<T>) => {
  const validatedFields = schema.safeParse(values);

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors.map((err) => err.message).join(', ');
    throw new ActionError('error', 400, `Invalid fields: ${errorMessages}`);
  }

  return {
    data: validatedFields.data as z.infer<T>,
  };
};
