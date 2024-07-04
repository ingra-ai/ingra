import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { runUserFunction } from "@app/api/utils/vm/functions/runUserFunction";
import { mixpanel } from "@lib/analytics";

const handlerFn = async (
  collectionSlug: string,
  functionSlug: string,
  requestArgs: Record<string, any> = {},
  analyticsObject: Record<string, any> = {}
) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    if ( typeof functionSlug === 'string' && functionSlug.length) {
      const userId = authSession.user.id,
        loggerObj = Logger
          .withTag('api|collectionFunction')
          .withTag(`user|${ userId }`)
          .withTag(`path|${collectionSlug}/${functionSlug}`);

      loggerObj.info(`Starts executing function`, requestArgs);

      // Fetch collection that current user is subscribed to
      const myCollection = await db.collection.findFirst({
        where: {
          slug: collectionSlug,
          userId,
        },
        select: {
          id: true,
          functions: {
            where: {
              slug: functionSlug,
              ownerUserId: userId,
              isPublished: true,
              isPrivate: false
            },
            select: {
              id: true,
              code: true,
              arguments: true
            }
          },
        }
      });

      const functionRecord = myCollection?.functions?.[0];

      if ( !functionRecord ) {
        throw new ActionError('error', 404, `Function ${ functionSlug } is not found in collection ${ collectionSlug }.`);
      }

      const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs);

      /**
       * Analytics & Logging
       */
      mixpanel.track('Collection Function Executed', {
        distinct_id: authSession.user.id,
        type: 'collectionFunction',
        ...analyticsObject,
        collectionId: myCollection.id,
        collectionSlug: collectionSlug,
        functionId: functionRecord.id,
        functionSlug: functionSlug,
        metrics,
        errors,
      });

      loggerObj
        .withTag(`collection|${myCollection.id}`)
        .withTag(`function|${functionRecord.id}`)
        .info(`Finished executing function: ${functionSlug}`, metrics);

      if ( errors.length ) {
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
