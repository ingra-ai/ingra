import { runUserFunction } from '@repo/shared/utils/vm/functions/runUserFunction';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { mockAuthSession } from '@/__tests__/__mocks__/mockAuthSession';
import { mockFunctionHelloWorld } from '@/__tests__/__mocks__/mockFunctions';
import db from '@repo/db/client';

describe('runUserFunction', () => {
  const authSession = mockAuthSession as unknown as AuthSessionResponse;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute basic function in VM', async () => {
    (db.function.findUnique as jest.Mock).mockResolvedValueOnce(mockFunctionHelloWorld);

    const runOutput = await runUserFunction(authSession, mockFunctionHelloWorld, {}),
      { metrics, errors, result } = runOutput;

    expect(result).toBe('Hello World');
  });

  it('should throw an error when VM function throws an error', async () => {
    const clonedMockFunction = { ...mockFunctionHelloWorld };

    // Update the code in mockFunctionHelloWorld to simulate a long execution time
    clonedMockFunction.code = `
      async function handler(ctx) {
        throw new Error('I am a pie!');

        return 'Hello World';
      }
    `;

    const runOutput = await runUserFunction(authSession, clonedMockFunction, {}),
      { metrics, errors, result } = runOutput;

    expect(errors[0]).toStrictEqual({
      type: 'error',
      message: 'I am a pie!',
    });
    expect(result).toBeUndefined();
  });

  it('should throw an error if there is undeclared variable in VM code', async () => {
    const clonedMockFunction = { ...mockFunctionHelloWorld };

    // Update the code in mockFunctionHelloWorld to simulate a long execution time
    clonedMockFunction.code = `
      async function handler(ctx) {
        console.log(undeclaredVariable);

        return 'Hello World';
      }
    `;

    const runOutput = await runUserFunction(authSession, clonedMockFunction, {}),
      { metrics, errors, result } = runOutput;

    expect(errors[0]).toStrictEqual({
      type: 'error',
      message: 'undeclaredVariable is not defined',
    });
    expect(result).toBeUndefined();
  });

  it('should throw timeout error when executing function in VM for a long time. (3s in test mode defined in jest.setup.ts)', async () => {
    const clonedMockFunction = { ...mockFunctionHelloWorld };

    // Update the code in mockFunctionHelloWorld to simulate a long execution time
    clonedMockFunction.code = `
      async function handler(ctx) {
        await new Promise(resolve => setTimeout(resolve, 4e3));

        return 'Hello World';
      }
    `;

    const runOutput = await runUserFunction(authSession, clonedMockFunction, {}),
      { metrics, errors, result } = runOutput;

    expect(errors[0]).toStrictEqual({
      type: 'error',
      message: 'Execution timed out exceeded 3 seconds',
    });
    expect(result).toBeUndefined();
  });
});
