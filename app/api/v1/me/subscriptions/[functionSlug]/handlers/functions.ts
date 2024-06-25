import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { runUserFunction } from "@app/api/utils/functions/runUserFunction";

const handlerFn = async (functionSlug: string, requestArgs: Record<string, any> = {}) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    if (typeof functionSlug === 'string' && functionSlug.length) {
      const userId = authSession.user.id,
        loggerObj = Logger
          .withTag('api|functionsSubscriptions')
          .withTag(`user|${ userId }`)
          .withTag(`slug|${ functionSlug }`);

      loggerObj.info(`Starts executing function: ${functionSlug}`, requestArgs);

      const functionRecord = await db.function.findFirst({
        where: {
          AND: [
            {
              subscribers: {
                some: {
                  userId: userId
                }
              }
            },
            {
              slug: functionSlug
            },
            {
              isPublished: true,
              isPrivate: false
            }
          ]
        },
        select: {
          id: true,
          code: true,
          arguments: true
        }
      });

      if (!functionRecord) {
        throw new ActionError('error', 400, `Function not found.`);
      }

      const { result, metrics, errors } = await runUserFunction(authSession, functionRecord, requestArgs);

      if (errors.length) {
        const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
        loggerObj.error(`Errored executing function: ${errorMessage}`);
        throw new ActionError('error', 400, errorMessage);
      }

      loggerObj.withTag(`function|${functionRecord.id}`).info(`Finished executing function: ${functionSlug}`, metrics);

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
