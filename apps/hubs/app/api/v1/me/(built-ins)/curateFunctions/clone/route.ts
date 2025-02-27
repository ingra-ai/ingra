import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { cloneFunction } from '@repo/shared/data/functions';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/me/curateFunctions/clone:
 *   post:
 *     summary: Generate an exact copy of a function and its arguments by providing referenced function ID. Useful for fast-prototyping of a new function using an existing similar one.
 *     operationId: cloneFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               functionId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the function to clone. In UUID format.
 *                 examples:
 *                   - "090abc6e-0e19-466d-8549-83dd24c5c8e5"
 *     responses:
 *       '200':
 *         description: Successfully cloned the function
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
  const { functionId } = await req.json();
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Clone the function
    const clonedFunction = await cloneFunction(functionId, authSession.user.id);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'cloneFunction',
    });
    
    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: { functionId },
      responseData: clonedFunction,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|curateFunctions-clone').withTag(`user|${authSession.user.id}`).withTag(`function|${functionId}`).info('Cloned a function');

    return NextResponse.json(
      {
        status: 'success',
        message: 'Successfully cloned the function',
        data: clonedFunction,
      },
      {
        status: 200,
      }
    );
  });
}
