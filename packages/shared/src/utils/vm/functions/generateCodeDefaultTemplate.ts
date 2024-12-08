import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { CODE_DEFAULT_TEMPLATE } from '@repo/shared/schemas/function';
import { generateUserVars } from '../generateUserVars';

// Overloaded function signatures
export function generateCodeDefaultTemplate(allUserAndEnvKeys: string[]): string;
export function generateCodeDefaultTemplate(authSession: Pick<AuthSessionResponse, 'user'>): string;

// Function implementation
export function generateCodeDefaultTemplate(param: string[] | Pick<AuthSessionResponse, 'user'>): string {
  if (Array.isArray(param)) {
    const allUserAndEnvKeys = param;
    if (!allUserAndEnvKeys.length) return CODE_DEFAULT_TEMPLATE;

    return CODE_DEFAULT_TEMPLATE.replace(
      'console.log({ ctx });',
      `
         const { ${allUserAndEnvKeys.join(', ')}, ...requestArgs } = ctx;
      `.trim()
    );
  } 
  else {
    const authSession = param;

    if (!authSession?.user?.envVars?.length) {
      return generateCodeDefaultTemplate([]);
    }

    const optionalEnvVars = authSession.user.envVars.map((envVar) => ({
      id: envVar.id,
      ownerUserId: envVar.ownerUserId,
      key: envVar.key,
      value: envVar.value,
    }));

    const userVarsRecord = generateUserVars(authSession),
      allUserAndEnvKeys = Object.keys(userVarsRecord).concat(optionalEnvVars.map((envVar) => envVar.key));

    return generateCodeDefaultTemplate(allUserAndEnvKeys);
  }
}
