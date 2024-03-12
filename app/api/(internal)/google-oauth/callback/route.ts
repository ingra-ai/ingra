"use server";
import { NextRequest, NextResponse } from 'next/server';
import { ActionError, ApiError, ApiSuccess } from '@lib/api-response';
import { APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_GOOGLE_OAUTH_CALLBACK_URL, APP_GOOGLE_OAUTH_REDIRECT_URL } from "@lib/constants";
import { google } from 'googleapis';
import { RedirectType, redirect } from "next/navigation";
import db from '@lib/db';
import { getAuthSession } from '@app/auth/session';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '';
  const code = searchParams.get('code') || '';
  const scope = searchParams.get('scope') || '';

  const oauth2Client = new google.auth.OAuth2(
    APP_GOOGLE_OAUTH_CLIENT_ID,
    APP_GOOGLE_OAUTH_CLIENT_SECRET,
    APP_GOOGLE_OAUTH_CALLBACK_URL // e.g., http://localhost:3000/api/auth/google-oauth/callback
  );

  if (type === 'redirect') {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',

      /**
       * @see https://developers.google.com/calendar/api/auth#calendar-api-scopes
       */
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar',

        // See and download any calendar you can access using your Calendar.
        // 'https://www.googleapis.com/auth/calendar.readonly',

        // View and edit events on all your calendars.
        // 'https://www.googleapis.com/auth/calendar.events',

        // View events on all your calendars.
        // 'https://www.googleapis.com/auth/calendar.events.readonly',

        // View your Calendar settings.
        // 'https://www.googleapis.com/auth/calendar.settings.readonly',

        // Run as a Calendar add-on.
        // 'https://www.googleapis.com/auth/calendar.addons.execute',
      ],
    });

    return redirect(authUrl, RedirectType.push);
  }
  else if (code && scope) {
    return await apiTryCatch<any>(async () => {
      const [authSession, tokenResponse] = await Promise.all([
        getAuthSession(),
        oauth2Client.getToken(code)
      ]);

      if (authSession === null) {
        throw new ActionError("error", 404, "User session not found");
      }

      if (tokenResponse === null) {
        throw new ActionError("error", 400, "Invalid token response");
      }

      const { tokens } = tokenResponse;

      const credentials: Partial<typeof tokens> = {
        access_token: tokens.access_token
      };

      if (tokens.refresh_token) {
        credentials.refresh_token = tokens.refresh_token;
      }

      oauth2Client.setCredentials(credentials);

      const peopleService = google.people({ version: 'v1', auth: oauth2Client }),
        profile = await peopleService.people.get({
          resourceName: 'people/me',
          personFields: 'emailAddresses',
        });

      if (!profile || !profile.data) {
        throw new ActionError("error", 400, "Profile not found");
      }

      const primaryEmailAddress = (profile.data.emailAddresses || [])?.find(email => email?.metadata?.primary === true);

      if (!primaryEmailAddress || !primaryEmailAddress.value) {
        throw new ActionError("error", 400, "Primary email address not found");
      }

      if (!tokens.access_token) {
        throw new ActionError("error", 400, "Invalid token response")
      }

      const updateData: Record<string, any> = {
        accessToken: tokens.access_token || '',
        scope: tokens.scope || '',
        tokenType: tokens.token_type || '',
        expiryDate: new Date(tokens.expiry_date || 0),
      };

      // Only add refreshToken to updateData if tokens.refresh_token is not empty
      if (tokens.refresh_token) {
        updateData.refreshToken = tokens.refresh_token;
      }

      const oauthToken = await db.oAuthToken.upsert({
        where: {
          userId_primaryEmailAddress: {
            userId: authSession.user.id,
            primaryEmailAddress: primaryEmailAddress.value,
          }
        },
        create: {
          userId: authSession.user.id,
          primaryEmailAddress: primaryEmailAddress.value || '',
          service: 'google-oauth',
          accessToken: tokens.access_token || '',
          refreshToken: tokens.refresh_token || '',
          scope: tokens.scope || '',
          tokenType: tokens.token_type || '',
          expiryDate: new Date(tokens.expiry_date || 0),
        },
        update: updateData
      });

      const redirectUrl = new URL(APP_GOOGLE_OAUTH_REDIRECT_URL);
      redirectUrl.searchParams.append('ref', oauthToken.id);

      return NextResponse.redirect(redirectUrl);
    });
  }

  return NextResponse.json(
    {
      status: 403,
      code: 'FORBIDDEN',
      message: 'You are not authorized to access this resource',
    } as ApiError,
    {
      status: 400
    }
  );
};
