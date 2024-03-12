import { ApiCalendarEvent, ApiCalendarEventAttendee } from "@app/api/types/calendar"
import { type calendar_v3 } from "googleapis/build/src/apis/calendar/v3"
import { formatDistance } from "date-fns";
import { format, utcToZonedTime } from 'date-fns-tz';

export const mapGoogleCalendarEvent = (event: calendar_v3.Schema$Event): ApiCalendarEvent => {
  // Extracting necessary information
  const { summary, start, end, htmlLink, reminders, attendees, location, creator, organizer } = event;

  // Formatting dates
  const startDate = ( start?.dateTime && start?.timeZone ) ? utcToZonedTime(start.dateTime, start.timeZone) : null;
  const endDate = ( end?.dateTime && end?.timeZone ) ? utcToZonedTime(end.dateTime, end.timeZone) : null;
  
  const formattedStartDate = ( startDate && start?.timeZone ) ? format(startDate, 'eeee, MMMM d, yyyy, h:mm a', { timeZone: start.timeZone }) : null;
  const formattedEndDate =  ( endDate && end?.timeZone ) ? format(endDate, 'h:mm a', { timeZone: end.timeZone }) : null;

  // Creating a readable reminder summary
  const reminderSummary = ( reminders?.overrides || [] ).map(reminder => `${reminder.method} ${reminder.minutes} minutes before`).join(", ");

  // Generate friendly duration with date-fns
  const duration = (startDate && endDate) ? formatDistance(startDate, endDate) : null;

  // Generate friendly attendees list
  const attendeeList = ( attendees || [] ).map(attendee => {
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
    reminder: reminderSummary || "N/A",
    attendees: attendeeList,
  };
};
