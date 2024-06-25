jest.mock('@/data/auditLog', () => ({
  pushToAuditTable: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));