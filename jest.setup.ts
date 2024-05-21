jest.mock('@/data/auditLog', () => ({
  pushToAuditTable: jest.fn(),
}));