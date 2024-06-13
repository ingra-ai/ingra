import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import db from "@lib/db";
import { ActionError } from "@v1/types/api-response";
import { runUserFunction } from "@app/api/utils/functions/runUserFunction";
import { isUuid } from "@lib/utils";

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
 *                 oneOf:
 *                   - type: string
 *                     format: uuid
 *                     description: The ID of the function to run. In UUID format.
 *                     examples:
 *                       - "090abc6e-0e19-466d-8549-83dd24c5c8e5"
 *                   - type: string
 *                     description: The slug of the function to run.
 *                     examples:
 *                       - "myFunction"
 *               requestArgs:
 *                 type: object
 *                 description: The request arguments to pass to the function in a form of an object. This will be part of requestArgs in the VM context.
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
    if ( !functionIdOrSlug ) {
      throw new ActionError("error", 400, 'Function ID or slug is required to run this method.');
    }

    const useUuid = isUuid(functionIdOrSlug);

    // Find the function
    const functionRecord = await db.function.findFirst({
      where: {
        OR: [
          useUuid ? {
            id: functionIdOrSlug,
            ownerUserId: authSession.user.id
          } : {
            slug: functionIdOrSlug,
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
              useUuid ? {
                id: functionIdOrSlug,
              } : {
                slug: functionIdOrSlug
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
      throw new Error(`The function with ID or slug '${functionIdOrSlug}' was not found in any of yours or subscribed functions`);
    }

    // Run the function
    const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs),
      loggerObj = Logger.withTag('me-builtins').withTag('curateFunctions-executeFunction').withTag(`user:${authSession.user.id}`);

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
