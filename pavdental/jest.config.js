// Component tests: the real screens, rendered with React Native Testing Library.
// (The older tsx-run tests in src/__tests__ stay as they are.)
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/src/__component__/**/*.test.tsx"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/features/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/components/illustrations/**",
  ],
};
