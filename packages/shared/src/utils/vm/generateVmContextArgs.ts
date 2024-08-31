import { AuthSessionResponse } from '../../data/auth/session/types';
import { FunctionArgument } from '@repo/db/prisma';
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

export function generateVmContextArgs(authSession: AuthSessionResponse, functionArguments: FunctionArgument[] = [], requestArgs: Record<string, any> = {}) {
  // Fill requestArgs with default values if not provided.
  if (functionArguments && Array.isArray(functionArguments) && functionArguments.length > 0) {
    for (const arg of functionArguments) {
      if (requestArgs?.[arg.name] === undefined || requestArgs?.[arg.name] === '' || requestArgs?.[arg.name] === null) {
        if ((typeof arg.defaultValue === 'string' && arg.defaultValue.length) || (typeof arg.defaultValue === 'number' && !isNaN(arg.defaultValue))) {
          requestArgs[arg.name] = arg.defaultValue;
        }
      }
    }
  }

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
