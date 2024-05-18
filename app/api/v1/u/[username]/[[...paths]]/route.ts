import { NextRequest, NextResponse } from "next/server";
import { apiUserTryCatch } from "@app/api/utils/apiUserTryCatch";
import { ActionError } from "@lib/api-response";
import db from "@lib/db";
import { run } from "@app/api/utils/vm/run";
import type { UserSandboxOutput } from "@app/api/utils/vm/types";
import { Logger } from "@lib/logger";

export async function GET(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;

  const { searchParams: getParams } = new URL(req.url);
  const searchParams = Object.fromEntries(getParams);

  return await apiUserTryCatch<any>(username, '', async (authSession, vmContext) => {
    if ( !Array.isArray(paths) || !paths.length ) {
      throw new ActionError('error', 400, `Invalid paths.`);
    }

    const [operation, functionSlug] = paths;

    if ( operation === 'functions' && functionSlug ) {
      Logger.withTag('functions').info(`[${username}] starts executing function: ${functionSlug}`);

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

      const payload = await run(functionRecord.code, {
        ...searchParams,
        ...vmContext
      });

      const errors = payload.outputs.filter(output => output.type === 'error') as UserSandboxOutput[];

      if ( errors.length ) {
        throw new ActionError('error', 400, errors[0].message);
      }

      Logger.withTag('functions').info(`[${username}] finishes executing function: ${functionSlug}`);

      return NextResponse.json(
        {
          status: 'success',
          message: 'Function executed successfully',
          data: payload?.result || null,
        },
        {
          status: 200,
        }
      );
    }
    
    throw new ActionError('error', 400, `Invalid operation.`);
  });
};
