import { type NextRequest, userAgent } from 'next/server';

export function getAnalyticsObject(req: NextRequest) {
  const { device, browser, os, cpu, engine } = userAgent(req);
  return {
    ip: req.headers.get('x-real-ip') || req.ip,
    $browser: browser?.name || 'N/A',
    $device: device?.type || 'N/A',
    $os: os?.name || 'N/A',
    $cpu: cpu?.architecture || 'N/A',
    $engine: engine?.name || 'N/A',
  };
}
