/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    '^\\./src/(.*)\\.js$': '<rootDir>/src/$1.ts',
  },
};