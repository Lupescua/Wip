'use strict';

const ESLINT = '~7.12.1';
const ESLINT_TYPESCRIPT = '~4.16.1';
const REACT_LOWER = '16.14.0';
const REACT_UPPER = '17.0.2';
// const TYPESCRIPT = '~3.9.7';
const TYPESCRIPT = '~4.2.2';
/**
 * When using the PNPM package manager, you can use pnpmfile.js to workaround
 * dependencies that have mistakes in their package.json file.  (This feature is
 * functionally similar to Yarn's "resolutions".)
 *
 * For details, see the PNPM documentation:
 * https://pnpm.js.org/docs/en/hooks.html
 *
 * IMPORTANT: SINCE THIS FILE CONTAINS EXECUTABLE CODE, MODIFYING IT IS LIKELY TO INVALIDATE
 * ANY CACHED DEPENDENCY ANALYSIS.  After any modification to pnpmfile.js, it's recommended to run
 * "rush update --full" so that PNPM will recalculate all version selections.
 */
module.exports = {
  hooks: {
    readPackage
  }
};

/**
 * This hook is invoked during installation before a package's dependencies
 * are selected.
 * The `packageJson` parameter is the deserialized package.json
 * contents for the package that is about to be installed.
 * The `context` parameter provides a log() function.
 * The return value is the updated object.
 */
function readPackage(packageJson, context) {
  switch (packageJson.name) {
    case '@rushstack/eslint-config':
      packageJson.dependencies['eslint'] = ESLINT;
      packageJson.dependencies['typescript'] = TYPESCRIPT;
      packageJson.dependencies['@typescript-eslint/eslint-plugin'] = ESLINT_TYPESCRIPT;
      packageJson.dependencies[
        '@typescript-eslint/experimental-utils'
      ] = ESLINT_TYPESCRIPT;
      packageJson.dependencies['@typescript-eslint/parser'] = ESLINT_TYPESCRIPT;
      packageJson.dependencies[
        '@typescript-eslint/typescript-estree'
      ] = ESLINT_TYPESCRIPT;
      break;
    case '@rushstack/heft-web-rig':
      packageJson.dependencies['typescript'] = TYPESCRIPT;
      break;
    case '@itspure/react-native-rn-mia':
      packageJson.dependencies['react'] = REACT_LOWER;
      packageJson.dependencies['react-dom'] = REACT_LOWER;
      break;
    case '@storybook/react':
    case '@reach/router':
    case '@storybook/addon-actions':
    case '@storybook/addon-essentials':
    case '@storybook/react':
      packageJson.dependencies['typescript'] = TYPESCRIPT;
      packageJson.dependencies['react'] = REACT_LOWER;
      packageJson.dependencies['react-dom'] = REACT_LOWER;
      break;
    case 'react-test-renderer':
      packageJson.dependencies['react'] = REACT_UPPER;
      packageJson.dependencies['react-dom'] = REACT_UPPER;
      break;
    case '@storybook/api':
      packageJson.dependencies['regenerator-runtime'] = '0.13.9';
      break;
    case '@emotion/primitives-core':
      packageJson.dependencies['@emotion/core'] = '10.0.27';
      break;
    // case 'react-intl':
    //   packageJson.dependencies['typescript'] = TYPESCRIPT;
    //   break;
  }
  // // The karma types have a missing dependency on typings from the log4js package.
  // if (packageJson.name === '@types/karma') {
  //  context.log('Fixed up dependencies for @types/karma');
  //  packageJson.dependencies['log4js'] = '0.6.38';
  // }

  return packageJson;
}
