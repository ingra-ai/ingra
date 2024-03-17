import { ApiCalendarEvent, ApiCalendarEventAttendee } from '@app/api/types/calendar';
import { type calendar_v3 } from 'googleapis/build/src/apis/calendar/v3';
import { formatDistance } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

export const mapGoogleCalendarEvent = (event: calendar_v3.Schema$Event, timeZone: string): ApiCalendarEvent => {
  // Extracting necessary information
  const { summary, start, end, htmlLink, reminders, attendees, location, creator, organizer } = event;

  // Formatting dates
  const startDate = start?.dateTime ? utcToZonedTime(new Date(start.dateTime), timeZone) : null;
  const endDate = end?.dateTime ? utcToZonedTime(new Date(end.dateTime), timeZone) : null;

  // Formatting dates with timezone
  const formattedStartDate = startDate ? format(startDate, 'eeee, MMMM d, yyyy, h:mm a zzz', { timeZone }) : null;
  const formattedEndDate = endDate ? format(endDate, 'eeee, MMMM d, yyyy, h:mm a zzz', { timeZone }) : null;

  // Creating a readable reminder summary
  const reminderSummary = (reminders?.overrides || []).map((reminder) => `${reminder.method} ${reminder.minutes} minutes before`).join(', ');

  // Generate friendly duration with date-fns
  const duration = startDate && endDate ? formatDistance(startDate, endDate) : null;

  // Generate friendly attendees list
  const attendeeList = (attendees || []).map((attendee) => {
    const { email, displayName } = attendee;
    return {
      email: email || 'N/A',
      displayName: displayName || 'N/A',
    } as ApiCalendarEventAttendee;
  });

  return {
    title: summary || 'N/A',
    creator: creator?.self ? 'me' : creator?.email || 'N/A',
    organizer: organizer?.self ? 'me' : organizer?.email || 'N/A',
    startDateTime: formattedStartDate || 'N/A',
    endDateTime: formattedEndDate || 'N/A',
    duration: duration || 'N/A',
    location: location || 'N/A',
    link: htmlLink || 'N/A',
    reminder: reminderSummary || 'N/A',
    attendees: attendeeList,
  };
};
