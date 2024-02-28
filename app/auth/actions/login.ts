"use server";

import * as z from "zod";
import { MagicLoginSchema } from "@/schemas/auth";
import { getOrCreateUserByEmail } from "@/data/user";
import { ActionError } from "@lib/error";
import { createMagicLink } from "@/data/auth";
import { sendMagicLinkEmail } from "@lib/mail/sendMagicLinkEmail";

export const magicLogin = async (values: z.infer<typeof MagicLoginSchema>) => {
  const validatedFields = MagicLoginSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new ActionError("error", 400, "Invalid fields!");
  }

  const { email } = validatedFields.data;

  const existingUser = await getOrCreateUserByEmail(email);

  if (!existingUser || !existingUser.email ) {
    throw new ActionError("error", 400, "Failed in login operation!");
  }

  const magicLink = await createMagicLink(existingUser);

  if ( !magicLink ) {
    throw new ActionError("error", 400, "Failed to generate magic link!");
  }

  const res = await sendMagicLinkEmail(existingUser.email, magicLink);

  if (!res) {
    throw new ActionError("error", 400, "Failed to send magic link!");
  }

  return {
    success: "Magic link has been sent!"
  };
};
