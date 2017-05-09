module.exports = function(wallaby) {
  return {
    files: [
      'src/**/*.ts',
      '!src/**/*.test.ts',
      'tsconfig.json',
      'package.json'
    ],
    tests: [
      'src/**/*.test.ts'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'jest',
    debug: false
  };
}
