import { createMagicLink, expireMagicLinkByToken, getMagicLinkByOtp } from '@/data/auth';
import { getOrCreateUserByEmail } from '@/data/user';
import { MagicLoginSchema } from '@/schemas/auth';
import { ActionError, ApiError, ApiSuccess } from '@lib/api-response';
import db from '@lib/db';
import { sendMagicLinkEmail } from '@lib/mail/sendMagicLinkEmail';
import { NextRequest, NextResponse } from 'next/server';
import { generate } from '@lib/functions/generatePassphrase';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';
import { APP_URL } from '@lib/constants';

/**
 * @swagger
 * /api/v1/auth:
 *   post:
 *     summary: Authenticate using a phrase code.
 *     operationId: phraseCodeAuth
 *     description: Validates a given phrase code for authentication. The code must be active and not previously used for authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: The phrase code used for authentication.
 *     responses:
 *       200:
 *         description: Authentication successful. The phrase code is valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *       400:
 *         description: Bad request. Possible reasons include missing phrase code, invalid phrase code, or the phrase code cannot be reused.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Phrase code is required
 *     tags:
 *       - Authentication
 */
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { code = '' } = data || {};

  try {
    if (!code) {
      throw new ActionError('error', 400, 'Phrase code is required');
    }

    const phraseCode = await db.phraseCode.findUnique({
      where: {
        code,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!phraseCode) {
      throw new ActionError('error', 400, `Invalid phrase code, consider to re-authenticate or visit ${APP_URL} to generate new phrase code`);
    }

    if (phraseCode.isAuthenticated) {
      throw new ActionError('error', 400, "This phrase code can't be used.");
    }

    db.phraseCode.update({
      where: {
        code,
      },
      data: {
        isAuthenticated: true,
      },
    });

    return NextResponse.json(
      {
        status: 'OK',
        message: 'Authentication successful.',
        data: [],
      } as ApiSuccess<any>,
      {
        status: 200,
      }
    );
  } catch (err: any) {
    if (err instanceof ActionError) {
      return NextResponse.json(err.toJson(), {
        status: err.status || 400,
      });
    } else {
      return NextResponse.json(
        {
          status: 400,
          code: 'BAD_REQUEST',
          message: err?.message || 'Something went wrong. Please try again.',
        } as ApiError,
        {
          status: 400,
        }
      );
    }
  }
}

/**
 * @swagger
 * /api/v1/auth:
 *   get:
 *     summary: Generate a phrase code for authentication by using email and otpCode.
 *     operationId: magicLinkAuth
 *     description: Validates a given email and an optional otpCode for authentication. If the otpCode is not provided, a new one-time password is sent to the email address. If the otpCode is provided, it is validated against the email address.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           default: ""
 *         required: true
 *         description: Email of the user to authenticate. Required.
 *       - in: query
 *         name: otpCode
 *         schema:
 *           type: string
 *           default: ""
 *         description: A 6-digit length of one-time password code that is sent to the email. Optional.
 *     responses:
 *       200:
 *         description: Authentication successful. The phrase code is returned for the session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *       429:
 *         description: Too many requests. The user has reached the maximum number of requests for the given time period.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Too many attempts for sending otp code
 *       400:
 *         description: Bad request. Possible reasons include missing email, invalid email, or invalid otpCode.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email is required
 *     tags:
 *       - Authentication
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams);

  const validatedFields = MagicLoginSchema.safeParse({
    email: params?.email || '',
    otpCode: params?.otpCode || '',
  });

  return apiTryCatch<any>(async () => {
    if (!validatedFields.success) {
      throw new ActionError('error', 400, 'One or more provided values is invalid. Please check your input and try again.');
    }

    const { email, otpCode } = validatedFields.data;

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

      const res = await sendMagicLinkEmail(existingUser.email, magicLink, 'gpt');

      if (!res) {
        throw new ActionError('error', 400, 'Failed to send magic link.');
      }

      return NextResponse.json(
        {
          status: 'OK',
          message: `We've sent a magic link to your email address. Please check your inbox and find the one-time password to continue.`,
          data: [],
        } as ApiSuccess<any>,
        {
          status: 200,
        }
      );
    } else {
      /**
       * When user provides both email and otpCode, we will verify the otpCode and create an active session for the user.
       */
      const magicLinkWithUser = await getMagicLinkByOtp(existingUser, otpCode);

      if (!magicLinkWithUser) {
        throw new ActionError('error', 400, 'Failed to validate your OTP code. Please try again.');
      }

      // Expire magic link so its token can't be used again
      await expireMagicLinkByToken(magicLinkWithUser.token);

      const code = generate({ fast: true, numbers: false, separator: ' ', length: 5 });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 1);

      const phraseCode = await db.phraseCode.upsert({
        where: {
          userId: magicLinkWithUser.user.id,
        },
        create: {
          code,
          userId: magicLinkWithUser.user.id,
          expiresAt: expiresAt,
        },
        update: {
          code,
          expiresAt: expiresAt,
        },
      });

      if (!phraseCode) {
        throw new ActionError('error', 400, 'Failed to generate phrase code. Please try again.');
      }

      return NextResponse.json(
        {
          status: 'OK',
          message: `We've generated a phrase code for you. Please use the following code to continue: "${phraseCode.code}"`,
          data: {
            phraseCode: phraseCode.code,
            expiresAt: phraseCode.expiresAt,
          },
        } as ApiSuccess<any>,
        {
          status: 200,
        }
      );
    }
  });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
    }
  );
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
    }
  );
}

export async function PATCH(req: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
    }
  );
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
    }
  );
}

export async function HEAD(req: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
    }
  );
}
