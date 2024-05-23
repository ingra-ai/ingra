import { VmContextArgs } from "@app/api/utils/vm/generateVmContextArgs";
import { Logger } from "@lib/logger";
import { FunctionArgument } from "@prisma/client";

export function generateMarketplaceVmArgs( functionArguments: FunctionArgument[], requestArgs: Record<string, any> = {}) {
  const { oauthTokens = '{}', profile = '{}', envVars = '{}', ...restOfRequestArgs } = requestArgs;
  // Fill requestArgs with default values if not provided.
  if (functionArguments) {
    for (const arg of functionArguments) {
      if ( requestArgs?.[arg.name] === undefined || requestArgs?.[arg.name] === '' || requestArgs?.[arg.name] === null ) {
        if ( ( typeof arg.defaultValue === 'string' && arg.defaultValue.length ) || ( typeof arg.defaultValue === 'number' && !isNaN(arg.defaultValue) ) ) {
          requestArgs[arg.name] = arg.defaultValue
        }
      }
    }
  }

  Logger.withTag('marketplace-vm').info('Generating VM context args', requestArgs);

  const context: VmContextArgs = {
    userVars: {
      oauthTokens: JSON.parse(oauthTokens),
      profile: JSON.parse(profile),
      ...JSON.parse(envVars)
    },
    ...( restOfRequestArgs || {} )
  };

  return context;
}
