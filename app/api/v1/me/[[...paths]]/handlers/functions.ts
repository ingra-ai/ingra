import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { ActionError } from '@v1/types/api-response';
import db from "@lib/db";
import { Logger } from "@lib/logger";
import { run } from "@app/api/utils/vm/run";
import type { UserSandboxOutput } from "@app/api/utils/vm/types";
import { generateVmContextArgs } from "@app/api/utils/vm/generateVmContextArgs";

const handlerFn = async ( requestArgs: Record<string, any> = {}, ...restOfPaths: string[] ) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    const [functionSlug] = restOfPaths;

    if ( functionSlug ) {
      Logger.withTag('functions').withTag(authSession.user.id).info(`starts executing function: ${functionSlug} - with args: ${JSON.stringify(requestArgs)}`);

      const functionRecord = await db.function.findUnique({
        where: {
          ownerUserId_slug: {
            ownerUserId: authSession.user.id,
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

      const vmContext = generateVmContextArgs(authSession, functionRecord.arguments, requestArgs);

      const vmOutput = await run(functionRecord.code, vmContext);

      const errors = vmOutput.outputs.filter(output => output.type === 'error') as UserSandboxOutput[];

      if ( errors.length ) {
        throw new ActionError('error', 400, errors[0].message);
      }

      Logger.withTag('functions').withTag(authSession.user.id).info(`finishes executing function: ${functionSlug}`);

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
