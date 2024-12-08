import { createNewFunction } from '@repo/shared/actions/functions';
import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { FunctionSchema } from '@repo/shared/schemas/function';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/v1/me/curateFunctions/createNew:
 *   post:
 *     summary: Create a new function for the current user by providing a function schema.
 *     operationId: createNewFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               function:
 *                 type: object
 *                 required: [slug, description]
 *                 properties:
 *                   slug:
 *                     type: string
 *                     description: The slug of the function to be edited
 *                   code:
 *                     type: string
 *                     description: The code of the function
 *                   description:
 *                     type: string
 *                     description: The description of the function
 *                   httpVerb:
 *                     type: string
 *                     description: The HTTP verb of the function
 *                   isPrivate:
 *                     type: boolean
 *                     description: If the function is private
 *                   isPublished:
 *                     type: boolean
 *                     description: If the function is published
 *                   arguments:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/FunctionArgument'
 *                   tags:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/FunctionTag'
 *     responses:
 *       '200':
 *         description: Successfully created new function
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
export async function POST(req: NextRequest) {
  const requestArgs = await req.json();
  const functionPayload = requestArgs?.function as z.infer<typeof FunctionSchema>;
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const result = await createNewFunction({
      ...functionPayload,

      /*
       * Any function created via this endpoint is private and unpublished, therefore it won't appear in Marketplace.
       * User may have to go through the web if they want to publish it.
       */
      isPrivate: true,
      isPublished: false,
    });

    if ( result?.status === 'error' ) {
      throw new Error( result?.message ?? 'Failed to create new function');
    }

    if ( !result?.data ) {
      throw new Error( 'Failed to create new function');
    }

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'createNewFunction',
    });
        
    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: requestArgs,
      responseData: result,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|curateFunctions-createNew').withTag(`user|${authSession.user.id}`).withTag(`function|${result.data.id}`).info(`Created new function ${result.data.slug}`);

    return NextResponse.json(
      {
        status: 'success',
        message: `Function "${result.data.slug}" with ID of "${result.data.id}" has been created.`,
        data: {
          ...result.data,
          code: '<REDACTED>',
        },
      },
      {
        status: 200,
      }
    );
  });
}
