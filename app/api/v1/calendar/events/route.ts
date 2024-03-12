"use server";
import { NextRequest, NextResponse } from 'next/server';
import { ActionError, type ApiSuccess } from '@lib/api-response';
import { APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_GOOGLE_OAUTH_CALLBACK_URL, APP_URL } from "@lib/constants";
import { type calendar_v3, google } from 'googleapis';
import db from '@lib/db';
import { getUserByPhraseCode } from '@/data/user';
import { Logger } from '@lib/logger';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';
import type { ApiCalendarEventBody, ApiCalendarEventsResponse } from '@app/api/types/calendar';
import { mapGoogleCalendarEvent } from './googleEventsMapper';
import { parseStartAndEnd } from '@app/api/utils/chronoUtils';

/**
 * @swagger
 * /api/v1/calendar/events:
 *   get:
 *     summary: Retrieve events from connected Calendars with filters
 *     operationId: GetCalendarEvents
 *     description: Retrieves events from all Calendars connected by the user based on the provided unique phrase code for authentication. It supports filtering by date range, search query, maximum number of results, and sorting order. The date range can be specified in natural language, which is parsed using the chrono-node library.
 *     parameters:
 *       - in: query
 *         name: phraseCode
 *         schema:
 *           type: string
 *         required: true
 *         description: A unique code used for user authentication and to perform additional validation or actions.
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *         required: false
 *         default: "start of today"
 *         description: "The start date or time of the event retrieval period, specified in natural language. Examples: 'today', 'next Monday', 'in 2 days'. Chrono-node will parse this into the actual start date and time. Default is 'start of today'."
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *         required: false
 *         default: "end of today"
 *         description: "The end date or time of the event retrieval period, specified in natural language. Examples: 'tomorrow', 'next Friday', 'in 5 days'. Chrono-node will parse this into the actual end date and time. If not provided, the system may assume a default duration or end time based on the context. Default is 'end of today'."
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search query to filter the events by their content.
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Maximum number of events to return. Default is 10. Maximum is 20.
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         required: false
 *         default: "startTime"
 *         description: The order of the events returned. Valid values are "startTime" or "updated". Default is "startTime".
 *     responses:
 *       '200':
 *         description: Successfully retrieved events from connected calendars based on the filters applied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request, such as missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Calendar
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = Object.fromEntries( searchParams );
  const { 
    phraseCode,
    start = 'start of today',
    end = 'end of today',
    q = '',
    maxResults = '10',
    orderBy = 'startTime'
  } = params || {};

  // Clamp maxResults to minimum 0 and maximum 30
  const maxResultsClamped = Math.min(30, Math.max(0, parseInt(maxResults, 10) || 10));

  return await apiTryCatch<any>(async () => {
    const userWithProfile = await getUserByPhraseCode(phraseCode);
  
    if ( !userWithProfile ) {
      throw new ActionError("error", 400, "Invalid phrase code");
    }

    const userOauthTokens = await db.oAuthToken.findMany({
      where: {
        userId: userWithProfile.id,
        service: 'google-oauth'
      },
      take: 3
    });

    if ( !userOauthTokens || !userOauthTokens.length ) {
      throw new ActionError("error", 400, `User has not connected Google Calendar. Suggest user to visit ${ APP_URL } to setup Google Calendar`);
    }

    const { startDate, endDate } = parseStartAndEnd(start, end);

    if ( !startDate || !endDate || startDate > endDate ) {
      throw new ActionError("error", 400, `Invalid date range "${ start }" - "${ end }"`);
    }

    // Generate calendar events params
    const eventListParams: calendar_v3.Params$Resource$Events$List = {
      // 'primary' refers to the primary calendar. You can use a different calendar ID if necessary.
      calendarId: 'primary',
      
      // List events starting from now
      timeMin: startDate.toISOString(),
      
      // List events up to 7 days from now
      timeMax: endDate.toISOString(),
      
      // Maximum number of events to return
      maxResults: maxResultsClamped,
      
      // Treat recurring events as individual events
      singleEvents: true,
      
      // Order by start date/time
      orderBy: 'startTime',
    };

    if ( q?.length ) {
      // Search query
      eventListParams.q = q;
    }

    const calendarEventsDataMapPromises = userOauthTokens.map( async (userCalendarOAuthToken) => {
      const oauth2Client = new google.auth.OAuth2(
        APP_GOOGLE_OAUTH_CLIENT_ID,
        APP_GOOGLE_OAUTH_CLIENT_SECRET,
        APP_GOOGLE_OAUTH_CALLBACK_URL // e.g., http://localhost:3000/api/auth/google-oauth/callback
      );

      const credentials: Record<string, any> = {
        access_token: userCalendarOAuthToken.accessToken
      };

      if ( userCalendarOAuthToken.refreshToken ) {
        credentials.refresh_token = userCalendarOAuthToken.refreshToken;
      }

      oauth2Client.setCredentials(credentials);

      const calendar = google.calendar({version: 'v3', auth: oauth2Client});

      const eventBody = await calendar.events.list(eventListParams).then( response => {
        const data = response?.data || {},
          eventBody: ApiCalendarEventBody = {
            summary: data.summary || '',
            description: data.description || '',
            timeZone: data.timeZone || '',
            events: (data.items || []).map( mapGoogleCalendarEvent )
          };

        return eventBody;
      } ).catch((err) => {
        Logger.withTag('/api/v1/calendar/events').error('The API returned an error: ' + err);
        return null;
      });

      return {
        email: userCalendarOAuthToken.primaryEmailAddress,
        eventBody,
      }
    } );

    const totalCalendars = calendarEventsDataMapPromises.length;
    const calendarEventsDataMap = await Promise.all(calendarEventsDataMapPromises);

    return NextResponse.json(
      {
        status: 'success',
        message: `Successfully fetched ${ totalCalendars } calendar(s)`,
        data: calendarEventsDataMap
      } as ApiSuccess<ApiCalendarEventsResponse>,
      {
        status: 200
      }
    );
  } );
};
