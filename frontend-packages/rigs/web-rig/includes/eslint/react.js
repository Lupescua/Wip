// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: [
    '@rushstack/eslint-config/profile/web-app',
    '@rushstack/eslint-config/mixins/react'
  ],

  /**
   * Define this in the eslint config file that
   * extends this config.
   */
  // parserOptions: { tsconfigRootDir: __dirname },

  settings: {
    react: {
      version: '17.0.2'
    }
  },

  // Custom tweaks
  overrides: [
    {
      files: ['*.tsx'],

      rules: {
        // RATIONALE:         This is off as we want to explicit define
        //                    react function return types
        '@typescript-eslint/explicit-function-return-type': 'off',

        // RATIONALE:         We only allow stateless functional components.
        'react/prefer-stateless-function': [2, { ignorePureComponents: false }]
      }
    }
  ]
};
