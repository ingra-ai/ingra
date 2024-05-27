import { type NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { Prisma } from "@prisma/client";
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
 *       - in: query
 *         name: fieldsToRetrieve
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [description, code, httpVerb, isPrivate, isPublished, arguments, tags]
 *         description: Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected.
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
  const fieldsToRetrieveParams: string[] = searchParams.getAll('fieldsToRetrieve') || [];

  const selectFields: Prisma.FunctionSelect = {
    id: true,
    slug: true
  };

  // Populate Function select fields
  if ( fieldsToRetrieveParams.length ) {
    const acceptableFieldNames: ( keyof Prisma.FunctionSelect )[] = ['description', 'code', 'httpVerb', 'isPrivate', 'isPublished', 'arguments', 'tags'];
    acceptableFieldNames.forEach(( acceptableFieldName ) => {
      if (fieldsToRetrieveParams.length === 0 || fieldsToRetrieveParams.includes(acceptableFieldName)) {
        // Non relational fields;
        switch ( acceptableFieldName ) {
          case 'arguments':
            selectFields[acceptableFieldName] = {
              select: {
                id: true,
                name: true,
                type: true,
                defaultValue: true,
                description: true,
                isRequired: true,
              }
            };
            break;
          case 'tags':
            selectFields[acceptableFieldName] = {
              select: {
                id: true,
                name: true,
              }
            };
            break;
          default:
            selectFields[acceptableFieldName] = true;
            break;
        }
      }
    });
  }
  else {
    selectFields.description = true;
    selectFields.code = true;
    selectFields.httpVerb = true;
    selectFields.isPrivate = true;
    selectFields.isPublished = true;
    selectFields.arguments = {
      select: {
        id: true,
        name: true,
        type: true,
        defaultValue: true,
        description: true,
        isRequired: true,
      }
    };
    selectFields.tags = {
      select: {
        id: true,
        name: true,
      }
    };
  }

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
      select: selectFields,
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
        message: `Successfully retrieved list of searched functions.`,
        data: functionRecords,
      },
      {
        status: 200,
      }
    );
  });
}
