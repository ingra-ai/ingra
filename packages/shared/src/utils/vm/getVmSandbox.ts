import type { VmContextArgs } from "../vm/generateVmContextArgs";
import { parseStartAndEnd, parseDate } from "../chronoUtils";
import nodeFetch, { type RequestInfo, type RequestInit } from "node-fetch";
import { Octokit } from "@octokit/rest";
import * as Cheerio from "cheerio";
import { SandboxOutput } from "./types";

export interface Sandbox {
  console: Pick<typeof console, "log" | "error">;
  handler: ((ctx: VmContextArgs) => Promise<any>) | null;
  fetch: typeof nodeFetch;
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
}

export interface SandboxAnalytics {
  apiCallCount: number;
  outputs: SandboxOutput[];
  [key: string]: any;
}

export const getVmSandbox = (
  ctx: VmContextArgs,
  analytics: SandboxAnalytics,
): Sandbox => {
  const sandbox: Sandbox = {
    console: {
      log: (...args: any[]) => {
        analytics.outputs.push({
          type: "log",
          message: args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
            .join(" "),
        });
      },
      error: (...args: any[]) => {
        analytics.outputs.push({
          type: "error",
          message: args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
            .join(" "),
        });
      },
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => {
      if (!analytics.apiCallCount) analytics.apiCallCount = 0;
      analytics.apiCallCount++;

      return nodeFetch(input, init);
    },
    setTimeout,
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
    handler: null,
  };

  return sandbox;
};
