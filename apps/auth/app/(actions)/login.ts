'use server';

import { createActiveSession, createMagicLink, expireMagicLinkByToken, getMagicLinkByOtp } from '@repo/shared/data/auth';
import { getOrCreateUserByEmail } from '@repo/shared/data/user';
import { APP_AUTH_COOKIE_DOMAIN, APP_LANDING_PAGE_URL, APP_SESSION_COOKIE_NAME } from '@repo/shared/lib/constants';
import { sendMagicLinkEmail } from '@repo/shared/lib/mail/sendMagicLinkEmail';
import { MagicLoginSchema } from '@repo/shared/schemas/auth';
import { ActionError } from '@repo/shared/types';
import { actionTryCatch } from '@repo/shared/utils/actionTryCatch';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

export const magicLoginEmail = async (values: z.infer<typeof MagicLoginSchema>) => {
  const validatedFields = MagicLoginSchema.safeParse(values);

  return actionTryCatch(async () => {
    if (!validatedFields.success) {
      throw new ActionError('error', 400, 'Invalid fields.');
    }

    const { email: rawEmail, otpCode } = validatedFields.data;
    const email = rawEmail.toLowerCase();

    const existingUser = await getOrCreateUserByEmail(email);

    if (!existingUser || !existingUser.email) {
      throw new ActionError('error', 400, 'Failed in login operation.');
    }

    if (!otpCode) {
      /**
       * When user just provides email but not otpCode, we will generate a magic link and send it to the user's email.
       */
      const magicLink = await createMagicLink(existingUser);

      if (!magicLink) {
        throw new ActionError('error', 400, 'Failed to generate magic link.');
      }

      const res = await sendMagicLinkEmail(existingUser.email, magicLink);

      if (!res) {
        throw new ActionError('error', 400, 'Failed to send magic link.');
      }

      return {
        status: 'ok',
        message: 'Magic link has been sent.',
        data: null,
      };
    } else if (otpCode) {
      /**
       * When user provides both email and otpCode, we will verify the otpCode and create an active session for the user.
       */
      const magicLinkWithUser = await getMagicLinkByOtp(existingUser, otpCode);

      if (!magicLinkWithUser) {
        throw new ActionError('error', 400, 'Failed to validate your OTP code. Please try again.');
      }

      const session = await createActiveSession(magicLinkWithUser.user);

      if (!session) {
        throw new ActionError('error', 500, 'Failed to create session.');
      }

      // Set session cookies
      const cookieStore = cookies();
      cookieStore.set(APP_SESSION_COOKIE_NAME, session.jwt, {
        domain: APP_AUTH_COOKIE_DOMAIN,
        path: '/',
        sameSite: 'lax',
        expires: session.expiresAt,
        httpOnly: true,
        secure: true,
      });

      // Expire magic link so its token can't be used again
      await expireMagicLinkByToken(magicLinkWithUser.token);

      // Redirect to the app
      try {
        redirect(APP_LANDING_PAGE_URL);
      } catch (error: any) {
        if (error?.message === 'NEXT_REDIRECT') {
          return {
            status: 'ok',
            message: 'I think all is well',
            data: null,
          };
        }

        throw error;
      }
    }

    return {
      status: 'ok',
      message: 'I think all is well',
      data: null,
    };
  });
};
