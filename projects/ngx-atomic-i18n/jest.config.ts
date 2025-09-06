// projects/ngx-atomic-i18n/src/jest.config.ts

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  transform: {
    '^.+\\.(ts|js|mjs|html)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|rxjs|zone.js|tslib)'
  ],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^ngx-atomic-i18n$': '<rootDir>/src/public-api.ts',
    '^ngx-atomic-i18n/(.*)$': '<rootDir>/src/lib/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testTimeout: 15000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/public-api.ts'
  ],
  maxConcurrency: 5,
  clearMocks: true,
  restoreMocks: true,

  // 這是唯一的增加，確保路徑正確
  // globalSetup: '../../bin/test/globalSetup.ts',
};

