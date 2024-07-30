import type { Config } from 'jest';

const config: Config = {
    clearMocks: true,
    collectCoverage: false,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    preset: 'ts-jest',
    testEnvironment: "jest-environment-node",
    testRegex: '(/test/jest-tests/.*|(\\.|/)(test|spec))\\.(m)?ts$',
    testPathIgnorePatterns: ['node_modules', 'multiple-run.test'],
};

export default config;
