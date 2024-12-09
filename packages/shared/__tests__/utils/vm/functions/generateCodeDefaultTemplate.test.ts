import { describe, it, expect } from 'vitest';
import { generateCodeDefaultTemplate } from '@repo/shared/utils/vm/functions/generateCodeDefaultTemplate';
import { AuthSessionResponse } from '@repo/shared/data';
import { CODE_DEFAULT_TEMPLATE } from '@repo/shared/schemas/function';

describe('generateCodeDefaultTemplate', () => {
  it('should return the default template when given an empty array', () => {
    const result = generateCodeDefaultTemplate([]);
    expect(result).toBe(CODE_DEFAULT_TEMPLATE);
  });

  it('should replace console.log with user and env keys', () => {
    const keys = ['USER_KEY', 'ENV_KEY'];
    const result = generateCodeDefaultTemplate(keys);
    expect(result).toContain('const { USER_KEY, ENV_KEY, ...requestArgs } = ctx;');
  });

  it('should return the default template when authSession has no envVars', () => {
    const authSession: Pick<AuthSessionResponse, 'user'> = {
      user: {
        id: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'user1@example.com',
        role: 'FREE',
        envVars: [],
        oauthTokens: [],
        profile: null
      }
    };
    const result = generateCodeDefaultTemplate(authSession);
    expect(result).toBe(CODE_DEFAULT_TEMPLATE);
  });

  it('should replace console.log with user and env keys from authSession', () => {
    const authSession: Pick<AuthSessionResponse, 'user'> = {
      user: {
        id: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'user1@example.com',
        role: 'FREE',
        envVars: [
          {
            id: 1, ownerUserId: 'user1', key: 'USER_KEY', value: 'value1',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2, ownerUserId: 'user2', key: 'ENV_KEY', value: 'value2',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        oauthTokens: [],
        profile: null
      }
    };
    const result = generateCodeDefaultTemplate(authSession);
    expect(result).toContain('const { USER_KEY, ENV_KEY, ...requestArgs } = ctx;');
  });
});
