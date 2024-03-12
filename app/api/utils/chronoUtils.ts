
import { parseDate } from 'chrono-node';

export function parseStartAndEnd(startInput: string, endInput: string) {
  let startDate = parseDate(startInput);
  let endDate = parseDate(endInput);

  return { startDate, endDate };
}