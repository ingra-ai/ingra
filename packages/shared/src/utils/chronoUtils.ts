import { parseDate as chronoParseDate, parse as chronoParse } from 'chrono-node';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';


/**
 * Parses the start and end inputs into dates and adjusts them to the user's timezone.
 * Throws an error if start and end inputs are not provided or if the date inputs are invalid.
 * Converts the parsed dates to UTC for consistent API querying.
 * If the end date is earlier than the start date, the end date is set to the end of the start date.
 *
 * @param {string} startInput - The start input string. e.g. 'today at 9:00'.
 * @param {string} endInput - The end input string. e.g. 'tomorrow at 10:00'.
 * @param {string} userTz - The user's timezone. e.g. 'America/New_York'.
 * @returns {{ startDate: Date, endDate: Date }} An object containing the parsed and adjusted start and end dates.
 * @throws Error if start and end inputs are not provided or if the date inputs are invalid.
 */
export function parseStartAndEnd(startInput: string, endInput: string, userTz: string) {
  if (!startInput || !endInput) {
    throw new Error('Start and end inputs must be provided.');
  }

  const now = Date.now();

  // Adjust 'now' to the user's timezone
  const referenceDate = toZonedTime(now, userTz);

  let startDate = chronoParseDate(startInput, referenceDate);
  let endDate = chronoParseDate(endInput, referenceDate);

  if (!startDate || !endDate) {
    throw new Error('Invalid date input. Please check your start and end inputs.');
  }

  // Set default times if chrono didn't parse any specific time
  const chronoStart = chronoParse(startInput, referenceDate);
  if (chronoStart && chronoStart[0] && !chronoStart[0].start.isCertain('hour')) {
    startDate.setHours(0, 0, 0, 0);
  }

  const chronoEnd = chronoParse(endInput, referenceDate);
  if (chronoEnd && chronoEnd[0] && !chronoEnd[0].start.isCertain('hour')) {
    endDate.setHours(23, 59, 59, 999);
  }

  // Convert parsed dates to UTC for consistent API querying
  startDate = fromZonedTime(startDate, userTz);
  endDate = fromZonedTime(endDate, userTz);

  if (endDate <= startDate) {
    endDate = new Date(startDate);
    endDate.setUTCHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * Parses a date string and returns a Date object.
 * @param {string} input - The date string to parse.
 * @param {string} userTz - The user's timezone.
 * @returns {Date} The parsed Date object.
 */
export function parseDate(input: string, userTz: string) {
  const now = Date.now();
  const referenceDate = toZonedTime(now, userTz);

  return chronoParseDate(input, referenceDate);
}
