import { DynamicStructuredTool } from '@langchain/community/tools/dynamic';
import { Prisma } from '@repo/db/prisma';
import { functionArgsToZod } from '@repo/shared/utils/functions/functionArgsToZod';
import { runUserFunction } from '@repo/shared/utils/vm/functions/runUserFunction';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getFunctionAccessibleByUser } from '@repo/shared/data/functions';

type FunctionForLangchainPayload = Prisma.FunctionGetPayload<{
  select: {
    id: true;
    code: false;
    isPrivate: false;
    ownerUserId: false;
    httpVerb: true;
    slug: true;
    description: true;
    arguments: true;
    tags: true;
  };
}>;

export const convertFunctionRecordToDynamicStructuredTool = (authSession: AuthSessionResponse, functionRecord: FunctionForLangchainPayload) => {
  return new DynamicStructuredTool({
    name: functionRecord.slug,
    description: functionRecord.description,
    schema: functionArgsToZod(functionRecord.arguments),
    func: async (requestArgs = {}) => {
      try {
        const loggerObj = Logger.withTag('api|langchainFunction').withTag(`function|${functionRecord.id}`).withTag(`slug|${functionRecord.slug}`);

        /**
         * Grab the function again, I know its redundant but it's necessary to only grab the function code here to reduce complexities.
         */
        const record = await getFunctionAccessibleByUser(authSession.user.id, functionRecord.id, {
          accessTypes: ['owner', 'subscribedCollection'],
          findFirstArgs: {
            include: {
              arguments: true,
              tags: true,
            },
          },
        });

        if (!record) {
          throw new Error(`Function ${functionRecord.slug} is not found.`);
        }

        loggerObj.info(`Executing langchain function: ${functionRecord.slug}`);

        const { result, metrics, errors } = await runUserFunction(authSession, record, requestArgs);

        /**
         * Analytics & Logging
         */
        mixpanel.track('Langchain Function Executed', {
          distinct_id: authSession.user.id,
          type: 'langchainFunction',
          functionId: functionRecord.id,
          metrics,
          errors,
        });

        loggerObj.info(`Finished executing langchain function: ${functionRecord.slug}`, metrics);

        if (errors.length) {
          const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
          loggerObj.error(`Errored executing function: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        return JSON.stringify({
          status: 'success',
          data: result || null,
        });
      } catch (err: any) {
        return JSON.stringify({
          error: err.message || 'An error occurred.',
        });
      }
    },
  });
};
