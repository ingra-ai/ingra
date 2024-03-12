
import { parseDate } from 'chrono-node';

export function parseStartAndEnd(startInput: string, endInput: string) {
  // Input validation
  if (!startInput || !endInput) {
    throw new Error('Start and end inputs must be provided.');
  }

  // Using parseDate with the casual option for more flexible natural language parsing
  let startDate = parseDate(startInput, new Date(), { forwardDate: true });
  let endDate = parseDate(endInput, new Date(), { forwardDate: true });

  // Date parsing validity checks
  if (!startDate || !endDate) {
    throw new Error('Invalid date input. Please check your start and end inputs.');
  }

  // Adjust endDate if it's less than or equal to startDate
  if (endDate <= startDate) {
    // Setting endDate to the end of the day of startDate
    endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}