module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'server/**/*.js',
    'helpers/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['dotenv/config'],
};
