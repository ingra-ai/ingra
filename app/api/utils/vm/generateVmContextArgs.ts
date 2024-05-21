import { AuthSessionResponse } from "@app/auth/session";
import { Logger } from "@lib/logger";
import { FunctionArgument } from "@prisma/client";

export type VmContextArgs = {
  userVars: {
    oauthTokens: {
      scope: string;
      tokenType: string;
      service: string;
      idToken: string | null;
      accessToken: string;
      primaryEmailAddress: string;
    }[];
    profile: {
      userName: string;
      timeZone: string;
    };
  };
  [key: string]: any;
};

export function generateVmContextArgs( authSession: AuthSessionResponse, functionArguments: FunctionArgument[], requestArgs: Record<string, any> = {}) {
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

  Logger.withTag('vm').info('Generating VM context args', requestArgs);

  const context: VmContextArgs = {
    userVars: {
      oauthTokens: (authSession.user.oauthTokens || []).map((token) => ({
        scope: token.scope,
        tokenType: token.tokenType,
        service: token.service,
        idToken: token.idToken,
        accessToken: token.accessToken,
        primaryEmailAddress: token.primaryEmailAddress
      })),
      profile: {
        userName: authSession.user.profile?.userName || '',
        timeZone: authSession.user.profile?.timeZone || ''
      },
      ...authSession.user.envVars.reduce((acc, envVar) => {
        acc[envVar.key] = envVar.value;
        return acc;
      }, {} as Record<string, string>)
    },
    ...( requestArgs || {} )
  };

  return context;
}