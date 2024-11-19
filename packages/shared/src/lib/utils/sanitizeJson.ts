export function sanitizeJson(input: any): any {
  if (!input || typeof input !== 'object') {
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        const sanitized = sanitizeJson(parsed);
        return JSON.stringify(sanitized);
      } catch {
        return 'string';
      }
    }

    return typeof input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeJson(item));
  }

  const sanitizedObject: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'object') {
      sanitizedObject[key] = sanitizeJson(value);
    }
    else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        const sanitized = sanitizeJson(parsed);
        sanitizedObject[key] = JSON.stringify(sanitized);
      }
      catch {
        sanitizedObject[key] = 'string';
      }
    }
    else {
      sanitizedObject[key] = typeof value;
    }
  }

  return sanitizedObject;
}