import { ApiSuccess } from '@v1/types/api-response';
import { APP_GOOGLE_OAUTH_CALLBACK_URL, APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET } from '@lib/constants';
import db from '@lib/db';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Logger } from '@lib/logger';
import { deleteAllUserCaches } from '@lib/db/extensions/redis';

export async function googleOAuthRefresh() {
  const _startMs = Date.now();

  const allOAuthTokens = await db.oAuthToken.findMany({
    where: {
      service: 'google-oauth',
      refreshToken: {
        not: null,
      },
    },
  });

  if (!allOAuthTokens || !allOAuthTokens.length) {
    return NextResponse.json(
      {
        status: 'success',
        message: `No tokens to refresh`,
        data: {
          total: 0,
          success: 0,
          failed: 0,
          durationMs: Date.now() - _startMs,
        },
      } as ApiSuccess<any>,
      {
        status: 200,
      }
    );
  }

  const refreshOperationsPromises = allOAuthTokens.map(async (oauthToken) => {
    const recordId = oauthToken.id;
    const oauth2Client = new google.auth.OAuth2(
      APP_GOOGLE_OAUTH_CLIENT_ID,
      APP_GOOGLE_OAUTH_CLIENT_SECRET,
      APP_GOOGLE_OAUTH_CALLBACK_URL // e.g., http://localhost:3000/api/auth/google-oauth/callback
    );

    oauth2Client.setCredentials({
      access_token: oauthToken.accessToken,
      refresh_token: oauthToken.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken().catch((err) => {
      Logger.withTag('googleOAuthRefresh').error('Error refreshing token: ' + err);
      return {
        credentials: {
          access_token: null,
          expiry_date: null,
        },
      };
    });

    if (credentials.access_token) {
      // Delete kv caches for this user
      deleteAllUserCaches(oauthToken.userId);

      return db.oAuthToken.update({
        where: {
          id: recordId,
        },
        data: {
          accessToken: credentials.access_token,
          expiryDate: new Date(credentials.expiry_date || Date.now()),
          lastRefreshedAt: new Date(),
        },
      });
    }

    return false;
  });

  const refreshOperations = await Promise.all(refreshOperationsPromises),
    totalRefreshOperations = refreshOperations.length,
    totalFalsey = refreshOperations.filter((op) => op === false).length;

  return NextResponse.json(
    {
      status: 'success',
      message: `Successfully refreshed ${totalRefreshOperations - totalFalsey} token(s)`,
      data: {
        total: totalRefreshOperations,
        success: totalRefreshOperations - totalFalsey,
        failed: totalFalsey,
        durationMs: Date.now() - _startMs,
      },
    } as ApiSuccess<any>,
    {
      status: 200,
    }
  );
}
