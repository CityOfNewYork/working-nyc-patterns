/**
 * Dependencies
 */

const tokens = require('./tokens.js');

/**
 * Config
 */

module.exports = {
  purge: false,
  important: true,
  theme: {
    colors: tokens.colors,
    backgroundColor: tokens.colors,
    borderColor: global.Object.assign({default: ''}, tokens.colors),
    borderWidth: tokens['border-Widths'],
    inset: {
      '0': 0,
      'auto': 'auto',
      '100': '100%'
    },
    boxShadow: tokens.shadows,
    fill: tokens.colors,
    fontFamily: tokens['font-family'],
    fontSize: tokens['font-size'],
    fontWeight: tokens['font-weight'],
    fontStyle: tokens['font-style'],
    height: {
      'auto': 'auto',
      'full': '100%',
      '90vh': '90vh',
      '100vh': '100vh'
    },
    lineHeight: tokens.leading,
    margin: tokens.margin,
    maxWidth: {
      '1/2': '50%',
      'full': '100%'
    },
    padding: tokens.padding,
    screens: tokens.screens,
    textColor: tokens.colors,
    zIndex: tokens.z
  },
  variants: {
    preflight: [],
    container: [],
    accessibility: ['responsive'],
    appearance: ['responsive'],
    backgroundAttachment: [],
    backgroundColor: ['responsive'],
    backgroundPosition: [],
    backgroundRepeat: [],
    backgroundSize: [],
    borderCollapse: [],
    borderColor: ['responsive'],
    borderRadius: [],
    borderStyle: [],
    borderWidth: ['responsive'],
    cursor: [],
    display: ['responsive'],
    flexDirection: ['responsive'],
    flexWrap: ['responsive'],
    alignItems: ['responsive'],
    alignSelf: ['responsive'],
    justifyContent: ['responsive'],
    alignContent: ['responsive'],
    flex: ['responsive'],
    flexGrow: ['responsive'],
    flexShrink: ['responsive'],
    order: ['responsive'],
    float: [],
    fontFamily: [],
    fontWeight: ['responsive'],
    fontStyle: ['responsive'],
    height: [],
    lineHeight: [],
    listStylePosition: [],
    listStyleType: [],
    margin: ['responsive'],
    maxHeight: [],
    maxWidth: ['responsive'],
    minHeight: ['responsive'],
    minWidth: [],
    objectFit: [],
    objectPosition: [],
    opacity: [],
    outline: [],
    overflow: ['responsive'],
    padding: ['responsive'],
    placeholderColor: [],
    pointerEvents: [],
    position: ['responsive'],
    inset: [],
    resize: [],
    boxShadow: ['responsive', 'hover', 'focus'],
    fill: [],
    stroke: [],
    tableLayout: [],
    textAlign: [],
    textColor: [],
    fontSize: ['responsive'],
    fontStyle: ['responsive'],
    textTransform: [],
    textDecoration: [],
    transform: [],
    fontSmoothing: [],
    letterSpacing: [],
    userSelect: [],
    verticalAlign: [],
    visibility: [],
    whitespace: ['responsive'],
    wordBreak: [],
    width: ['responsive'],
    zIndex: []
  },
  /**
   * These are the plugins that will be enabled in the process utility stylesheet
   */
  corePlugins: [
    // 'preflight',
    // 'container',
    'accessibility',
    // 'appearance',
    'backgroundAttachment',
    'backgroundColor',
    // 'backgroundPosition',
    // 'backgroundRepeat',
    // 'backgroundSize',
    'borderCollapse',
    'borderColor',
    'borderRadius',
    'borderStyle',
    'borderWidth',
    'cursor',
    'display',
    'flexDirection',
    'flexWrap',
    'alignItems',
    'alignSelf',
    'justifyContent',
    'alignContent',
    'flex',
    'flexGrow',
    'flexShrink',
    'order',
    // 'float',
    'fontFamily',
    'fontWeight',
    'height',
    'lineHeight',
    // 'listStylePosition',
    'listStyleType',
    'margin',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    // 'objectFit',
    // 'objectPosition',
    'opacity',
    // 'outline',
    'overflow',
    'padding',
    // 'placeholderColor',
    'pointerEvents',
    'position',
    'inset',
    // 'resize',
    'boxShadow',
    'fill',
    'stroke',
    'tableLayout',
    'textAlign',
    'textColor',
    'transform',
    'fontSize',
    'fontStyle',
    'textTransform',
    'textDecoration',
    'fontSmoothing',
    // 'letterSpacing',
    'userSelect',
    'verticalAlign',
    'visibility',
    'whitespace',
    // 'wordBreak',
    'width',
    'zIndex'
  ]
};
