import db from '@repo/db/client'; // Assuming you have a db instance for interacting with your database
import { clearAuthCaches } from '@repo/shared/data/auth/session/caches';
import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { setTokenAsDefault } from '@repo/shared/data/oauthToken';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/me/oAuthTokens:
 *   get:
 *     summary: Retrieve all available OAuth tokens for the authenticated user.
 *     operationId: getOAuthTokensList
 *     responses:
 *       200:
 *         description: Successfully retrieved OAuth tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   examples:
 *                     - success
 *                 message:
 *                   type: string
 *                   examples:
 *                     - Discovered 3 oAuth tokens set.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         examples:
 *                           - 123e4567-e89b-12d3-a456-426614174000
 *                       service:
 *                         type: string
 *                         examples:
 *                           - google-oauth
 *                       primaryEmailAddress:
 *                         type: string
 *                         examples:
 *                           - user@example.com
 *                       isDefault:
 *                         type: boolean
 *                         examples:
 *                           - true
 *     tags:
 *       - Built-ins Internal
 *       - OAuth Token
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const oAuthTokens = await db.oAuthToken.findMany({
      where: {
        userId: authSession.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = oAuthTokens.map((elem) => {
      return {
        id: elem.id,
        service: elem.service,
        primaryEmailAddress: elem.primaryEmailAddress,
        isDefault: elem.isDefault,
      };
    });

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'getOAuthTokensList',
    });

    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000',
      userId: authSession.user.id,
      requestData: {},
      responseData: result,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|oAuthTokens').withTag(`user|${authSession.user.id}`).info('Fetching available OAuth tokens.');

    return NextResponse.json(
      {
        status: 'success',
        message: `Discovered ${oAuthTokens.length} oAuth tokens set.`,
        data: result,
      },
      {
        status: 200,
      }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/oAuthTokens:
 *   patch:
 *     summary: Set an OAuth token as the default for a specific service.
 *     operationId: setOAuthTokenAsDefault
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 examples:
 *                   - 123e4567-e89b-12d3-a456-426614174000
 *               service:
 *                 type: string
 *                 examples:
 *                   - google-oauth
 *     responses:
 *       200:
 *         description: OAuth token set as default successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   examples:
 *                     - success
 *                 message:
 *                   type: string
 *                   examples:
 *                     - Sets default OAuth token for service "google" to user@example.com.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       examples:
 *                         - 123e4567-e89b-12d3-a456-426614174000
 *                     service:
 *                       type: string
 *                       examples:
 *                         - google-oauth
 *                     primaryEmailAddress:
 *                       type: string
 *                       examples:
 *                         - user@example.com
 *                     isDefault:
 *                       type: boolean
 *                       examples:
 *                         - true
 *     tags:
 *       - Built-ins Internal
 *       - OAuth Token
 */
export async function PATCH(req: NextRequest) {
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const { id, service } = await req.json();

    if (!id || !service) {
      throw new Error('To update an OAuth Token, provide the record ID, and service type.');
    }

    const defaultOAuthToken = await setTokenAsDefault(id, service, authSession.user.id);

    await clearAuthCaches(authSession);

    const result = {
      id: defaultOAuthToken.id,
      service: defaultOAuthToken.service,
      primaryEmailAddress: defaultOAuthToken.primaryEmailAddress,
      isDefault: defaultOAuthToken.isDefault,
    };

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'setOAuthTokenAsDefault',
    });

    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000',
      userId: authSession.user.id,
      requestData: {},
      responseData: result,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|oAuthTokens').withTag(`user|${authSession.user.id}`).info(`Sets default OAuth token for service "${service}" to ${defaultOAuthToken.primaryEmailAddress}.`);

    return NextResponse.json(
      {
        status: 'success',
        message: `Sets default OAuth token for service "${service}" to ${defaultOAuthToken.primaryEmailAddress}.`,
        data: result,
      },
      {
        status: 200,
      }
    );
  });
}
