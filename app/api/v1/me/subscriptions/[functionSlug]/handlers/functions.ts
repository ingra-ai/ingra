import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { run } from "@app/api/utils/vm/run";
import type { MetricSandboxOutput, UserSandboxOutput } from "@app/api/utils/vm/types";
import { generateVmContextArgs } from "@app/api/utils/vm/generateVmContextArgs";

const handlerFn = async (functionSlug: string, requestArgs: Record<string, any> = {}) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    if (typeof functionSlug === 'string' && functionSlug.length) {
      const userId = authSession.user.id;

      Logger.withTag('me-functions-subscriptions').withTag(`user:${ userId }`).info(`Starts executing function: ${functionSlug}`, requestArgs);

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

      const vmContext = generateVmContextArgs(authSession, functionRecord.arguments, requestArgs);

      const vmOutput = await run(functionRecord.code, vmContext);
      const errors = vmOutput.outputs.filter(output => output.type === 'error') as UserSandboxOutput[],
        metrics = ((vmOutput.outputs || []).filter(output => output.type === 'metric') as MetricSandboxOutput[]).map((metric) => {
          return {
            [metric.metric]: metric.value,
          };
        });

      if (errors.length) {
        const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
        Logger.withTag('me-functions-subscriptions').withTag(`user:${ userId }`).error(`Errored executing function: ${errorMessage}`);
        throw new ActionError('error', 400, errorMessage);
      }

      Logger.withTag('me-functions-subscriptions').withTag(`user:${ authSession.user.id }`).info(`Finished executing function: ${functionSlug}`, metrics);

      return NextResponse.json(
        {
          status: 'success',
          message: 'Function executed successfully',
          data: vmOutput?.result || null,
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
