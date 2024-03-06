"use server";

import * as z from "zod";
import { ActionError } from "@lib/api-response";
import { ProfileSchema } from "@/schemas/profile";
import { getAuthSession } from "@app/auth/session";
import db from "@lib/db";

export const updateProfile = async (values: z.infer<typeof ProfileSchema>) => {
  const validatedFields = ProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new ActionError("error", 400, "Invalid fields!");
  }

  const authSession = await getAuthSession();

  if ( !authSession || authSession.expiresAt < new Date() ) {
    throw new ActionError("error", 400, "User not authenticated!");
  }

  const { firstName, lastName, userName } = validatedFields.data;

  const profile = await db.profile.upsert({
    where: {
      userId: authSession.user.id
    },
    update: {
      firstName,
      lastName,
      userName
    },
    create: {
      firstName,
      lastName,
      userName,
      userId: authSession.user.id
    }
  });

  if ( !profile ) {
    throw new ActionError("error", 400, "Failed to update profile!");
  }

  return {
    success: "Profile updated!",
    data: profile
  };
};
