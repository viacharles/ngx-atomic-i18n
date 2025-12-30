// Root Jest config to run library tests from the workspace root
const { pathsToModuleNameMapper } = require('ts-jest')
const path = require('node:path')
const ts = require('typescript')

function loadTsconfigPaths (tsconfigPath) {
  const abPath = path.resolve(__dirname, tsconfigPath)
  const parsed = ts.getParsedCommandLineOfConfigFile(abPath, {}, ts.sys)
  if (!parsed) {
    throw new Error(`[jest] Failed to parse tsconfig: ${tsconfigPath}`)
  }
  if (parsed.errors.length) {
    const host = {
      gstCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => '\n'
    }
    const msg = ts.formatDiagnostics(parsed.errors, host)
    throw new Error(`[jest] Invalid tsconfig: ${tsconfigPath}\n${msg}`)
  }
  return parsed.options?.paths || {}
}

const tsconfigPaths = loadTsconfigPaths('./tsconfig.base.json')

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/projects/ngx-atomic-i18n/setup-jest.ts'],
  testMatch: ['<rootDir>/projects/ngx-atomic-i18n/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  transform: {
    '^.+\\.(ts|js|mjs|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/projects/ngx-atomic-i18n/tsconfig.spec.json',
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
    ...pathsToModuleNameMapper(tsconfigPaths || {}, {
      prefix: '<rootDir>/'
    }),
    '^ngx-atomic-i18n$': '<rootDir>/projects/ngx-atomic-i18n/src/public-api.ts',
    '^ngx-atomic-i18n/(.*)$': '<rootDir>/projects/ngx-atomic-i18n/src/lib/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/projects/ngx-atomic-i18n/__mocks__/fileMock.js'
  },
  testTimeout: 15000,
  maxConcurrency: 5,
  clearMocks: true,
  restoreMocks: true
}
