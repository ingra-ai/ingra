import { NextRequest, NextResponse } from "next/server";
import { calendar_v3, google } from "googleapis";
import { APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_GOOGLE_OAUTH_CALLBACK_URL, APP_URL } from "@lib/constants";
import { Logger } from "@lib/logger";
import { ApiCalendarEventBody, ApiCalendarEventsResponse } from "@app/api/types/calendar";
import { apiGptTryCatch } from "@app/api/utils/apiGptTryCatch";
import { parseStartAndEnd } from "@app/api/utils/chronoUtils";
import { ActionError, ApiSuccess } from "@lib/api-response";
import { mapGoogleCalendarEvent } from "@app/api/v1/calendars/utils/googleEventsMapper";
import { getUserOAuthTokenByUserId } from "@/data/oauthToken";

/**
 * @swagger
 * /api/v1/calendars/primary/events:
 *   get:
 *     summary: Retrieve events list from connected Calendars with filters
 *     operationId: GetCalendarEvents
 *     description: Fetches user's calendar events using a code, with filters for date, search, limit, and sort. Parses dates with chrono-node.
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
 *         default: "today at 0:00"
 *         description: "Start date/time for events, in natural language (e.g., 'today', 'next Monday'). Chrono-node parses it. Default: 'today at 0:00'"
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *         required: false
 *         default: "today at 23:59"
 *         description: "End date/time for events, in natural language (e.g., 'tomorrow', 'next Friday'). Chrono-node parses it. Default: 'today at 23:59'"
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
export async function getCalendarList(req: NextRequest, calendarId = 'primary') {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams);
  const { phraseCode, start = 'today at 0:00', end = 'today at 23:59', q = '', maxResults = '10', orderBy = 'startTime' } = params || {};

  // Clamp maxResults to minimum 0 and maximum 30
  const maxResultsClamped = Math.min(30, Math.max(0, parseInt(maxResults, 10) || 10));

  return await apiGptTryCatch<any>(phraseCode, async (userWithProfile) => {
    const userOauthTokens = await getUserOAuthTokenByUserId(userWithProfile.id);

    if (!userOauthTokens || !userOauthTokens.length) {
      throw new ActionError('error', 400, `User has not connected Google Calendar. Suggest user to visit ${APP_URL} to setup Google Calendar`);
    }

    const userTz = userWithProfile.profile?.timeZone || 'America/New_York';

    const { startDate, endDate } = parseStartAndEnd(start, end, userTz);

    if (!startDate || !endDate) {
      throw new ActionError('error', 400, `Invalid date range "${start}" - "${end}"`);
    }

    // Generate calendar events params
    const eventListParams: calendar_v3.Params$Resource$Events$List = {
      // 'primary' refers to the primary calendar. You can use a different calendar ID if necessary.
      calendarId,

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

      timeZone: userTz,
    };

    if (q?.length) {
      // Search query
      eventListParams.q = q;
    }

    const calendarEventsDataMapPromises = userOauthTokens.map(async (userOAuthToken) => {
      const oauth2Client = new google.auth.OAuth2(
        APP_GOOGLE_OAUTH_CLIENT_ID,
        APP_GOOGLE_OAUTH_CLIENT_SECRET,
        APP_GOOGLE_OAUTH_CALLBACK_URL
      );

      const credentials: Record<string, any> = {
        access_token: userOAuthToken.accessToken,
      };

      if (userOAuthToken.refreshToken) {
        credentials.refresh_token = userOAuthToken.refreshToken;
      }

      oauth2Client.setCredentials(credentials);

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const eventBody = await calendar.events
        .list(eventListParams)
        .then((response) => {
          const data = response?.data || {}, eventBody: ApiCalendarEventBody = {
            summary: data.summary || '',
            description: data.description || '',
            timeZone: data.timeZone || '',
            events: (data.items || []).map((event) => {
              return mapGoogleCalendarEvent(event, data.timeZone || 'UTC');
            }),
          };

          return eventBody;
        })
        .catch((err) => {
          Logger.withTag('/api/v1/calendar/events').error('The API returned an error: ' + err);
          throw new ActionError('error', 500, 'The API returned an error: ' + err.message || 'Unknown error occurred');
        });

      return {
        email: userOAuthToken.primaryEmailAddress,
        eventBody,
      };
    });

    const totalCalendars = calendarEventsDataMapPromises.length;
    const calendarEventsDataMap = await Promise.all(calendarEventsDataMapPromises);

    return NextResponse.json(
      {
        status: 'success',
        message: `Successfully fetched ${totalCalendars} calendar(s)`,
        data: calendarEventsDataMap,
      } as ApiSuccess<ApiCalendarEventsResponse>,
      {
        status: 200,
      }
    );
  });
}
