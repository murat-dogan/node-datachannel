export default {
    testEnvironment: 'node',
    verbose: true,
    testPathIgnorePatterns: ['node_modules', 'multiple-run.test'],
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.m?[tj]s?$': ['ts-jest', { useESM: true }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
    },
    testRegex: '(/test/jest-tests/.*|(\\.|/)(test|spec))\\.(m)?ts$',
};
