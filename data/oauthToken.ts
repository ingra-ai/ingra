import db from "@lib/db";

export async function getUserOAuthTokenByUserId(userId: string) {
  if ( !userId || typeof userId !== 'string') {
    return [];
  }

  const userOauthTokens = await db.oAuthToken.findMany({
    where: {
      userId,
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

  return userOauthTokens;
}