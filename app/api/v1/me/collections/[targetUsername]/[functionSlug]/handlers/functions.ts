import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { runUserFunction } from "@app/api/utils/functions/runUserFunction";

const handlerFn = async ( functionSlug: string, ownerUsername: string, requestArgs: Record<string, any> = {} ) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    if ( typeof functionSlug === 'string' && functionSlug.length) {
      const userId = authSession.user.id,
        loggerObj = Logger.withTag('me-collections-subscriptions').withTag(`user:${ userId }`).withTag(`functionOwner:${ ownerUsername }`).withTag(`functionSlug:${ functionSlug }`);

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

      if ( errors.length ) {
        const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
        loggerObj.error(`Errored executing function: ${errorMessage}`);
        throw new ActionError('error', 400, errorMessage);
      }

      loggerObj.info(`Finished executing function: ${functionSlug}`, metrics);

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
