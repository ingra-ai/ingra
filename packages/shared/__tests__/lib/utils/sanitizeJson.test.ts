import { describe, it, expect } from 'vitest';
import { sanitizeJson } from '@repo/shared/lib/utils/sanitizeJson';

describe('sanitizeJson', () => {
  it('should sanitize a nested JSON object by replacing values with their types', () => {
    const input = {
      bodyData: `{
        "fields": {
          "summary": "Integrate Cache Manager for Data-Alchemy Publishing Actions",
          "description": "Integrate the Cache Manager to trigger on publishing actions within Data-Alchemy for each content type (e.g., Tutorials, Lister, Masterclass). This will involve sending requests to clear specific cache tags and revalidate paths, ensuring content is up-to-date across services.",
          "issuetype": { "name": "Story" },
          "project": { "key": "MP" }
        }
      }`,
      issueType: 'Story',
      projectKey: 'MP',
    };

    const expectedOutput = {
      bodyData: "{\"fields\":{\"summary\":\"string\",\"description\":\"string\",\"issuetype\":{\"name\":\"string\"},\"project\":{\"key\":\"string\"}}}",
      issueType: 'string',
      projectKey: 'string',
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should handle arrays and deeply nested objects', () => {
    const input = {
      arrayField: [
        { key1: 'value1', key2: 42 },
        { key1: 'value2', key2: false },
      ],
      nestedField: {
        level1: {
          level2: {
            level3: 'deepValue',
          },
        },
      },
    };

    const expectedOutput = {
      arrayField: [
        { key1: 'string', key2: 'number' },
        { key1: 'string', key2: 'boolean' },
      ],
      nestedField: {
        level1: {
          level2: {
            level3: 'string',
          },
        },
      },
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should return primitive values unchanged', () => {
    expect(sanitizeJson('string')).toBe('string');
    expect(sanitizeJson(42)).toBe('number');
    expect(sanitizeJson(null)).toBe('object');
    expect(sanitizeJson(undefined)).toBe('undefined');
    expect(sanitizeJson(true)).toBe('boolean');
  });

  it('should sanitize strings containing valid JSON structures', () => {
    const input = {
      body: '{"key1":"value1","key2":42,"nested":{"key3":"value3"}}',
    };

    const expectedOutput = {
      body: '{"key1":"string","key2":"number","nested":{"key3":"string"}}',
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should handle invalid JSON strings gracefully', () => {
    const input = {
      invalidJson: '{"key1": "value1", "key2": 42, "key3": ',
    };

    const expectedOutput = {
      invalidJson: 'string', // Invalid JSON remains as 'string'
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should sanitize deeply nested JSON strings within strings', () => {
    const input = {
      body: `{
        "nestedString": "{\\"key1\\":\\"value1\\",\\"key2\\":42,\\"nested\\":{\\"key3\\":\\"value3\\"}}"
      }`,
    };

    const expectedOutput = {
      body: "{\"nestedString\":\"{\\\"key1\\\":\\\"string\\\",\\\"key2\\\":\\\"number\\\",\\\"nested\\\":{\\\"key3\\\":\\\"string\\\"}}\"}",
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should handle mixed types within an array', () => {
    const input = {
      mixedArray: ['string', 42, false, { key: 'value' }, '{"key":"value"}'],
    };

    const expectedOutput = {
      mixedArray: ['string', 'number', 'boolean', { key: 'string' }, '{"key":"string"}'],
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should handle empty objects and arrays', () => {
    const input = {
      emptyObject: {},
      emptyArray: [],
    };

    const expectedOutput = {
      emptyObject: {},
      emptyArray: [],
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });

  it('should handle special characters in JSON strings', () => {
    const input = {
      jsonString: '{"key":"value with special chars !@#$%^&*()"}',
    };

    const expectedOutput = {
      jsonString: '{"key":"string"}',
    };

    const sanitized = sanitizeJson(input);
    expect(sanitized).toEqual(expectedOutput);
  });
});
