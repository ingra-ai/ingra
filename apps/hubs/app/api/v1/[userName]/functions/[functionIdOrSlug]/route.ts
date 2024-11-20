import { logFunctionExecution } from '@repo/shared/data/functionExecutionLog';
import { getFunctionAccessibleByUser, type FunctionAccessType } from '@repo/shared/data/functions';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { ActionError } from '@repo/shared/types';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { handleRequest } from '@repo/shared/utils/handleRequest';
import { runUserFunction } from '@repo/shared/utils/vm/functions/runUserFunction';
import { NextRequest, NextResponse } from 'next/server';


type ContextShape = {
  params: Promise<{
    userName: string;
    functionIdOrSlug: string;
  }>;
};

type HandlerArgs = ContextShape & {
  requestArgs: Record<string, any>;
  requestHeaders: Headers;
  analyticsObject: ReturnType<typeof getAnalyticsObject>;
};

async function handlerFn(args: HandlerArgs) {
  return await apiAuthTryCatch<any>(async (authSession) => {
    const { params, requestArgs, requestHeaders, analyticsObject } = args;
    const { userName, functionIdOrSlug } = await params;
    const isSandboxDebug = requestHeaders.get('SANDBOX_DEBUG') === 'true';
    const userId = authSession.user.id,
      loggerObj = Logger.withTag('api|functions').withTag(`user|${userId}`).withTag(`functionIdOrSlug|${functionIdOrSlug}`);

    loggerObj.info(`Starts executing function: ${functionIdOrSlug}`, requestArgs);

    let accessTypes: FunctionAccessType[] = ['owner'];

    if (!functionIdOrSlug) {
      throw new ActionError('error', 400, 'Function ID or slug is required to run this method.');
    }

    if (authSession.user.profile?.userName === userName) {
      // If the user is the owner of the function
      accessTypes = ['owner'];
    } else {
      // User is probably a subscriber
      accessTypes = ['subscriber', 'subscribedCollection'];
    }

    // Find the function
    const functionRecord = await getFunctionAccessibleByUser(authSession.user.id, functionIdOrSlug, {
      accessTypes,
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    if (!functionRecord) {
      throw new ActionError('error', 404, `Function ${functionIdOrSlug} is not found from ${userName} repository.`);
    }

    const { result, metrics, errors, logs } = await runUserFunction(authSession, functionRecord, requestArgs);
    

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'function',
      ...analyticsObject,
      invokerUserId: authSession.user.id,
      ownerUserId: functionRecord.ownerUserId,
      functionId: functionRecord.id,
      functionIdOrSlug: functionIdOrSlug,
      isSandboxDebug,
      accessTypes,
      metrics,
      errors,
    });

    // Log function execution
    await logFunctionExecution({
      functionId: functionRecord.id, 
      userId: authSession.user.id,
      requestData: requestArgs,
      responseData: result,
      executionTime: metrics?.executionTime || 0,
      error: errors?.[0]?.message || null,
    });

    loggerObj.withTag(`function|${functionRecord.id}`).info(`Finished executing function: ${functionIdOrSlug}`, metrics);

    if (errors?.length) {
      const errorMessage = `Function run error: ${errors?.[0].message || 'An error occurred while running user function.'}`;
      loggerObj.withTag(`function|${functionRecord.id}`).error(errorMessage);

      if ( isSandboxDebug ) {
        return NextResponse.json(
          {
            status: 'function-error',
            message: errorMessage ?? 'Function run error: An error occurred while running user function in sandbox debug mode.',
            data: {
              result: result || null,
              metrics: metrics || {},
              errors: errors || [],
              logs: logs || [],
            },
          },
          {
            status: 200,
          }
        );
      }
      else {
        throw new ActionError('error', 400, errorMessage);
      }
    }

    if (isSandboxDebug) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Function executed successfully',
          data: {
            result: result || null,
            metrics: metrics || {},
            errors: errors || [],
            logs: logs || [],
          },
        },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Function executed successfully',
        data: result || null,
      },
      {
        status: 200,
      }
    );
  }, {
    introspectOAuthTokens: true,
  });
}

export async function GET(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('GET', req, (context.params), handlerFn);
}

export async function POST(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('POST', req, (context.params), handlerFn);
}

export async function PUT(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('PUT', req, (context.params), handlerFn);
}

export async function PATCH(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('PATCH', req, (context.params), handlerFn);
}

export async function DELETE(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('DELETE', req, (context.params), handlerFn);
}
