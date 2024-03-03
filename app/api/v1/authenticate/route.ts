import db from "@lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Dynamic route handlers for /api/v1/task/[action]
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
 */
/**
 * @swagger
 * /api/v1/authenticate:
 *   post:
 *     summary: Authenticate using a phrase code.
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
export async function POST(req: NextRequest ) {
  const data = await req.json()
  const { code = '' } = data || {};

  if ( !code ) {
    return NextResponse.json(
      { error: "Phrase code is required" },
      {
        status: 400
      }
    );
  }

  const phraseCode = await db.phraseCode.findUnique({
    where: {
      code,
      expiresAt: {
        gte: new Date()
      },
    }
  });

  if ( !phraseCode ) {
    return NextResponse.json(
      { error: "Invalid phrase code" },
      {
        status: 400
      }
    );
  }

  if ( phraseCode.isAuthenticated ) {
    return NextResponse.json(
      { error: "This phrase code can't be used." },
      {
        status: 400
      }
    );
  }

  return NextResponse.json(
    { message: "OK" },
    {
      status: 200
    }
  );
}

// Unsupported methods
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function PUT(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function PATCH(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}

export async function HEAD(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}