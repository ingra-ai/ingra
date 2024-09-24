export type UserSandboxOutput = {
  type: 'log' | 'error' | 'output';
  message: string;
};

export type MetricSandboxOutput = {
  type: 'metric';
  metric: 'executionTime' | 'memoryUsed' | 'apiCallCount';
  value: number;
};

export type MetricValues = {
  [key in MetricSandboxOutput['metric']]: number;
};

export type SandboxOutput = UserSandboxOutput | MetricSandboxOutput;
