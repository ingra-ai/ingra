import { parseDate } from 'chrono-node';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export function parseStartAndEnd(startInput: string, endInput: string, userTz: string) {
  if (!startInput || !endInput) {
    throw new Error('Start and end inputs must be provided.');
  }

  const now = Date.now();

  // Adjust 'now' to the user's timezone
  const referenceDate = utcToZonedTime(now, userTz);

  let startDate = parseDate(startInput, referenceDate, { forwardDate: true });
  let endDate = parseDate(endInput, referenceDate, { forwardDate: true });

  if (!startDate || !endDate) {
    throw new Error('Invalid date input. Please check your start and end inputs.');
  }

  // Convert parsed dates to UTC for consistent API querying
  startDate = zonedTimeToUtc(startDate, userTz);
  endDate = zonedTimeToUtc(endDate, userTz);

  if (endDate <= startDate) {
    endDate = new Date(startDate);
    endDate.setUTCHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}
