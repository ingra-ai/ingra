import { NextResponse } from "next/server";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { run } from "@app/api/utils/vm/run";
import type { MetricSandboxOutput, UserSandboxOutput } from "@app/api/utils/vm/types";
import { apiTryCatch } from "@app/api/utils/apiTryCatch";
import { getUserIdByProfileName } from "@/data/user";
import { generateMarketplaceVmArgs } from "./generateMarketplaceVmArgs";

const handlerFn = async ( requestArgs: Record<string, any> = {}, username: string, ...restOfPaths: string[] ) => {
  return await apiTryCatch<any>(async () => {
    const [functionSlug] = restOfPaths;

    if ( functionSlug ) {
      const userId = await getUserIdByProfileName(username);

      if ( !userId ) {
        throw new ActionError('error', 400, `User not found.`);
      }

      Logger.withTag('marketplace-functions').withTag(userId).info(`starts executing function: ${functionSlug}`, requestArgs);

      const functionRecord = await db.function.findUnique({
        where: {
          ownerUserId_slug: {
            ownerUserId: userId,
            slug: functionSlug,
          },
          isPublished: true,
        },
        select: {
          id: true,
          code: true,
          arguments: true
        }
      });

      if ( !functionRecord ) {
        throw new ActionError('error', 400, `Function not found.`);
      }

      const vmContext = generateMarketplaceVmArgs(functionRecord.arguments, requestArgs);

      const vmOutput = await run(functionRecord.code, vmContext as any);
      const errors = vmOutput.outputs.filter(output => output.type === 'error') as UserSandboxOutput[],
        metrics = (( vmOutput.outputs || [] ).filter(output => output.type === 'metric') as MetricSandboxOutput[] ).map((metric) => {
          return {
            [metric.metric]: metric.value,
          };
        });

      if ( errors.length ) {
        const errorMessage = errors?.[0].message || 'An error occurred while executing the function.';
        Logger.withTag('marketplace-functions').withTag(userId).error(`finishes executing function: ${functionSlug}`);
        throw new ActionError('error', 400, errorMessage);
      }

      Logger.withTag('marketplace-functions').withTag(userId).info(`finishes executing function: ${functionSlug}`, metrics);

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
