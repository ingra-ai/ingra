import { AuthSessionResponse } from "@app/auth/session";

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

export function generateVmContextArgs( authSession: AuthSessionResponse, otherArgs?: Record<string, any>) {
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
      }
    },
    ...( otherArgs || {} )
  };

  return context;
}