import { NextResponse } from "next/server";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { run } from "@app/api/utils/vm/run";
import type { UserSandboxOutput } from "@app/api/utils/vm/types";
import { apiTryCatch } from "@app/api/utils/apiTryCatch";
import { getUserIdByProfileName } from "@/data/user";
import { generateMarketplaceVmArgs } from "./generateMarketplaceVmArgs";

const handlerFn = async ( requestArgs: Record<string, any> = {}, username: string, ...restOfPaths: string[] ) => {
  return await apiTryCatch<any>(async () => {
    const [functionSlug] = restOfPaths;

    if ( functionSlug ) {
      Logger.withTag('marketplace-functions').withTag(username).info(`starts executing function: ${functionSlug} - with args: ${JSON.stringify(requestArgs)}`);

      const userId = await getUserIdByProfileName(username);

      if ( !userId ) {
        throw new ActionError('error', 400, `User not found.`);
      }

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

      const errors = vmOutput.outputs.filter(output => output.type === 'error') as UserSandboxOutput[];

      if ( errors.length ) {
        throw new ActionError('error', 400, errors[0].message);
      }

      Logger.withTag('marketplace-functions').withTag(username).info(`finishes executing function: ${functionSlug}`);

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
