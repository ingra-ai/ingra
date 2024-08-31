import { generateVmContextArgs } from '@repo/shared/utils/vm/generateVmContextArgs';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { FunctionArgument } from '@repo/db/prisma';
import { mockAuthSession } from '@/__tests__/__mocks__/mockAuthSession';
import { mockFunctionHelloWorld } from '@/__tests__/__mocks__/mockFunctions';

describe('generateVmContextArgs', () => {
  const authSession = mockAuthSession as unknown as AuthSessionResponse;
  const mockFunctionArguments: FunctionArgument[] = mockFunctionHelloWorld.arguments as unknown as FunctionArgument[];

  it('should generate the context with default values', () => {
    const context = generateVmContextArgs(authSession, mockFunctionArguments, {
      arg1: 'Passed Argument #1',
      arg2: 5,
    });

    expect(context).toEqual({
      ATLASSIAN_API_KEY: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      ATLASSIAN_EMAIL: 'john.doe@ingra.ai',
      ATLASSIAN_HOST: 'ingra.atlassian.net',
      GITHUB_ACCESS_TOKEN: 'bjs_w8asd9sa8d7A89S7DA98CUA1as87d6a7sd6ac9',
      GOOGLE_OAUTH_ACCESS_TOKEN: '<MOCK_ACCESS_TOKEN>',
      GOOGLE_OAUTH_EMAIL_ADDRESS: 'john.doe@ingra.ai',
      GOOGLE_OAUTH_ID_TOKEN: '<MOCK_ID_TOKEN>',
      PRODUCTIVE_API_KEY: '10000000-1234-1234-1234-123456789012',
      PRODUCTIVE_ORG_ID: '11111',
      USER_NAME: 'john.doe',
      USER_TIMEZONE: 'Australia/Sydney',
      arg1: 'Passed Argument #1',
      arg2: 5,
    });
  });

  it('should fill requestArgs with default values if not provided', () => {
    const context = generateVmContextArgs(authSession, mockFunctionArguments, {});

    expect(context).toEqual({
      ATLASSIAN_API_KEY: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      ATLASSIAN_EMAIL: 'john.doe@ingra.ai',
      ATLASSIAN_HOST: 'ingra.atlassian.net',
      GITHUB_ACCESS_TOKEN: 'bjs_w8asd9sa8d7A89S7DA98CUA1as87d6a7sd6ac9',
      GOOGLE_OAUTH_ACCESS_TOKEN: '<MOCK_ACCESS_TOKEN>',
      GOOGLE_OAUTH_EMAIL_ADDRESS: 'john.doe@ingra.ai',
      GOOGLE_OAUTH_ID_TOKEN: '<MOCK_ID_TOKEN>',
      PRODUCTIVE_API_KEY: '10000000-1234-1234-1234-123456789012',
      PRODUCTIVE_ORG_ID: '11111',
      USER_NAME: 'john.doe',
      USER_TIMEZONE: 'Australia/Sydney',
      arg2: '5',
    });
  });
});
