import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import db from "@lib/db";
import { ActionError } from "@v1/types/api-response";
import { runUserFunction } from "@app/api/utils/functions/runUserFunction";

/**
 * @swagger
 * /api/v1/me/curateFunctions/dryRun:
 *   post:
 *     summary: Dry run a function by providing referenced function ID and "body" for the arguments.
 *     operationId: dryRunFunction
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
 *                 description: The ID of the function to run. In UUID format.
 *                 example: "090abc6e-0e19-466d-8549-83dd24c5c8e5"
 *               body:
 *                 type: object
 *                 description: The arguments to pass to the function.
 *                 additionalProperties:
 *                   type: object
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
 */
export async function POST(req: NextRequest) {
  const { functionId, body } = await req.json();

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Find the function
    const functionRecord = await db.function.findFirst({
      where: {
        OR: [
          {
            id: functionId,
            ownerUserId: authSession.user.id
          },
          {
            AND: [
              {
                subscribers: {
                  some: {
                    userId: authSession.user.id
                  }
                }
              },
              {
                id: functionId
              }
            ]
          }
        ],
      },
      select: {
        id: true,
        code: true,
        arguments: true
      }
    });

    if ( !functionRecord ) {
      throw new ActionError('error', 400, `Function not found.`);
    }

    // Run the function
    const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, body),
      loggerObj = Logger.withTag('me-builtins').withTag('curateFunctions-dryRun').withTag(`user:${authSession.user.id}`);

    if (errors.length) {
      const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
      loggerObj.error(`Errored executing function: ${errorMessage}`);
      throw new ActionError('error', 400, errorMessage);
    }

    loggerObj.info('Ran a user function');

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
