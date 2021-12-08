const resolve = require(`${process.env.PWD}/node_modules/@nycopportunity/pttrn/bin/util/resolve`);
let tokens = resolve('config/tokens', true, false); // The resolve utility prevents the tokens file from being cached

let dark = tokens.colorMode.default;
let light = tokens.colorMode.light;

delete tokens.version;
delete tokens.output;
delete tokens.prefix;
delete tokens.language;
delete tokens.languageRtl;
delete tokens.scale;
delete tokens.colorMode;
delete tokens.iconSize;

module.exports = [
  {
    'dist': 'dist/styles/tokens.css',
    'properties': {
      'wnyc': {
        ...tokens
      }
    }
  },
  {
    'dist': 'dist/styles/tokens-default.css',
    'ruleset': ':root, .default',
    'properties': {
      'wnyc': {
        ...dark
      }
    }
  },
  {
    'dist': 'dist/styles/tokens-light.css',
    'ruleset': '.light',
    'properties': {
      'wnyc': {
        ...light
      }
    }
  }
];
