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
  const fieldsToRetrieveParams: string[] = searchParams.getAll('fieldsToRetrieve') || [];

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Validate that either id or slug is provided
    if (!id && !slug) {
      throw new Error('Either id or slug must be provided');
    }

    const selectFields: Prisma.FunctionSelect = {
      id: true,
      slug: true
    };
    
    // Populate Function select fields
    if (fieldsToRetrieveParams.length) {
      const acceptableFieldNames: (keyof Prisma.FunctionSelect)[] = ['description', 'code', 'httpVerb', 'isPrivate', 'isPublished', 'arguments', 'tags'];
      acceptableFieldNames.forEach((acceptableFieldName) => {
        if (fieldsToRetrieveParams.length === 0 || fieldsToRetrieveParams.includes(acceptableFieldName)) {
          // Non relational fields;
          switch (acceptableFieldName) {
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

    if (id && whereFilter.AND && Array.isArray(whereFilter.AND)) {
      whereFilter.AND.push({ id });
    }

    if (slug && whereFilter.AND && Array.isArray(whereFilter.AND)) {
      whereFilter.AND.push({ slug });
    }

    const functionRecord = await db.function.findFirst({
      where: whereFilter,
      select: selectFields
    });

    // Check if the function was found
    if (!functionRecord) {
      throw new Error('Unable to find the function you\'re looking for');
    }

    Logger.withTag('me-builtins')
      .withTag('curateFunctions-view')
      .withTag(`user:${authSession.user.id}`)
      .info('Viewing a specific user function', { whereFilter });

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
