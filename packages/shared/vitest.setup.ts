// vitest.setup.ts
import { PrismaClient } from '@repo/db/prisma';
import db from '@repo/db/client';
import { vi, beforeEach } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { consola, createConsola } from './__tests__/__mocks__/mockConsola';

// Mock implementations using vi instead of jest
vi.mock('@repo/shared/data/auditLog', () => ({
  pushToAuditTable: vi.fn(),
}));

vi.mock('@repo/shared/lib/analytics', () => ({
  mixpanel: {
    track: vi.fn(),
  },
}));

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(),
}));

vi.mock('cheerio', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('algoliasearch', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('node-fetch', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@repo/db/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));


// vi.mock("@repo/db/client", async () => {
//   const actual = await vi.importActual<typeof import('@repo/db/client')>("@repo/db/client")
//   return {
//     ...actual,
//   };
// });

vi.mock('@repo/shared/lib/constants', async () => {
  const actualConstants = await vi.importActual<typeof import('@repo/shared/lib/constants')>(
    '@repo/shared/lib/constants'
  );
  return {
    ...actualConstants,
    VM_SANDBOX_EXECUTION_TIMEOUT_SECONDS: 3,
  };
});

vi.mock('consola', () => {
  return {
    default: consola,
    consola,
    createConsola,
    Consola: consola.constructor,
  };
});
