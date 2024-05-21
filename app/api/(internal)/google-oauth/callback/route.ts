'use server';
import { NextRequest, NextResponse } from 'next/server';
import { ActionError, ApiError, ApiSuccess } from '@v1/types/api-response';
import { APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_GOOGLE_OAUTH_CALLBACK_URL, APP_GOOGLE_OAUTH_REDIRECT_URL } from '@lib/constants';
import { google } from 'googleapis';
import { RedirectType, redirect } from 'next/navigation';
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
      scope: [
        // Basic profile information, to identify the user
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    
        // Full access to Google Calendar, to manage events and settings
        'https://www.googleapis.com/auth/calendar',
    
        // Access to Google Contacts, to view and manage contacts
        'https://www.googleapis.com/auth/contacts',
    
        // Read, compose, send, and permanently delete all your email from Gmail
        'https://mail.google.com/',

        // Manage drafts and send emails when you interact with the add-on
        // 'https://www.googleapis.com/auth/gmail.addons.current.action.compose',

        // View your email messages when you interact with the add-on
        // 'https://www.googleapis.com/auth/gmail.addons.current.message.action',

        // View your email message metadata when the add-on is running
        // 'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',

        // View your email messages when the add-on is running
        // 'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',

        // Manage drafts and send emails
        'https://www.googleapis.com/auth/gmail.compose',

        // Add emails into your Gmail mailbox
        'https://www.googleapis.com/auth/gmail.insert',

        // See and edit your email labels
        'https://www.googleapis.com/auth/gmail.labels',

        // View your email message metadata such as labels and headers, but not the email body
        // Be careful with https://stackoverflow.com/questions/48698070/gmail-api-metadata-scope-does-not-support-q-parameter
        // 'https://www.googleapis.com/auth/gmail.metadata',

        // Read, compose, and send emails from your Gmail account
        'https://www.googleapis.com/auth/gmail.modify',

        // View your email messages and settings
        'https://www.googleapis.com/auth/gmail.readonly',

        // Send email on your behalf
        'https://www.googleapis.com/auth/gmail.send',

        // See, edit, create, or change your email settings and filters in Gmail
        'https://www.googleapis.com/auth/gmail.settings.basic',

        // Manage your sensitive mail settings, including who can manage your mail
        // 'https://www.googleapis.com/auth/gmail.settings.sharing',

        // Full access to Google Drive, to view, edit, and organize drive files
        'https://www.googleapis.com/auth/drive',
    
        // View and manage Google Drive files and folders that you have opened or created with this app
        'https://www.googleapis.com/auth/drive.file',
    
        // View Google Drive files and folders that are shared with you
        'https://www.googleapis.com/auth/drive.readonly',
    
        // Access to Google Sheets, to view and manage sheets
        'https://www.googleapis.com/auth/spreadsheets',
    
        // Read-only access to Google Sheets
        'https://www.googleapis.com/auth/spreadsheets.readonly',
    
        // Access to user's contacts via the People API, to view and manage the contacts
        'https://www.googleapis.com/auth/contacts',
    
        // Access to view your contacts, their photos, and the people most important to you
        'https://www.googleapis.com/auth/contacts.readonly'
      ],
    });

    return redirect(authUrl, RedirectType.push);
  } else if (code && scope) {

    return await apiTryCatch<any>(async () => {
      const [authSession, tokenResponse] = await Promise.all([getAuthSession(), oauth2Client.getToken(code)]);

      if (authSession === null) {
        throw new ActionError('error', 404, 'User session not found');
      }

      if (tokenResponse === null) {
        throw new ActionError('error', 400, 'Invalid token response');
      }

      const { tokens } = tokenResponse;

      const credentials: Partial<typeof tokens> = {
        access_token: tokens.access_token,
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
        throw new ActionError('error', 400, 'Profile not found');
      }

      const primaryEmailAddress = (profile.data.emailAddresses || [])?.find((email) => email?.metadata?.primary === true);

      if (!primaryEmailAddress || !primaryEmailAddress.value) {
        throw new ActionError('error', 400, 'Primary email address not found');
      }

      if (!tokens.access_token) {
        throw new ActionError('error', 400, 'Invalid token response');
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
          },
        },
        create: {
          userId: authSession.user.id,
          primaryEmailAddress: primaryEmailAddress.value || '',
          service: 'google-oauth',
          accessToken: tokens.access_token || '',
          refreshToken: tokens.refresh_token || '',
          idToken: tokens.id_token || '',
          scope: tokens.scope || '',
          tokenType: tokens.token_type || '',
          expiryDate: new Date(tokens.expiry_date || 0),
        },
        update: updateData,
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
      status: 400,
    }
  );
}