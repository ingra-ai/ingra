import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { clearAuthCaches } from "@app/auth/session/caches";

/**
 * @swagger
 * /api/v1/me/clearCaches:
 *   delete:
 *     summary: Clear caches for the current session
 *     operationId: clearCaches
 *     description: Clear all caches for the current session. This may fix some issues for OAuth credentials being expired, with a trade-off of next request will be slower.
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of tasks
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
 */
export async function DELETE(req: NextRequest) {
  return await apiAuthTryCatch<any>(async (authSession) => {
    const deletedCaches = await clearAuthCaches(authSession);
    
    Logger.withTag('me-builtins').withTag('clearCaches').withTag(`user:${ authSession.user.id }`).info('Clearing caches for current session');

    return NextResponse.json(
      {
        status: 'success',
        message: 'Caches has been deleted',
        data: deletedCaches,
      },
      {
        status: 200,
      }
    );
  });
}

