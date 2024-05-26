import { type NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import db from "@lib/db";

/**
 * @swagger
 * /api/v1/me/curateFunctions/search:
 *   get:
 *     summary: Search functions for id, slug, description, arguments and tags references. The returned records would be from user's own functions and subscribed functions.
 *     operationId: searchFunctions
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Query string to search functions by slug, description, or tags.
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of searched functions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  return await apiAuthTryCatch<any>(async (authSession) => {
    const functionRecords = await db.function.findMany({
      where: {
        OR: [
          {
            ownerUserId: authSession.user.id,
          },
          {
            subscribers: {
              some: {
                userId: authSession.user.id
              }
            }
          }
        ],
        ...(q ? {
          OR: [
            {
              slug: {
                contains: q,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: q,
                mode: 'insensitive'
              }
            },
            {
              tags: {
                some: {
                  name: {
                    contains: q,
                    mode: 'insensitive'
                  }
                }
              }
            }
          ]
        } : {})
      },
      select: {
        id: true,
        slug: true,
        description: true,
        arguments: {
          select: {
            id: true,
            name: true,
            type: true,
            defaultValue: true,
            description: true,
            isRequired: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      take: 10,
      orderBy: {
        updatedAt: 'desc',
      }
    });

    Logger.withTag('me-builtins')
      .withTag('curateFunctions-list')
      .withTag(`user:${authSession.user.id}`)
      .info('Listing some recent user functions');

    return NextResponse.json(
      {
        status: 'success',
        message: `Successfully retrieved list of searched functions with term "${ q }"`,
        data: functionRecords,
      },
      {
        status: 200,
      }
    );
  });
}
