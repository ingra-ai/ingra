import * as z from "zod";

export const MagicLoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  })
});
