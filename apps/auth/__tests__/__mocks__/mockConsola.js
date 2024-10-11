// mocking because of incompatibility between consola v3 & jest, see https://github.com/unjs/consola/issues/195
const LogTypes = [
  "silent",
  "fatal",
  "error",
  "warn",
  "log",
  "info",
  "success",
  "fail",
  "ready",
  "start",
  "box",
  "debug",
  "trace",
  "verbose",
];

class Consola {
  constructor() {
    const types = LogTypes;

    LogTypes.forEach((type) => {
      this[type] = function () {
        if (["error", "warn"].includes(type)) {
          console.log(`[${ type }]`, ...arguments);
        }
      };
    });
  }

  mockTypes(mockFn) {
    LogTypes.forEach((type) => {
      this[type] = mockFn(type);
    });
  }

  withTag(tag) {
    return this;
  }

  create() {
    return new Consola();
  }
}

const createConsola = function () {
  return new Consola();
};

const consola = createConsola();

export { consola, createConsola };
