import { NextRequest, NextResponse } from 'next/server';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { Logger } from '@repo/shared/lib/logger';
import { runUserFunction } from '@repo/shared/utils/vm/functions/runUserFunction';
import { ActionError } from '@v1/types/api-response';
import { mixpanel } from '@repo/shared/lib/analytics';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';

/**
 * @swagger
 * /api/v1/me/curateFunctions/dryRun:
 *   post:
 *     summary: Dry run the code without arguments and returns the result. Expecting hard-coded values in replacement for the arguments. User variables and environment variables are still available in the VM context.
 *     operationId: dryRunFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *                - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: The sandbox code that follows the guideline to be executed.
 *               requestArgs:
 *                 type: object
 *                 description: The request arguments to pass to the function in a form of an object. This will be part of requestArgs in the VM context.
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
  const { code, requestArgs = {} } = await req.json();

  if (!code) {
    throw new ActionError('error', 400, 'Node.js code is required to run this method. Please follow the guideline by running "getCodeTemplate" API endpoint.');
  }

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Run the function
    const { result, metrics, errors } = await runUserFunction(
        authSession,
        {
          id: 'dry-run',
          code,
          arguments: [],
        },
        requestArgs
      ),
      loggerObj = Logger.withTag('api|builtins').withTag('operation|curateFunctions-dryRun').withTag(`user|${authSession.user.id}`);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'dryRunFunction',
      metrics,
      errors,
    });

    loggerObj.info('Finished dry run a user function');

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
