/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 1. Tell Jest NOT to ignore the faker package when transforming
  transformIgnorePatterns: [
    "node_modules/(?!@faker-js/.*)"
  ],
  
  transform: {
    // 2. Tell ts-jest to translate both TS and JS files
    '^.+\\.(ts|js|tsx|jsx)$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          esModuleInterop: true,
          allowJs: true // Crucial: Allows it to translate Faker's .js files
        },
      },
    ],
  },
};