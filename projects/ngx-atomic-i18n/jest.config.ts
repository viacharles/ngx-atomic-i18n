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
    'node_modules/(?!@angular|rxjs)'  // 這一行讓 rxjs 跟 @angular 也會被編譯
  ],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^ngx-atomic-i18n$': '<rootDir>/src/public-api.ts',
    '^ngx-atomic-i18n/(.*)$': '<rootDir>/src/lib/$1',
    // 加上 asset/style stub（有需要才加）
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // 移除 maxWorkers 限制以提升性能，但保留較長的 timeout
  testTimeout: 15000,
  // 確保 coverage 包含所有測試檔案
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/public-api.ts'
  ],
  // 提升測試執行效率
  maxConcurrency: 5,
  // 避免記憶體洩漏
  clearMocks: true,
  restoreMocks: true,
};
