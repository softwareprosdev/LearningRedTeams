module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  testEnvironment: 'node',
  rootDir: './',
  roots: ['<rootDir>/src'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: ['src/modules/**/*.(ts,tsx)', '!src/**/dto/**', '!src/**/index.ts'],
};
