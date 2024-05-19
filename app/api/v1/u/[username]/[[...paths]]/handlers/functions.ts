import { NextResponse } from "next/server";
import { apiUserTryCatch } from "@app/api/utils/apiUserTryCatch";
import { ActionError } from "@lib/api-response";
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { run } from "@app/api/utils/vm/run";
import type { UserSandboxOutput } from "@app/api/utils/vm/types";
import { generateVmContextArgs } from "@app/api/utils/vm/generateVmContextArgs";

export default async ( requestArgs: Record<string, any> = {}, username: string, ...restOfPaths: string[] ) => {
  return await apiUserTryCatch<any>('', async (authSession) => {
    const [functionSlug] = restOfPaths;

    if ( functionSlug ) {
      Logger.withTag('functions').info(`[${username}] starts executing function: ${functionSlug} with args: ${JSON.stringify(requestArgs)}`);

      const functionRecord = await db.function.findUnique({
        where: {
          slug: functionSlug,
          ownerUserId: authSession.user.id,
        },
        select: {
          id: true,
          code: true,
        }
      });

      if ( !functionRecord ) {
        throw new ActionError('error', 400, `Function not found.`);
      }

      const vmContext = generateVmContextArgs(authSession, requestArgs);
      const vmOutput = await run(functionRecord.code, vmContext);

      const errors = vmOutput.outputs.filter(output => output.type === 'error') as UserSandboxOutput[];

      if ( errors.length ) {
        throw new ActionError('error', 400, errors[0].message);
      }

      Logger.withTag('functions').info(`[${username}] finishes executing function: ${functionSlug}`);

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
    
    throw new ActionError('error', 400, `Invalid operation.`);
  });
}
