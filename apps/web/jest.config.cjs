const nextJest = require('next/jest');
module.exports = nextJest({dir: __dirname})({
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/test/**/*.test.tsx'],
});
