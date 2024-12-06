/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {}]
    },
    testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    extensionsToTreatAsEsm: ['.ts']
};
