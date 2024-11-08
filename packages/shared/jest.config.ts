import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(spec|test).[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    consola: '<rootDir>/__tests__/__mocks__/mockConsola.js',
    '^@repo/db/(.*)$': '<rootDir>/../database/src/$1',
    '^@repo/shared/(.*)$': '<rootDir>/src/$1',
    '^@repo/components/(.*)$': '<rootDir>/../components/$1',
    '^@/(.*)$': '<rootDir>/$1'
  },
};

export default config;