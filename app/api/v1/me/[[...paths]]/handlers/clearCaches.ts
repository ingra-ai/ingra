import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { clearAuthCaches } from "@app/auth/session/caches";

const handlerFn = async (requestArgs: Record<string, any> = {}, ...restOfPaths: string[]) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    const deletedCaches = await clearAuthCaches(authSession);
    
    Logger.withTag('api-builtins').withTag('clearCaches').withTag(authSession.user.id).info('Clearing caches for current session');

    return NextResponse.json(
      {
        status: 'success',
        message: 'Caches has been deleted',
        data: deletedCaches,
      },
      {
        status: 200,
      }
    );
  });
}

export default handlerFn;
