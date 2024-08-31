import { NextRequest, NextResponse } from 'next/server';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { Logger } from '@repo/shared/lib/logger';
import { ActionError } from '@v1/types/api-response';
import { runUserFunction } from '@repo/shared/utils/vm/functions/runUserFunction';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { mixpanel } from '@repo/shared/lib/analytics';
import { getFunctionAccessibleByUser } from '@repo/shared/data/functions';

/**
 * @swagger
 * /api/v1/me/curateFunctions/executeFunction:
 *   post:
 *     summary: Dry run a function by providing referenced function ID and "requestArgs" for the function's arguments.
 *     operationId: executeFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - functionIdOrSlug
 *             properties:
 *               functionIdOrSlug:
 *                  type: string
 *                  description: The ID in UUID format, or slug of the function to run.
 *                  examples:
 *                    - "090abc6e-0e19-466d-8549-83dd24c5c8e5"
 *                    - "myFunction"
 *               requestArgs:
 *                 type: object
 *                 description: The request arguments to pass to the function in a form of an object. This will be part of requestArgs in the VM context.
 *                 properties: {}
 *                 additionalProperties: true
 *     responses:
 *       '200':
 *         description: Successfully ran the function
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
 *       - Curate Functions
 */
export async function POST(req: NextRequest) {
  const { functionIdOrSlug, requestArgs = {} } = await req.json();

  return await apiAuthTryCatch<any>(async (authSession) => {
    if (!functionIdOrSlug) {
      throw new ActionError('error', 400, 'Function ID or slug is required to run this method.');
    }

    // Find the function
    const functionRecord = await getFunctionAccessibleByUser(authSession.user.id, functionIdOrSlug, {
      accessTypes: ['owner', 'subscriber'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    if (!functionRecord) {
      throw new Error(`The function with ID or slug '${functionIdOrSlug}' was not found in any of yours or subscribed functions`);
    }

    // Run the function
    const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs),
      loggerObj = Logger.withTag('api|builtins').withTag('operation|curateFunctions-executeFunction').withTag(`user|${authSession.user.id}`).withTag(`function|${functionRecord.id}`);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'executeFunction',
      functionId: functionRecord.id,
      functionSlug: functionRecord.slug,
      metrics,
      errors,
    });

    loggerObj.info('Ran a user function');

    if (errors.length) {
      const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
      loggerObj.error(`Errored executing function: ${errorMessage}`);
      throw new ActionError('error', 400, errorMessage);
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Successfully ran the function',
        data: result,
      },
      {
        status: 200,
      }
    );
  });
}
