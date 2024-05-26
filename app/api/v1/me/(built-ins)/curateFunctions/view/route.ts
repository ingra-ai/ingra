import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import db from "@lib/db";
import { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/v1/me/curateFunctions/view:
 *   get:
 *     summary: View a specific function details including by providing id or slug. Function code is visible in the response.
 *     operationId: viewFunction
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the function to view.
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: The slug of the function to view.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the function
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
 *       '404':
 *         description: Function not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Validate that either id or slug is provided
    if (!id && !slug) {
      throw new Error('Either id or slug must be provided');
    }

    // Prepare the search filter based on provided id or slug
    const whereFilter: Prisma.FunctionWhereInput = {
      AND: [
        {
          OR: [
            { ownerUserId: authSession.user.id },
            {
              subscribers: {
                some: {
                  userId: authSession.user.id
                }
              }
            }
          ]
        }
      ]
    };

    if ( id && whereFilter.AND && Array.isArray( whereFilter.AND ) ) {
      whereFilter.AND.push({ id });
    }

    if ( slug && whereFilter.AND && Array.isArray( whereFilter.AND ) ) {
      whereFilter.AND.push({ slug });
    }

    const functionRecord = await db.function.findFirst({
      where: whereFilter,
      select: {
        id: true,
        slug: true,
        description: true,
        code: true,
        isPrivate: true,
        isPublished: true,
        httpVerb: true,
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
      }
    });

    // Check if the function was found
    if ( !functionRecord ) {
      throw new Error('Unable to find the function you\'re looking for');
    }

    Logger.withTag('me-builtins')
      .withTag('curateFunctions-view')
      .withTag(`user:${authSession.user.id}`)
      .info('Viewing a specific user function');

    return NextResponse.json(
      {
        status: 'success',
        message: 'Successfully retrieved the function',
        data: functionRecord,
      },
      {
        status: 200,
      }
    );
  });
}
