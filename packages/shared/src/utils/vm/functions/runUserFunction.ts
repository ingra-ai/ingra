'use server';
import { Prisma } from '@repo/db/prisma';
import { generateVmContextArgs } from '@repo/shared/utils/vm/generateVmContextArgs';
import { run } from '@repo/shared/utils/vm/run';
import { MetricSandboxOutput, MetricValues, UserSandboxOutput } from '@repo/shared/utils/vm/types';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { ActionError } from '@repo/shared/types';

/**
 * Type-safe function record argument type.
 * 
 */
type SafeFunctionRecordArgType = Prisma.FunctionGetPayload<{
  select: {
    id: true;
    code: true;
    arguments: true;
  };
}>;

/**
 * Executes a user-defined function within a virtual machine context.
 *
 * @param {AuthSessionResponse} authSession - The authentication session of the user.
 * @param {SafeFunctionRecordArgType} safeFunctionRecord - The function record that is ensured user has access to.
 * @param {Record<string, any>} [requestArgs={}] - The arguments to be passed to the functions.
 * @returns {Promise<{ result: any, metrics: Partial<MetricValues>, errors: UserSandboxOutput[], logs: UserSandboxOutput[] }>} 
 * An object containing the result of the function execution, metrics, errors, and logs.
 *
 * @throws {ActionError} If the authentication session is invalid, the function record is not found, or the request arguments are invalid.
 */
export const runUserFunction = async (authSession: AuthSessionResponse, safeFunctionRecord: SafeFunctionRecordArgType, requestArgs: Record<string, any> = {}) => {
  if (!authSession) {
    throw new ActionError('error', 401, `Unauthorized session.`);
  }

  if (!safeFunctionRecord) {
    throw new ActionError('error', 400, `Function not found.`);
  }

  if (typeof requestArgs !== 'object') {
    throw new ActionError('error', 400, `Invalid arguments.`);
  }

  const vmContext = generateVmContextArgs(authSession, safeFunctionRecord, requestArgs);

  const vmOutput = await run(safeFunctionRecord.code, vmContext);

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
