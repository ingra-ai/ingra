"use server";

import { ActionError } from "@lib/api-response";
import { getAuthSession } from "@app/auth/session";
import db from "@lib/db";
import { generate } from '@lib/functions/generatePassphrase';

export const updatePhraseCode = async () => {
  const authSession = await getAuthSession();

  if ( !authSession || authSession.expiresAt < new Date() ) {
    throw new ActionError("error", 400, "User not authenticated!");
  }

  const code = generate({ fast: true, numbers: false, separator: ' ', length: 5 })

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 1);

  const phraseCode = await db.phraseCode.upsert({
    where: {
      userId: authSession.user.id
    },
    create: {
      code,
      userId: authSession.user.id,
      expiresAt: expiresAt
    },
    update: {
      code,
      expiresAt: expiresAt
    }
  });

  if ( !phraseCode ) {
    throw new ActionError("error", 400, "Failed to generate phrase code!");
  }

  return {
    success: "Phrase code generated!",
    data: {
      code: phraseCode.code,
      expiresAt: phraseCode.expiresAt
    }
  };
};
