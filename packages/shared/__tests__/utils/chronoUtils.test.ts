import { parseStartAndEnd } from '@repo/shared/utils/chronoUtils';

describe('parseStartAndEnd', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should parse start and end dates correctly in UTC timezone', () => {
    const machineDateNow = new Date('2022-01-01T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'tomorrow 0:00';
    const endInput = 'tomorrow 23:59';
    const userTz = 'UTC';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-02T00:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-02T23:59:00.000Z');
  });

  it('should parse start and end dates correctly in AEST timezone when current date is 2022-01-03', () => {
    const machineDateNow = new Date('2022-01-03T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'tomorrow 0:00';
    const endInput = 'tomorrow 23:59';
    const userTz = 'Australia/Sydney';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-03T13:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-04T12:59:00.000Z');
  });

  it('should parse start and end dates correctly in AEST timezone when startInput is 2022-01-01 and endInput is 2022-01-02', () => {
    const machineDateNow = new Date('2022-01-03T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = '2022-01-01';
    const endInput = '2022-01-02';
    const userTz = 'Australia/Sydney';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-01T01:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-02T01:00:00.000Z');
  });

  it('should parse start and end dates correctly in UTC timezone with natural language input', () => {
    const machineDateNow = new Date('2022-01-01T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'tomorrow at 9am';
    const endInput = 'tomorrow at 5pm';
    const userTz = 'UTC';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-02T09:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-02T17:00:00.000Z');
  });

  it('should parse start and end dates correctly in AEST timezone with natural language input when current date is 2022-01-03', () => {
    const machineDateNow = new Date('2022-01-03T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'tomorrow at 9am';
    const endInput = 'tomorrow at 5pm';
    const userTz = 'Australia/Sydney';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-03T22:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-04T06:00:00.000Z');
  });

  it('should parse start and end dates correctly in AEST timezone with natural language input when startInput is "next week" and endInput is "next week + 1 day"', () => {
    const machineDateNow = new Date('2022-01-03T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'next week';
    const endInput = 'next week + 1 day';
    const userTz = 'Australia/Sydney';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-10T00:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-11T00:00:00.000Z');
  });

  it('should parse start and end dates correctly in AEST timezone with natural language input when startInput is "in 2 weeks" and endInput is "in 3 weeks"', () => {
    const machineDateNow = new Date('2022-01-03T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'in 2 weeks';
    const endInput = 'in 3 weeks';
    const userTz = 'Australia/Sydney';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2022-01-17T00:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2022-01-24T00:00:00.000Z');
  });

  it('should parse start and end dates correctly in AEST timezone with natural language input when startInput is "today at 00:00" and endInput is "today at 23:59"', () => {
    const machineDateNow = new Date('2024-05-17T11:25:28.918Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(machineDateNow);

    const startInput = 'today at 00:00';
    const endInput = 'today at 23:59';
    const userTz = 'Australia/Sydney';

    const result = parseStartAndEnd(startInput, endInput, userTz);

    expect(result.startDate.toISOString()).toBe('2024-05-16T14:00:00.000Z');
    expect(result.endDate.toISOString()).toBe('2024-05-17T13:59:00.000Z');
  });
});
