import { parseDate as chronoParseDate } from "chrono-node";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

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
export function parseStartAndEnd(
  startInput: string,
  endInput: string,
  userTz: string,
) {
  if (!startInput || !endInput) {
    throw new Error("Start and end inputs must be provided.");
  }

  const now = Date.now();

  // Adjust 'now' to the user's timezone
  const referenceDate = utcToZonedTime(now, userTz);

  let startDate = chronoParseDate(startInput, referenceDate, {
    forwardDate: true,
  });
  let endDate = chronoParseDate(endInput, referenceDate, { forwardDate: true });

  if (!startDate || !endDate) {
    throw new Error(
      "Invalid date input. Please check your start and end inputs.",
    );
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

/**
 * Parses a date string and returns a Date object.
 * @param {string} input - The date string to parse.
 * @param {string} userTz - The user's timezone.
 * @returns {Date} The parsed Date object.
 */
export function parseDate(input: string, userTz: string) {
  const now = Date.now();
  const referenceDate = utcToZonedTime(now, userTz);

  return chronoParseDate(input, referenceDate, { forwardDate: true });
}
