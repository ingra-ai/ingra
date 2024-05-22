import { NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { deleteAllUserCaches } from "@lib/db/extensions/redis";
import { Logger } from "@lib/logger";

const handlerFn = async (requestArgs: Record<string, any> = {}, ...restOfPaths: string[]) => {
  return await apiAuthTryCatch<any>(async (authSession) => {
    const deletedCaches = await deleteAllUserCaches(authSession.user.id);
    
    Logger.withTag('deleteCache').withTag(authSession.user.id).info('Deleted caches for user');

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
