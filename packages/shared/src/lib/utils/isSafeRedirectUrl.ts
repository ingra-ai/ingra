import { HUBS_APP_URL } from '../constants';

export function isSafeRedirectUrl(url: string) {
  try {
    const allowedDomain = 'ingra.ai';
    const parsedUrl = new URL(url, HUBS_APP_URL); // Parse the URL relative to the current domain

    // Check if the hostname ends with the allowed domain, including subdomains
    const isAllowedDomain = parsedUrl.hostname === allowedDomain || parsedUrl.hostname.endsWith(`.${allowedDomain}`);

    // List of potentially dangerous strings or patterns to look for in URLs
    const maliciousPatterns = [
      'javascript:', // Prevent JavaScript injection
      'data:', // Prevent data URIs that could contain scripts
      '<script>', // Prevent script tags
      '%3Cscript%3E', // Encoded <script> tag
      'vbscript:', // Prevent VBScript
      // '//', // Prevent protocol-relative URLs
      '..', // Prevent directory traversal
      '\\', // Prevent backslashes used in file paths
    ];

    // Check if the URL contains any malicious patterns
    const isMalicious = maliciousPatterns.some((pattern) => url.toLowerCase().includes(pattern));

    return isAllowedDomain && !isMalicious;
  } catch (e) {
    // If URL parsing fails (invalid URL), consider it unsafe
    return false;
  }
}
