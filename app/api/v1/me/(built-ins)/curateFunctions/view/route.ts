import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { Prisma } from "@prisma/client";
import { getAnalyticsObject } from "@lib/utils/getAnalyticsObject";
import { mixpanel } from "@lib/analytics";
import { getFunctionAccessibleByUser } from "@data/functions";

/**
 * @swagger
 * /api/v1/me/curateFunctions/view:
 *   get:
 *     summary: View a specific function details including by providing id or slug. Function code is visible in the response.
 *     operationId: viewFunction
 *     parameters:
 *       - in: query
 *         name: functionIdOrSlug
 *         description: The ID in UUID format, or slug of the function to view.
 *         schema:
 *           type: string
 *           examples:
 *             - "090abc6e-0e19-466d-8549-83dd24c5c8e5"
 *             - "myFunction"
 *       - in: query
 *         name: fieldsToRetrieve
 *         description: Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected.
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [description, code, httpVerb, isPrivate, isPublished, arguments, tags]
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
  const functionIdOrSlug = searchParams.get('functionIdOrSlug');
  const fieldsToRetrieveParams: string[] = searchParams.getAll('fieldsToRetrieve') || [];

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Validate that either id or slug is provided
    if ( !functionIdOrSlug ) {
      throw new Error('Either function ID or slug must be provided');
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

    const functionRecord = await getFunctionAccessibleByUser( authSession.user.id, functionIdOrSlug, {
      accessTypes: ['owner', 'subscriber'],
      findFirstArgs: {
        select: selectFields
      }
    } )

    // Check if the function was found
    if (!functionRecord) {
      throw new Error(`The function with ID or slug '${functionIdOrSlug}' was not found in any of yours or subscribed functions`);
    }

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'viewFunction',
      functionId: functionRecord.id,
      functionSlug: functionRecord.slug
    });
    
    Logger.withTag('api|builtins')
      .withTag('operation|curateFunctions-view')
      .withTag(`user|${authSession.user.id}`)
      .withTag(`function|${functionRecord.id}`)
      .info('Viewing a specific user function', { accessTypes: ['owner', 'subscriber'] });

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
