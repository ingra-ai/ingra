import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { runUserFunction } from "@app/api/utils/vm/functions/runUserFunction";
import { mixpanel } from "@lib/analytics";

const handlerFn = async (
  functionSlug: string,
  ownerUsername: string,
  requestArgs: Record<string, any> = {},
  analyticsObject: Record<string, any> = {}
) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    if ( typeof functionSlug === 'string' && functionSlug.length) {
      const userId = authSession.user.id,
        loggerObj = Logger
          .withTag('api|collectionsSubscriptions')
          .withTag(`user|${ userId }`)
          .withTag(`path|${ownerUsername}/${functionSlug}`);

      loggerObj.info(`Starts executing function`, requestArgs);

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
        throw new ActionError('error', 404, `The owner ${ ownerUsername } of function ${ functionSlug } was not found. He might have changed his username or deleted his account. You may need to re-sync your function configuration manually.`);
      }

      // Fetch collection that current user is subscribed to
      const myCollectionSubscription = await db.collectionSubscription.findFirst({
        where: {
          collection: {
            userId: ownerUser.userId,
            functions: {
              some: {
                slug: functionSlug,
              }
            }
          },
          userId,
        },
        select: {
          collection: {
            include: {
              functions: {
                where: {
                  slug: functionSlug,
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
          }
        }
      });

      const functionRecord = myCollectionSubscription?.collection?.functions?.[0];

      if ( !functionRecord ) {
        throw new ActionError('error', 404, `Function not found.`);
      }

      const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs);

      /**
       * Analytics & Logging
       */
      mixpanel.track('Collection Subscription Executed', {
        distinct_id: authSession.user.id,
        type: 'collectionSubscription',
        ...analyticsObject,
        functionId: functionRecord.id,
        functionSlug: functionSlug,
        metrics,
        errors,
      });

      loggerObj.withTag(`function|${functionRecord.id}`).info(`Finished executing function: ${functionSlug}`, metrics);

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
