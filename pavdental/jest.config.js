// Component tests: the real screens, rendered with React Native Testing Library.
// (The older tsx-run tests in src/__tests__ stay as they are.)
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/src/__component__/**/*.test.{ts,tsx}"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/features/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/components/illustrations/**",
  ],
  // A floor, not a goal: coverage may not fall below today's level, and the
  // numbers are raised as real screen tests are added. (Most of the older
  // tsx-run tests read source text and do not count here.)
  coverageReporters: ["text-summary", "lcov"],
  coverageThreshold: {
    global: { statements: 9, branches: 9, functions: 6, lines: 10 },
  },
};
