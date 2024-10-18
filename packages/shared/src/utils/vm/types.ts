import { Prisma } from "@repo/db/prisma";

export interface UserSandboxOutput {
  type: 'log' | 'error' | 'output';
  message: string;
}

export interface MetricSandboxOutput {
  type: 'metric';
  metric: 'executionTime' | 'memoryUsed' | 'apiCallCount';
  value: number;
}

export interface MetricValues {
  [key: string]: number;
}
