import { PrismaClient } from '@repo/db/prisma';
import { mockDeep, mockReset } from 'jest-mock-extended';
import db from '@repo/db/client';
import * as constants from '@repo/shared/lib/constants';

jest.mock('@repo/shared/data/auditLog', () => ({
  pushToAuditTable: jest.fn(),
}));

jest.mock('@repo/shared/lib/analytics', () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(),
}));

jest.mock('cheerio', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('algoliasearch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@repo/db/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('@repo/shared/lib/constants', () => ({
  ...jest.requireActual('@repo/shared/lib/constants'),
  VM_SANDBOX_EXECUTION_TIMEOUT_SECONDS: 3,
}));

beforeEach(() => {
  mockReset(db);
});
