import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.number().optional(),
  userName: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9.-]+$/),
  firstName: z.string().min(3).max(255),
  lastName: z.string().min(3).max(255),
  timeZone: z.string().min(3).max(128),
});
