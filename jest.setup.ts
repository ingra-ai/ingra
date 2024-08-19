import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import db from '@lib/db';
import * as constants from '@lib/constants';

jest.mock('@/data/auditLog', () => ({
  pushToAuditTable: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
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

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@lib/db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

jest.mock('@lib/constants', () => ({
  ...jest.requireActual('@lib/constants'),
  VM_SANDBOX_EXECUTION_TIMEOUT_SECONDS: 3,
}));

beforeEach(() => {
  mockReset(db);
});
