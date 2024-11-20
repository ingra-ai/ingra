import { type NextRequest, userAgent } from 'next/server';

/**
 * Generates an object with analytics data from NextRequest object.
 * @see {@link https://github.com/vercel/vercel/blob/main/packages/functions/src/headers.ts} to understand the NextRequest object.
 * @param {NextRequest} req Next request object.
 * @returns Data for analytics purposes.
 */

export function getAnalyticsObject(req: NextRequest) {
  const { device, browser, os, cpu, engine, isBot } = userAgent(req);

  /**
   * This is currently to complement mixpanel analytics data
   * @see {@link https://github.com/mixpanel/mixpanel-js/blob/v2.46.0/src/mixpanel-core.js#L88-L127} For default config that mixpanel expects.
   */
  return {
    ip: req.headers.get('x-real-ip'),
    isBot: isBot || false,
    $browser: browser?.name || 'N/A',
    $device: device?.type || 'N/A',
    $os: os?.name || 'N/A',
    $cpu: cpu?.architecture || 'N/A',
    $engine: engine?.name || 'N/A',
  };
}
