import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';
import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { fetchFunctionPaginationData, FunctionPaginationSearchParams } from '@repo/shared/data/functions';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { type NextRequest, NextResponse } from 'next/server';

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
 *         description: Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected. Only return `code` when requested since the payload is large.
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Number of records to retrieve. Default is 10.
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip. Default is 0.
 *       - in: query
 *         name: marketplace
 *         schema:
 *           type: boolean
 *         description: Toggle to include marketplace functions. Default is false.
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
 *       - Curate Functions
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const take = parseInt(searchParams.get('take') || '10') || 10;
  const skip = parseInt(searchParams.get('skip') || '0') || 0;
  const showMarketplace = searchParams.get('marketplace') === 'true';

  // Conver take and skip to be page and pageSize
  const page = Math.floor(skip / take) + 1;
  const pageSize = take;

  const fieldsToRetrieveParams: string[] = searchParams.getAll('fieldsToRetrieve') || [];
  const startTime = Date.now();

  const selectFields: Prisma.FunctionSelect = {
    id: true,
    slug: true,
  };

  // Populate Function select fields
  if (fieldsToRetrieveParams.length) {
    const acceptableFieldNames: (keyof Prisma.FunctionSelect)[] = ['description', 'code', 'httpVerb', 'isPrivate', 'isPublished', 'arguments', 'tags'];

    // Loop through the fieldsToRetrieveParams and only select the acceptable fields to avoid Prisma errors
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
              },
            };
            break;
          case 'tags':
            selectFields[acceptableFieldName] = {
              select: {
                id: true,
                name: true,
              },
            };
            break;
          default:
            selectFields[acceptableFieldName] = true;
            break;
        }
      }
    });
  } else {
    // Default settings if no fieldsToRetrieve is specified
    selectFields.description = true;
    selectFields.code = false;
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
      },
    };
    selectFields.tags = {
      select: {
        id: true,
        name: true,
      },
    };
  }

  return await apiAuthTryCatch<any>(async (authSession) => {
    const searchParams: FunctionPaginationSearchParams = {
      q: q || undefined,
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortBy: 'updatedAt_desc',
    };

    const whereQuery: Prisma.FunctionWhereInput = showMarketplace ? {
      // Conditions for marketplace functions
      NOT: {
          ownerUserId: authSession.userId
      },
      isPublished: true,
      isPrivate: false,
    } : {
      // Conditions for user's own functions and subscribed functions
      OR: [
        {
          ownerUserId: authSession.userId,
        },
        {
          subscribers: {
            some: {
              userId: authSession.userId,
            },
          },
          isPublished: true,
          isPrivate: false,
        },
      ]
    };

    const paginationData = await fetchFunctionPaginationData(searchParams, {
      invokerUserId: authSession.userId,
      where: whereQuery,
    });

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Search Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'searchFunctions',
    });

    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000',
      userId: authSession.user.id,
      requestData: {
        q,
        fieldsToRetrieve: fieldsToRetrieveParams,
        take,
        skip,
      },
      responseData: paginationData.records,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|curateFunctions-list').withTag(`user|${authSession.user.id}`).info('Listing some recent user functions', { fieldsToRetrieveParams });

    return NextResponse.json(
      {
        status: 'success',
        message: `Successfully retrieved list of searched functions.`,
        data: paginationData,
      },
      {
        status: 200,
      }
    );
  });
}
