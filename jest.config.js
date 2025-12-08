// Root Jest config to run library tests from the workspace root
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/projects/ngx-i18n/setup-jest.ts'],
  testMatch: ['<rootDir>/projects/ngx-i18n/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  transform: {
    '^.+\\.(ts|js|mjs|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/projects/ngx-i18n/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|rxjs|zone.js|tslib)'
  ],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
      prefix: '<rootDir>/'
    }),
    '^ngx-i18n$': '<rootDir>/projects/ngx-i18n/src/public-api.ts',
    '^ngx-i18n/(.*)$': '<rootDir>/projects/ngx-i18n/src/lib/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/projects/ngx-i18n/__mocks__/fileMock.js'
  },
  testTimeout: 15000,
  maxConcurrency: 5,
  clearMocks: true,
  restoreMocks: true
}
