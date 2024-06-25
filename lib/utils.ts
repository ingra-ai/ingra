import { type ClassValue, clsx } from 'clsx';
import { type NextRequest, userAgent } from 'next/server';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUuid( value: string ) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
}

export function getAnalyticsObject( req: NextRequest ) {
  const { device, browser, os, cpu, engine  } = userAgent(req);
  return {
    ip: req.headers.get('x-real-ip') || req.ip,
    geo: req.geo || {},
    "$browser": browser?.name || 'N/A',
    "$device": device?.type || 'N/A',
    "$os": os?.name || 'N/A',
    "$cpu": cpu?.architecture || 'N/A',
    "$engine": engine?.name || 'N/A',
  };
}
