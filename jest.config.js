module.exports = {
  cacheDirectory: '<rootDir>/.cache',
  testMatch: ['<rootDir>/src/tests/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/src/tsconfig.spec.json'
    }
  }
};
