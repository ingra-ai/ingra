'use server';
import { Prisma } from '@repo/db/prisma';
import { generateVmContextArgs } from '../../vm/generateVmContextArgs';
import { run } from '../../vm/run';
import { MetricSandboxOutput, MetricValues, UserSandboxOutput } from '../../vm/types';
import { AuthSessionResponse } from '../../../data/auth/session/types';
import { ActionError } from '../../../types/api-response';

type RunUserFunctionArgType = Prisma.FunctionGetPayload<{
  select: {
    id: true;
    code: true;
    arguments: true;
  };
}>;

export const runUserFunction = async (authSession: AuthSessionResponse, functionRecord: RunUserFunctionArgType, requestArgs: Record<string, any> = {}) => {
  if (!authSession) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  if (!functionRecord) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  if (typeof requestArgs !== 'object') {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  const vmContext = generateVmContextArgs(authSession, functionRecord.arguments, requestArgs);

  const vmOutput = await run(functionRecord.code, vmContext);

  const errors = vmOutput.outputs.filter((output) => output.type === 'error') as UserSandboxOutput[],
    logs = vmOutput.outputs.filter((output) => output.type === 'log') as UserSandboxOutput[],
    metrics = ((vmOutput.outputs || []).filter((output) => output.type === 'metric') as MetricSandboxOutput[]).reduce<Partial<MetricValues>>((acc, metric) => {
      return { ...acc, [metric.metric]: metric.value };
    }, {});

  return {
    result: vmOutput?.result,
    metrics,
    errors,
    logs,
  };
};
