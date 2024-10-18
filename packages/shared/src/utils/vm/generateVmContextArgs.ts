import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { Prisma } from '@repo/db/prisma';
import { generateUserVars } from './generateUserVars';

export type VmContextArgs = {
  // Known user variables
  GOOGLE_OAUTH_ACCESS_TOKEN?: string;
  GOOGLE_OAUTH_ID_TOKEN?: string;
  GOOGLE_OAUTH_EMAIL_ADDRESS?: string;
  USER_NAME?: string;
  USER_TIMEZONE?: string;

  // Unknown user variables or environment variables.
  [key: string]: any;
};

type SafeFunctionRecordArgType = Prisma.FunctionGetPayload<{
  select: {
    id: true;
    code: true;
    arguments: true;
  };
}>;

export function generateVmContextArgs(authSession: AuthSessionResponse, safeFunctionRecord: SafeFunctionRecordArgType, requestArgs: Record<string, any> = {}) {
  // Fill requestArgs with default values if not provided.
  const functionArguments = safeFunctionRecord.arguments;
  if (functionArguments && Array.isArray(functionArguments) && functionArguments.length > 0) {
    for (const arg of functionArguments) {
      if (requestArgs?.[arg.name] === undefined || requestArgs?.[arg.name] === '' || requestArgs?.[arg.name] === null) {
        if ((typeof arg.defaultValue === 'string' && arg.defaultValue.length) || (typeof arg.defaultValue === 'number' && !isNaN(arg.defaultValue))) {
          requestArgs[arg.name] = arg.defaultValue;
        }
      }
    }
  }

  /**
   * This is passed as `handle(ctx)` to the vm.runInContext function.
   * It currently includes the following:
   * - User variables - Google OAuth tokens, User name, Timezone
   * - Environment variables - User defined environment variables from settings
   * - Current Request arguments - Arguments passed to the function in a form of an object from the request body or URL query params.
   */
  const context: VmContextArgs = {
    ...generateUserVars(authSession),

    ...authSession.user.envVars.reduce(
      (acc, envVar) => {
        acc[envVar.key] = envVar.value;
        return acc;
      },
      {} as Record<string, string>
    ),

    ...(requestArgs || {}),
  };

  return context;
}
