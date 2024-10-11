import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    consola: '<rootDir>/__tests__/__mocks__/mockConsola.js',
    '^@/(.*)$': '<rootDir>/$1',
    '@v1/(.*)$': '<rootDir>/app/api/v1/$1',
    '@app/(.*)$': '<rootDir>/app/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.js', '**/__tests__/**/*.test.jsx'],
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
