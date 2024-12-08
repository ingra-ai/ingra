export function isSafeRedirectUrl(url: string) {
  try {
    const allowedDomains = [
      /^(?:(hubs|chat|docs|auth)\.)?ingra\.ai$/, 
      /^(www|chat)\.openai\.com$/, 
      /^localhost:(300[0-5])$/, // Accept localhost with ports 3000 to 3005
    ]; // Add more allowed domains as needed
    const parsedUrl = new URL(url); // Parse the URL relative to the current domain

    // If failing to parse, return false
    if (!parsedUrl.host) {
      return false;
    }

    // Check if the host matches any of the allowed domains, including subdomains
    // ✅ E.g. host example value - 'subdomain.ingra.ai', 'ingra.ai', 'localhost:3000'
    // E.g. hostname value - 'subdomain.ingra.ai', 'ingra.ai', 'localhost'
    const isAllowedDomain = allowedDomains.some((allowedDomain) => {
      return allowedDomain.test(parsedUrl.host);
    });

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
    const isMalicious = maliciousPatterns.some((pattern) => url.toString().includes(pattern));

    return isAllowedDomain && !isMalicious;
  } catch (e) {
    // If URL parsing fails (invalid URL), consider it unsafe
    return false;
  }
}
