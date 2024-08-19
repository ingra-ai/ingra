import { NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@app/api/utils/handleRequest";
import { getAnalyticsObject } from "@lib/utils/getAnalyticsObject";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from "@v1/types/api-response";
import { getFunctionAccessibleByUser, type FunctionAccessType } from "@data/functions/getFunctionAccessibleByUser";
import { mixpanel } from "@lib/analytics";
import { runUserFunction } from "@app/api/utils/vm/functions/runUserFunction";
import { Logger } from "@lib/logger";

type ContextShape = { 
  params: { 
    userName: string, 
    functionIdOrSlug: string 
  } 
};

type HandlerArgs = ContextShape & {
  requestArgs: Record<string, any>;
  analyticsObject: ReturnType<typeof getAnalyticsObject>;
}

async function handlerFn ( args: HandlerArgs ) {
  return await apiAuthTryCatch<any>(async (authSession) => {
    const { params, requestArgs, analyticsObject } = args;
    const { userName, functionIdOrSlug } = params;
    const userId = authSession.user.id,
      loggerObj = Logger
        .withTag('api|functions')
        .withTag(`user|${ userId }`)
        .withTag(`functionIdOrSlug|${ functionIdOrSlug }`);

    loggerObj.info(`Starts executing function: ${functionIdOrSlug}`, requestArgs);
  
    let accessType: FunctionAccessType = 'owner';

    if ( !functionIdOrSlug ) {
      throw new ActionError("error", 400, 'Function ID or slug is required to run this method.');
    }

    if ( authSession.user.profile?.userName === userName ) {
      // If the user is the owner of the function
      accessType = 'owner';
    }
    else {
      // User is probably a subscriber
      accessType = 'subscriber';
    }

    // Find the function
    const functionRecord = await getFunctionAccessibleByUser( authSession.user.id, functionIdOrSlug, {
      accessTypes: [accessType],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      }
    } );

    if (!functionRecord) {
      throw new ActionError('error', 404, `Function ${ functionIdOrSlug } is not found from ${ userName } repository.`);
    }

    const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs);

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
      accessType,
      metrics,
      errors,
    });
    
    loggerObj.withTag(`function|${functionRecord.id}`).info(`Finished executing function: ${functionIdOrSlug}`, metrics);

    if (errors.length) {
      const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
      loggerObj.error(`Errored executing function: ${errorMessage}`);
      throw new ActionError('error', 400, errorMessage);
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
  });
}

export async function GET(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('GET', req, context.params, handlerFn);
}

export async function POST(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('POST', req, context.params, handlerFn);
}

export async function PUT(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('PUT', req, context.params, handlerFn);
}

export async function PATCH(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('PATCH', req, context.params, handlerFn);
}

export async function DELETE(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('DELETE', req, context.params, handlerFn);
}
