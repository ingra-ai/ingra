import * as z from "zod";

export const MagicLoginSchema = z.object({
  email: z
    .string()
    .min(5, { message: "This field has to be filled." })
    .max(128, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  otpCode: z
    .string()
    .min(6, { message: "This field has to be filled." })
    .max(6, { message: "This field has to be filled." })
    .regex(/^\d+$/, { message: "This field has to be filled." })
    .optional()
    .or(z.literal("")),
});
