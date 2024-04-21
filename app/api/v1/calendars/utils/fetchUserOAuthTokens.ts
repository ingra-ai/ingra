import type { ApiGptTryCallbackArg } from "@app/api/utils/types";
import { ActionError } from "@lib/api-response";
import { APP_URL } from "@lib/constants";
import db from "@lib/db";

export async function fetchUserOAuthTokens(userWithProfile: ApiGptTryCallbackArg) {
  const userOauthTokens = await db.oAuthToken.findMany({
    where: {
      userId: userWithProfile.id,
      service: 'google-oauth',
    },
    select: {
      accessToken: true,
      refreshToken: true,
      primaryEmailAddress: true,
      user: {
        select: {
          email: true,
          profile: true,
        },
      },
    },
    take: 3,
  });

  if (!userOauthTokens || !userOauthTokens.length) {
    throw new ActionError('error', 400, `User has not connected Google Calendar. Suggest user to visit ${APP_URL} to setup Google Calendar`);
  }

  return userOauthTokens;
}