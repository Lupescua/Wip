const preset = require('@rushstack/heft/includes/jest-shared.config.json');

// extends heft's jest preset
module.exports = {
  ...preset,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '.stories.', '.styles.', 'index.ts']
};
