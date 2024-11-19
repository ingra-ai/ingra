import db from '@repo/db/client'; // Assuming you have a db instance for interacting with your database
import { clearAuthCaches } from '@repo/shared/data/auth/session/caches';
import { upsertEnvVar } from '@repo/shared/data/envVars';
import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/me/environmentVariables:
 *   get:
 *     summary: Retrieve all available environment variable keys and their record IDs.
 *     operationId: getEnvironmentVariablesList
 *     responses:
 *       200:
 *         description: Successfully retrieved environment variables.
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
 *                     - Discovered 5 environment variables set.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       key:
 *                         type: string
 *     tags:
 *       - Built-ins Internal
 *       - Environment Variables
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const envVars = await db.envVars.findMany({
      select: {
        id: true,
        key: true,
      },
    });

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'getEnvironmentVariablesList',
    });
    
    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: {},
      responseData: envVars,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('envVars').withTag(`user|${authSession.user.id}`).info('Fetching environment variables');

    return NextResponse.json(
      {
        status: 'success',
        message: `Discovered ${envVars.length} environment variables set.`,
        data: envVars,
      },
      {
        status: 200,
      }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/environmentVariables:
 *   post:
 *     summary: Create a new environment variable.
 *     operationId: createEnvironmentVariable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 examples:
 *                   - DATABASE_URL
 *               value:
 *                 type: string
 *                 examples:
 *                   - postgres://user:password@localhost:5432/dbname
 *     responses:
 *       200:
 *         description: Environment variable created successfully.
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
 *                     - Environment variable "DATABASE_URL" created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     key:
 *                       type: string
 *     tags:
 *       - Built-ins Internal
 *       - Environment Variables
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const requestArgs = await req.json();
    const { key, value } = requestArgs;

    if (!key || !value) {
      throw new Error('Key and value are required to create a new environment variable');
    }

    const record = await upsertEnvVar(key, value, authSession.user.id);

    await clearAuthCaches(authSession);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'createEnvironmentVariable',
    });
    
    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: requestArgs,
      responseData: record,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('envVars').withTag(`user|${authSession.user.id}`).info('Upserted environment variable');

    return NextResponse.json(
      {
        status: 'success',
        message: `Environment variable "${key}" created successfully`,
        data: {
          id: record.id,
          key: record.key,
        },
      },
      {
        status: 200,
      }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/environmentVariables:
 *   delete:
 *     summary: Delete an environment variable.
 *     operationId: deleteEnvironmentVariable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Environment variable removed successfully.
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
 *                     - Environment variable "DATABASE_URL" removed successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     key:
 *                       type: string
 *     tags:
 *       - Built-ins Internal
 *       - Environment Variables
 */
export async function DELETE(req: NextRequest) {
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const { key, id } = await req.json();

    if (!key || !id) {
      throw new Error('Both environment variable record ID and key are required to delete an environment variable');
    }

    const deletedEnvVar = await db.envVars.delete({
      where: {
        id,
        ownerUserId_key: {
          ownerUserId: authSession.user.id,
          key,
        },
      },
    });

    await clearAuthCaches(authSession);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'deleteEnvironmentVariable',
    });
    
    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: {},
      responseData: deletedEnvVar,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|envVars').withTag(`user|${authSession.user.id}`).info(`Deleted env var: ${key}`);

    return NextResponse.json(
      {
        status: 'success',
        message: `Environment variable "${key}" removed successfully`,
        data: deletedEnvVar,
      },
      {
        status: 200,
      }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/environmentVariables:
 *   patch:
 *     summary: Update an environment variable.
 *     operationId: updateEnvironmentVariable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Environment variable updated successfully.
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
 *                     - Environment variable "DATABASE_URL" updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *     tags:
 *       - Built-ins Internal
 *       - Environment Variables
 */
export async function PATCH(req: NextRequest) {
  const startTime = Date.now();

  return await apiAuthTryCatch<any>(async (authSession) => {
    const { id, key, value } = await req.json();

    if (!id || !key || !value) {
      throw new Error('To update an environment variable, provide the record ID, key, and value.');
    }

    const updatedEnvVar = await db.envVars.update({
      where: {
        id,
        ownerUserId_key: {
          ownerUserId: authSession.user.id,
          key,
        },
      },
      data: {
        key,
        value,
      },
    });

    await clearAuthCaches(authSession);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'updateEnvironmentVariable',
    });

    // Log function execution
    await logFunctionExecution({
      functionId: '00000000-0000-0000-0000-000000000000', 
      userId: authSession.user.id,
      requestData: {},
      responseData: updatedEnvVar,
      executionTime: Date.now() - startTime,
      error: null,
    });

    Logger.withTag('api|builtins').withTag('operation|envVars').withTag(`user|${authSession.user.id}`).info(`Updated env var: ${key}`);

    return NextResponse.json(
      {
        status: 'success',
        message: `Environment variable "${key}" updated successfully`,
        data: updatedEnvVar,
      },
      {
        status: 200,
      }
    );
  });
}
