/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "jest-puppeteer",
  testEnvironment: "jest-environment-puppeteer",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", "tsconfig.json"],
  },
};
