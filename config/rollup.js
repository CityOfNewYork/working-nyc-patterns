/**
 * Dependencies
 */

const resolve = require('@rollup/plugin-node-resolve'); // Locate modules using the Node resolution algorithm, for using third party modules in node_modules.
const babel = require('rollup-plugin-babel');           // Transpile source code.
const buble = require('@rollup/plugin-buble');          // Convert ES2015 with buble.
const replace = require('@rollup/plugin-replace');      // Replace content while bundling.
const commonjs = require('@rollup/plugin-commonjs');    // Include CommonJS packages in Rollup bundles.

/**
 * Config
 */

/**
 * General configuration for Rollup
 * @type {Object}
 */
let rollup = {
  sourcemap: 'inline',
  format: 'iife',
  strict: true
};

/**
 * Plugin configuration
 * @type {Object}
 */
const plugins = {
  babel: babel({
    exclude: 'node_modules/**'
  }),
  resolve: resolve({
    browser: true,
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  }),
  replace: replace({
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'SCREEN_DESKTOP': 960,
    'SCREEN_TABLET': 768,
    'SCREEN_MOBILE': 480,
    'SCREEM_SM_MOBILE': 400
  }),
  common: commonjs(),
  buble: buble({
    transforms: {
      forOf: false
    }
  })
};

/**
 * Distribution plugin settings. Order matters here.
 * @type {Array}
 */

/** These are plugins used for the global patterns script */
rollup.local = [
  plugins.resolve,
  plugins.common,
  plugins.babel,
  plugins.buble,
  plugins.replace
];

rollup.dist = [
  plugins.resolve,
  plugins.common,
  plugins.babel,
  plugins.buble,
  plugins.replace
];

/**
 * Our list of modules we are exporting
 * @type {Array}
 */
module.exports = [
  {
    // This is the global distribution that packages all modules and peer dependencies
    input: './src/js/main.js',
    output: [{
      name: 'WorkingNyc',
      file: `./dist/scripts/main.js`,
      sourcemap: (process.env.NODE_ENV === 'production')
        ? false : rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict,
      globals: rollup.globals
    }],
    plugins: rollup.local,
    devModule: true
  }
];
