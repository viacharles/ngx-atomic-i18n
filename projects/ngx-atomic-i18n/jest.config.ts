module.exports = {
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testMatch: ['**/+(*.)+(spec).+(ts)'],
    moduleFileExtensions: ['ts', 'js', 'html'],
    transform: {
        '^.+\\.(ts|js|html)$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            stringifyContentPathRegex: '\\.html$',
        },
    },
    coverageDirectory: '<rootDir>/coverage',
    testEnvironment: 'node',
};
