import { NextRequest, NextResponse } from "next/server";
import { getCalendarList } from "@app/api/v1/calendars/actions/getCalendarList";

export async function GET(req: NextRequest, { params }: { params: { paths: string[] } }) {
  if ( !Array.isArray(params.paths) || !params.paths.length ) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Invalid paths`,
        data: params,
      },
      {
        status: 400,
      }
    );
  }

  /**
   * Map the dynamic routes as per google calendar events paths
   * @see https://developers.google.com/calendar/api/v3/reference#Events
   */
  const [calendarId, ...restOfPaths] = params.paths || [],
    uri = '/' + restOfPaths.join('/');

  if ( calendarId !== 'primary' ) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Calendar ID not supported for "${calendarId}"`,
        data: null,
      },
      {
        status: 400,
      }
    );
  }
  
  switch (uri) {
    case '/events':
      // GET: List of all calendar events
      return await getCalendarList(req, calendarId);
    default:
      return NextResponse.json(
        {
          status: 'error',
          message: `Paths not supported for "${uri}"`,
          data: null,
        },
        {
          status: 404,
        }
      );
  }
};
