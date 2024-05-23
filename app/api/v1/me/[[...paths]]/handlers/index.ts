export { default as functions } from './functions';

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
export { default as clearCaches } from './clearCaches';