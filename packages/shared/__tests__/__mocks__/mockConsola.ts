// __tests__/__mocks__/mockConsola.ts

const LogTypes = [
  'silent',
  'fatal',
  'error',
  'warn',
  'log',
  'info',
  'success',
  'fail',
  'ready',
  'start',
  'box',
  'debug',
  'trace',
  'verbose',
];

class Consola {
  [key: string]: any; // Allows dynamic assignment of methods

  constructor() {
    LogTypes.forEach((type) => {
      this[type] = (...args: any[]) => {
        if (['error', 'warn'].includes(type)) {
          console.log(`[${type}]`, ...args);
        }
      };
    });
  }

  mockTypes(mockFn: any) {
    LogTypes.forEach((type) => {
      this[type] = mockFn(type);
    });
  }

  withTag(tag: string) {
    return this;
  }

  create() {
    return new Consola();
  }
}

const createConsola = () => new Consola();

const consola = createConsola();

export { consola, createConsola };
