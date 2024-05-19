import * as z from "zod";

const ENV_VAR_KEYS_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export const EnvVarsSchema = z.object({
  id: z.number().optional(),
  key: z.string().regex(ENV_VAR_KEYS_REGEX, {
    message: "Invalid key. Keys must consist of alphanumeric characters, underscores, and hyphens only, and cannot start with a number."
  }).max(64, {
    message: "Key must be less than 64 characters."
  }),
  value: z.string().max(256, {
    message: "Value must be less than 256 characters."
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional().default(() => new Date())
});
