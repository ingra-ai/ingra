import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { runUserFunction } from "@app/api/utils/vm/functions/runUserFunction";
import { mixpanel } from "@lib/analytics";
import { getFunctionAccessibleByUser } from "@data/functions";

const handlerFn = async (
  ownerUsername: string,
  functionSlug: string,
  requestArgs: Record<string, any> = {},
  analyticsObject: Record<string, any> = {}
) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    if (typeof functionSlug === 'string' && functionSlug.length) {
      const userId = authSession.user.id,
        loggerObj = Logger
          .withTag('api|functionsSubscriptions')
          .withTag(`user|${ userId }`)
          .withTag(`slug|${ functionSlug }`);

      loggerObj.info(`Starts executing function: ${functionSlug}`, requestArgs);

      // Fetch owner user ID
      const ownerUser = await db.profile.findUnique({
        where: {
          userName: ownerUsername,
        },
        select: {
          userId: true,
        }
      });

      if ( !ownerUser ) {
        throw new ActionError('error', 404, `The owner ${ ownerUsername } was not found. He might have changed his username or deleted his account. You may need to re-sync your function configuration manually.`);
      }

      const functionRecord = await getFunctionAccessibleByUser( authSession.user.id, functionSlug, {
        accessTypes: ['owner', 'subscriber'],
        findFirstArgs: {
          select: {
            id: true,
            code: true,
            arguments: true
          },
          where: {
            ownerUserId: ownerUser.userId
          }
        }
      });

      if (!functionRecord) {
        throw new ActionError('error', 404, `Function ${ functionSlug } is not found from ${ ownerUsername } repository.`);
      }

      const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs);

      /**
       * Analytics & Logging
       */
      mixpanel.track('Function Subscription Executed', {
        distinct_id: authSession.user.id,
        type: 'functionSubscription',
        ...analyticsObject,
        ownerUserId: ownerUser.userId,
        functionId: functionRecord.id,
        functionSlug: functionSlug,
        metrics,
        errors,
      });
    
      loggerObj.withTag(`function|${functionRecord.id}`).info(`Finished executing function: ${functionSlug}`, metrics);

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
    }

    throw new ActionError('error', 400, `Handler is unable to fulfill this request.`);
  });
}

export default handlerFn;
