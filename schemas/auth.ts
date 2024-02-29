import * as z from "zod";

export const MagicLoginSchema = z.object({
  email: z
    .string()
    .min(5, { message: "This field has to be filled." })
    .max(128, { message: "This field has to be filled." })
    .email("This is not a valid email.")
});
