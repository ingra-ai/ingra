import { generateVmContextArgs } from "@app/api/utils/vm/generateVmContextArgs";
import { run } from "@app/api/utils/vm/run";
import { MetricSandboxOutput, UserSandboxOutput } from "@app/api/utils/vm/types";
import { AuthSessionResponse } from "@app/auth/session/types";
import { Prisma } from '@prisma/client';
import { ActionError } from "@v1/types/api-response";

type RunUserFunctionArgType = Prisma.FunctionGetPayload<{
  select: {
    id: true,
    code: true,
    arguments: true,
  }
}>;

type MetricValues = {
  [key in MetricSandboxOutput['metric']]: number;
};

export const runUserFunction = async (authSession: AuthSessionResponse, functionRecord: RunUserFunctionArgType, requestArgs: Record<string, any> = {}) => {
  if ( !authSession ) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  if ( !functionRecord ) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  if (typeof requestArgs !== 'object') {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  const vmContext = generateVmContextArgs(authSession, functionRecord.arguments, requestArgs);

  const vmOutput = await run(functionRecord.code, vmContext);

  const errors = vmOutput.outputs.filter(output => output.type === 'error') as UserSandboxOutput[],
    metrics = ((vmOutput.outputs || []).filter(output => output.type === 'metric') as MetricSandboxOutput[]).reduce<Partial<MetricValues>>((acc, metric) => {
      return { ...acc, [metric.metric]: metric.value };
    }, {});

  return {
    result: vmOutput?.result,
    metrics,
    errors,
  }
};
