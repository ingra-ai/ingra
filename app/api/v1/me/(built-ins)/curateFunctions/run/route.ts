import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { executeFunction } from "@app/api/utils/vm/executeFunction";

/**
 * @swagger
 * /api/v1/me/curateFunctions/run:
 *   post:
 *     summary: Run a function by providing referenced function ID and request arguments.
 *     operationId: runFunction
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
 *               requestArguments:
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
  const { functionId, requestArguments } = await req.json();

  return await apiAuthTryCatch<any>(async (authSession) => {
    // Run the function
    const result = await executeFunction(authSession, functionId, requestArguments);

    Logger.withTag('me-builtins')
      .withTag('curateFunctions-run')
      .withTag(`user:${authSession.user.id}`)
      .info('Ran a user function');

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
