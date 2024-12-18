import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { generateCodeDefaultTemplate } from '@repo/shared/utils/vm/functions/generateCodeDefaultTemplate';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/me/curateFunctions/getCodeTemplate:
 *   get:
 *     summary: Getting the code template for current user. It will show what are the available user vars, environment vars, and VM globals in the comment that are ready to be utilized when generating code.
 *     operationId: getCodeTemplate
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
  const startTime = Date.now();
  
  return await apiAuthTryCatch<any>(async (authSession) => {
    const codeTemplate = generateCodeDefaultTemplate(authSession);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'getCodeTemplate',
    });
                        
    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: {},
      responseData: {},
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|curateFunctions-getCodeTemplate').withTag(`user|${authSession.user.id}`).info('Retrieved code template for the user.');

    return NextResponse.json(
      {
        status: 'success',
        message: 'Successfully retrieved the code template ready to be curated for a function suits your need. You can utilize "environmentVariables" endpoint in case you need more customization.',
        data: codeTemplate,
      },
      {
        status: 200,
      }
    );
  });
}
