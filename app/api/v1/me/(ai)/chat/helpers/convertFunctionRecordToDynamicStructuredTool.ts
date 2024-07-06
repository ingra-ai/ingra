import { DynamicStructuredTool } from "@langchain/community/tools/dynamic";
import { Prisma } from "@prisma/client";
import { functionArgsToZod } from "@app/api/utils/functions/functionArgsToZod";
import { runUserFunction } from "@app/api/utils/vm/functions/runUserFunction";
import db from "@lib/db";
import { AuthSessionResponse } from "@app/auth/session/types";
import { mixpanel } from "@lib/analytics";
import { Logger } from "@lib/logger";

type FunctionForLangchainPayload = Prisma.FunctionGetPayload<{
  select: {
    id: true,
    code: false,
    isPrivate: false,
    ownerUserId: false,
    httpVerb: true,
    slug: true,
    description: true,
    arguments: true,
    tags: true,
  }
}>;

export const convertFunctionRecordToDynamicStructuredTool = ( authSession: AuthSessionResponse, functionRecord: FunctionForLangchainPayload) => {
  return new DynamicStructuredTool({
    name: functionRecord.slug,
    description: functionRecord.description,
    schema: functionArgsToZod(functionRecord.arguments),
    func: async ( requestArgs = {} ) => {
      try {
        const loggerObj = Logger
          .withTag('api|langchainFunction')
          .withTag(`function|${ functionRecord.id }`)
          .withTag(`slug|${functionRecord.slug}`);

        /**
         * Grab the function again, I know its redundant but it's necessary to only grab the function code here to reduce complexities.
         * @todo This is not auth-checked, I think it should be ok.
         */
        const record = await db.function.findFirst({
          where: {
            id: functionRecord.id
          },
          select: {
            id: true,
            code: true,
            arguments: true
          }
        });

        if ( !record ) {
          throw new Error(`Function ${ functionRecord.slug } is not found.`);
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
  
        if ( errors.length ) {
          const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
          loggerObj.error(`Errored executing function: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        return JSON.stringify({
          status: 'success',
          data: result || null,
        });
      }
      catch (err: any) {
        return JSON.stringify({
          error: err.message || 'An error occurred.'
        });
      }
    }
  });
};
