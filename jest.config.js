module.exports = {
  cacheDirectory: '<rootDir>/.cache',
  testMatch: ['<rootDir>/src/tests/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  }
};
