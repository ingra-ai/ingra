import { Logger } from "@lib/logger";

// Helper function to read a stream to completion
const readStream = async (stream: ReadableStream): Promise<string> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  result += decoder.decode();
  return result;
};

// Helper function to build query string from parameters
const buildQueryString = (params: Record<string, any>) => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * INTERNAL USE ONLY.
 * Unified function to make HTTP requests using fetch.
 * If the URL contains assistants, it will assume the return type is stream.
 * @param {string} url - The API endpoint URL.
 * @param {string} method - The HTTP method (GET, POST, PUT, PATCH, DELETE).
 * @param {object} [params] - The parameters for GET or the body for other verbs.
 * @param {object} [headers] - Optional additional headers.
 * @returns {Promise<object>} - The JSON response from the server.
 */
export const apiRequest = async (url: string, method: string, params: Record<string, any> = {}, headers: Record<string, any> = {}) => {
  const options: Record<string, any> = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if ( ['GET', 'DELETE'].indexOf( method ) >= 0 ) {
    // Append query parameters to the URL for GET request
    const queryString = buildQueryString(params);
    url += `?${queryString}`;
  }
  else if ( ['POST', 'PUT', 'PATCH'].indexOf( method ) >= 0 ) {
    // Add body as JSON for POST, PUT, PATCH, DELETE requests
    options.body = JSON.stringify(params);
  }

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store'
    });

    if ( !response.ok ) {
      throw new Error(`Failed to run apiRequest with status ${response.status}: ${response.statusText}`);
    }
    if (url.includes('/assistants')) {
      const streamResult = await readStream(response.body as unknown as ReadableStream);
      return JSON.parse(streamResult);
    } else {
      return await response.json();
    }
  } 
  catch (error: any) {
    Logger.withTag('apiRequest').error(`Failed to run fetch: ${ error?.message || 'Unknown Error'}`, { url, method });
    throw error;
  }
};
