/**
 * Dependencies
 */

const nodeResolve = require('@rollup/plugin-node-resolve'); // Locate modules using the Node resolution algorithm, for using third party modules in node_modules
const commonjs = require('@rollup/plugin-commonjs');        // Include CommonJS packages in Rollup bundles
const replace = require('@rollup/plugin-replace');          // Replace content while bundling

/**
 * General ES module configuration
 *
 * @type {Object}
 */
let rollup = {
  sourcemap: 'inline',
  format: 'iife',
  strict: true
};

/**
 * Plugin configuration. Refer to the package for details on the available options.
 *
 * @source https://github.com/rollup/plugins
 *
 * @type {Object}
 */
const plugins = [
  nodeResolve.nodeResolve({
    browser: true,
    moduleDirectories: [
      'node_modules'
    ]
  }),
  commonjs(),
  replace({
    'preventAssignment': true,
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'SCREEN_DESKTOP': 960,
    'SCREEN_TABLET': 768,
    'SCREEN_MOBILE': 480,
    'SCREEM_SM_MOBILE': 400
  })
];

/**
 * ES Module Exports
 *
 * @type {Array}
 */
module.exports = [
  {
    // This is the global distribution that packages all modules and peer dependencies
    input: './src/js/main.js',
    output: [{
      name: 'WorkingNyc',
      file: `./dist/scripts/main.js`,
      sourcemap: (process.env.NODE_ENV === 'production') ? false : rollup.sourcemap,
      format: rollup.format,
      strict: rollup.strict
    }],
    plugins: plugins,
    devModule: true
  }
];
