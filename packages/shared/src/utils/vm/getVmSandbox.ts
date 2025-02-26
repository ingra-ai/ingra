import type { VmContextArgs } from '../vm/generateVmContextArgs';
import { parseStartAndEnd, parseDate } from '../chronoUtils';
import nodeFetch, { type RequestInfo, type RequestInit } from 'node-fetch';
import { Octokit } from '@octokit/rest';
import * as Cheerio from 'cheerio';
import { liteClient } from 'algoliasearch/lite';
import { MetricSandboxOutput, UserSandboxOutput } from './types';

export interface Sandbox {
  console: Pick<typeof console, 'log' | 'error'>;
  handler: ((ctx: VmContextArgs) => Promise<any>) | null;
  fetch: typeof nodeFetch;
  URL: typeof URL;
  setTimeout: typeof setTimeout;
  utils: {
    date: {
      parseStartAndEnd: typeof parseStartAndEnd;
      parseDate: typeof parseDate;
    };
  };
  Buffer: typeof Buffer;
  URLSearchParams: typeof URLSearchParams;
  Octokit: typeof Octokit;
  Cheerio: typeof Cheerio;
  algoliaSearchLiteClient: typeof liteClient;
}

export interface SandboxAnalytics {
  apiCallCount: number;
  outputs: (UserSandboxOutput | MetricSandboxOutput)[];
  [key: string]: any;
}

export const getVmSandbox = (ctx: VmContextArgs, analytics: SandboxAnalytics): Sandbox => {
  const sandbox: Sandbox = {
    console: {
      log: (...args: any[]) => {
        analytics.outputs.push({
          type: 'log',
          message: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '),
        });
      },
      error: (...args: any[]) => {
        analytics.outputs.push({
          type: 'error',
          message: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '),
        });
      },
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => {
      if (!analytics.apiCallCount) analytics.apiCallCount = 0;
      analytics.apiCallCount++;

      return nodeFetch(input, init);
    },
    setTimeout,
    URL: URL,
    utils: {
      date: {
        parseStartAndEnd,
        parseDate,
      },
    },
    Buffer,
    URLSearchParams,
    Octokit,
    Cheerio,
    algoliaSearchLiteClient: liteClient,
    handler: null,
  };

  return sandbox;
};
