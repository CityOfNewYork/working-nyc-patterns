/**
 * Dependencies
 */

const Path = require('path');
const alerts = require('../node_modules/@nycopportunity/pttrn/config/alerts');

/**
 * Config
 */

/**
 * Prefixes
 *
 * The list of prefixes for each pattern type. These will/can be used in the
 * templates above.
 */
const prefixes = {
  'elements': '',
  'components': 'c-',
  'objects': 'o-',
  'utilities': ''
};

/**
 * Files
 * Required for templates! This is the determination of the file name for each
 * template. There must be a filename for each template in the list above.
 */
const files = {
  'markup': '{{ pattern }}.slm',
  'markdown': '{{ pattern }}.md',
  'style': '_{{ pattern }}.scss',
  'script': '{{ pattern }}.js',
  'readme': 'readme.md',
  'config': '_{{ pattern }}.scss',
  'view': '{{ pattern }}.slm'
};

/**
 * Optional
 *
 * Templates in this list will be flagged as optional with a yes/no question
 * asking if you want to create them.
 */
const optional = [
  'config',
  'view',
  'script',
  'readme'
];

/**
 * Patterns
 *
 * Templates in this list will be written to the patterns directory in
 * "src/{{ type }}/{{ pattern }}/". If a template is not included here it
 * must have a path defined in the paths constant below.
 */
const patterns = [
  'style',
  'markup',
  'markdown',
  'script',
  'readme'
];

/**
 * This is a list of directories for the make file to reference. Changing them
 * will change where things are written. If you want to create a custom directory
 * to write files to, it should be added here.
 */
const dirs = {
  'base': process.env.PWD,
  'src': 'src',
  'config': 'config',
  'view': 'views'
};

/**
 * This is a list of paths where templates will be written. Default templates
 * such as markup, markdown, and style as well as templates defined in the
 * patterns constant above will be written to the patterns path defined in this
 * constant. If there is a custom template not included in the patterns constant
 * above it must have a path defined here.
 *
 * These paths also accept the same variables as the templates above.
 */
const paths = {
  'config': Path.join(dirs.src, dirs.config),
  'view': Path.join(dirs.src, dirs.view),
  'pattern': Path.join(dirs.src, '{{ type }}', '{{ pattern }}'), // covers default markup, markdown, and style templates as well as any custom templates defined in the patterns constant above.
  'sass': '/config/sass.js',
  'rollup': '/config/rollup.js'
};

const messages = {
  'style': [
    '\n',
    `${alerts.styles} Import the ${alerts.str.string('{{ pattern }}')} `,
    `stylesheet into the main stylesheet file (recommended). Add the `,
    `${alerts.str.string('{{ pattern }}')} stylesheet to `,
    `${alerts.str.path(paths.sass)} to create an independent distribution `,
    '(optional).',
    '\n'
  ],
  'script': [
    '\n',
    `${alerts.scripts} Import the ${alerts.str.string('{{ pattern }}')} `,
    'script into the main scripts file and create a public function for ',
    'it in the main class (recommended). Add the ',
    `${alerts.str.string('{{ pattern }}')} script to `,
    `${alerts.str.path(paths.rollup)} to create an independent distribution `,
    '(optional).',
    '\n'
  ]
};

module.exports = {
  files: files,
  optional: optional,
  prefixes: prefixes,
  dirs: dirs,
  paths: paths,
  patterns: patterns,
  messages: messages
};