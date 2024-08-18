import { Logger } from "@lib/logger";

// Helper function to build query string from parameters
const buildQueryString = (params: Record<string, any>) => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * INTERNAL USE ONLY.
 * Unified function to make HTTP requests using fetch.
 * @param {string} url - The API endpoint URL.
 * @param {string} method - The HTTP method (GET, POST, PUT, PATCH, DELETE).
 * @param {object} [params] - The parameters for GET or the body for other verbs.
 * @param {object} [headers] - Optional additional headers.
 * @returns {Promise<object>} - The JSON response from the server.
 */
export const handleFetch = async (url: string, method: string, params: Record<string, any> = {}, headers: Record<string, any> = {}) => {
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
  else {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store'
    });

    if ( !response.ok ) {
      throw new Error(`Failed to run handleFetch with status ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } 
  catch (error: any) {
    Logger.withTag('handleFetch').error(`Failed to run fetch: ${ error?.message || 'Unknown Error'}`, { url, method });
    throw error;
  }
};
