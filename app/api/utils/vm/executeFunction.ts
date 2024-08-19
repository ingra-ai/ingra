'use server';
import { run } from '@app/api/utils/vm/run';
import { AuthSessionResponse } from "@app/auth/session/types";
import { ActionError } from '@v1/types/api-response';
import db from '@lib/db';
import { generateVmContextArgs } from './generateVmContextArgs';
import { Logger } from '@lib/logger';
import { Prisma } from '@prisma/client';

export async function executeFunction(authSession: AuthSessionResponse, functionId: string, requestArgs: Record<string, any> = {}, isMarketplace = false) {
  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  if (typeof requestArgs !== 'object') {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  let functionToExecute: Prisma.FunctionGetPayload<{
    select: {
      code: boolean;
      arguments: boolean;
    };
  }> | null = null;

  if ( isMarketplace ) {
    // User trying to execute a function from marketplace
    functionToExecute = await db.function.findUnique({
      where: {
        id: functionId,
        isPublished: true,
        isPrivate: false,
      },
      select: {
        code: true,
        arguments: true,
      }
    });

    if ( !functionToExecute ) {
      throw new ActionError('error', 400, `Function from marketplace is not found.`);
    }
  }
  else {
    // Fetch the function code from user's functions
    functionToExecute = await db.function.findUnique({
      where: {
        id: functionId,
        ownerUserId: authSession.user.id,
      },
      select: {
        code: true,
        arguments: true,
      }
    });
  
    if ( !functionToExecute ) {
      throw new ActionError('error', 400, `Function not found for current user.`);
    }
  }

  const context = generateVmContextArgs(authSession, functionToExecute.arguments, requestArgs);

  // Log the actions
  Logger
    .withTag('api|executeFunction')
    .withTag(`user|${ authSession.user.id }`)
    .withTag(`function|${ functionId }`)
    .info('Executing function');

  return await run(functionToExecute.code, context);
}
