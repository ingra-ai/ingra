import { getAuthSession } from '@repo/shared/data/auth/session';
import { HUBS_APP_URL } from '@repo/shared/lib/constants';
import { apiTryCatch } from '@repo/shared/utils/apiTryCatch';
import { NextRequest, NextResponse } from 'next/server';

import { ActionError } from '@v1/types/api-response';


import { getCommunityCollectionSpec } from './getCommunityCollectionSpec';
import { getMyCollectionAuthSpec } from './getMyCollectionAuthSpec';


/**
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(req: NextRequest, { params }: { params: { userName: string; collectionSlug: string } }) {
  return await apiTryCatch( async () => {
    const authSession = await getAuthSession();
    const { userName, collectionSlug } = params;
    const itsMe = Boolean(authSession?.user?.profile?.userName && authSession.user.profile.userName === userName);

    if ( !authSession ) {
      throw new ActionError('error', 403, `Only owner and collection's subscribers can view this collection.`);
    }
  
    const swaggerSpec = ( itsMe && authSession ) ? 
      await getMyCollectionAuthSpec(authSession, userName, collectionSlug) : 
      await getCommunityCollectionSpec(authSession, userName, collectionSlug);
  
    if (!swaggerSpec) {
      throw new ActionError('error', 404, `No specifications found.`);
    }
  
    /**
     * Extras for swaggerSpec that if I add in the swagger/config, it will throw an error and the swagger UI won't load
     * @todo find a way to add these in the swagger/config
     */
    Object.assign(swaggerSpec, {
      servers: [
        {
          url: HUBS_APP_URL,
        },
      ],
    });
  
    return NextResponse.json(swaggerSpec, {
      status: 200,
    });
  })
}
