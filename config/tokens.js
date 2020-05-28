/**
 * Config
 */

const package = require('../package.json');

module.exports = {
  'output': '"./src/config/_tokens.scss"',
  'version': package.version,
  'cdn': '"https://cdn.jsdelivr.net/gh/cityofnewyork/nyco-wnyc-patterns@v' + package.version + '/dist/"',
  'languages': ['default', 'ar', 'es', 'kr', 'ur', 'tc'],
  'rtl-languages': ['ar', 'ur'],
  'font-family': {
    'system': [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
      'Oxygen-Sans', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'sans-serif'
    ],
    'inherit': 'inherit',
    'body': ['"Montserrat"', 'sans-serif'],
    'h1': ['"Montserrat"', 'sans-serif'],
    'h2': ['"Montserrat"', 'sans-serif'],
    'h3': ['"Montserrat"', 'sans-serif'],
    'h4': ['"Montserrat"', 'sans-serif'],
    'h5': ['"Montserrat"', 'sans-serif'],
    'h6': ['"Montserrat"', 'sans-serif'],
    'p': ['"Lato"', 'sans-serif'],
    'button': ['"Lato"', 'sans-serif'],
    'primary': ['"Montserrat"', 'sans-serif'],
    'secondary': ['"Lato"', 'sans-serif']
  },
  'font-weight': {
    'body': 'normal',
    'h1': 'bold',
    'h2': 'bold',
    'h3': 'bold',
    'h4': 'bold',
    'h5': 'bold',
    'h6': 'bold',
    'p': 'normal',
    'small': 'normal',
    'button': 'bold',
    'normal': 'normal',
    'bold': 'bold'
  },
  'font-size': {
    'html': '22px',
    'body': '1rem',
    'h1': '3rem',
    'h2': '2.5rem',
    'h3': '2rem',
    'h4': '1.5rem',
    'h5': '1rem',
    'h6': '0.5rem',
    'p': '0.9rem',
    'small': '0.72rem',
    'button': '1rem'
  },
  'line-height': {
    'body': 'normal',
    'h1': '1.2',
    'h2': '1.3',
    'h3': '1.3',
    'h4': 'normal',
    'h5': 'normal',
    'h6': 'normal',
    'p': '1.3',
    'small': 'normal',
    'button': '1'
  },
  'type': {
    'margin': '1.250rem 0 0.64rem'
  },
  'links': {
    'font-weight': 'bold',
    'text-decoration': 'underline'
  },
  'buttons': {
    'radius': '5px',
    'radius-tag': '50px'
  },
  'colors': {
    'blue-d4': '#031837',
    'blue-d3': '#071F42',
    'blue-d2': '#0C264D',
    'blue': '#003C7A',
    'blue-l1-alt': '#1E78BE',
    'blue-l1': '#3194E0',
    'blue-l2': '#68B7F4',
    'blue-l3': '#C9EEFE',
    'green': '#006333',
    'green-l1': '#008E46',
    'green-l2': '#4BAC4C',
    'green-l3': '#A8DD7C',
    'yellow': '#FFD029',
    'yellow-l1': '#FAD457',
    'yellow-l2': '#F6D772',
    'yellow-l3': '#FDE9A6',
    'black': '#000000',
    'white': '#FFFFFF',
    'transparent': 'rgba(255, 255, 255, 0)',
    'inherit': 'inherit'
  },
  'color-combinations': {
    'light-background': {
      'color': 'blue',
      'headings': 'blue',
      'color-alt': 'blue-l1-alt',
      'hyperlinks': 'blue-l1',
      'visited': 'blue-l1',
      'hover': 'blue-l1',
      'background-color': 'white'
    },
    'mid-background': {
      'color': 'blue-d2',
      'headings': 'blue-d2',
      'color-alt': 'blue',
      'hyperlinks': 'blue-l1-alt',
      'visited': 'blue-l1-alt',
      'hover': 'blue-l1-alt',
      'background-color': 'blue-l3'
    },
    'dark-background': {
      'color': 'white',
      'font-smooth': true,
      'headings': 'white',
      'color-alt': 'blue-l3',
      'hyperlinks': 'blue-l1',
      'visited': 'blue-l1',
      'hover': 'blue-l1',
      'background-color': 'blue-d4'
    },
    'primary-button': {
      'color': 'blue-l1',
      'font-smooth': true,
      'background-color': 'blue-d3'
    },
    'secondary-button': {
      'color': 'green-l3',
      'font-smooth': true,
      'background-color': 'blue-d3'
    },
    'tertiary-button': {
      'color': 'yellow-l1',
      'font-smooth': true,
      'background-color': 'blue-d3'
    },
    'code': {
      'color': 'blue-d2',
      'hyperlinks': 'blue-l1-alt',
      'visited': 'blue-l1-alt',
      'hover': 'blue-l1-alt',
      'background-color': 'blue-l3'
    }
  },
  'screens': {
    'screen-desktop': 960,
    'screen-tablet': 768,
    'screen-mobile': 480,
    'screen-sm-mobile': 400
  },
  'grid': '8px',
  'dimensions': {
    'mobile-menu-width': '80vw',
    'content-width': '800px',
    'site-max-width': '1440px',
    'site-min-width': '320px'
  },
  'animate': {
    'ease-in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    'ease-out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
    'animate-scss-speed': '0.75s',
    'animate-timing-function': 'cubic-bezier(0.23, 1, 0.32, 1)'
  },
  'border-widths': {
    '0': '0',
    'default': '1px',
    '2': '2px',
    '3': '3px',
    '4': '4px',
    '5': '5px',
    '6': '6px',
    '7': '7px',
    '8': '8px'
  },
  'padding': {
    '0': '0',
    '1': '8px',
    '2': '16px',
    '3': '24px',
    '4': '32px'
  },
  'margin': {
    '0': '0',
    '1': '8px',
    '2': '16px',
    '3': '24px',
    '4': '32px',
    'auto': 'auto'
  },
  'icons-sizes': {
    '1': ['8px', '8px'],
    '2': ['16px', '16px'],
    '3': ['24px', '24px'],
    '4': ['32px', '32px'],
    '5': ['40px', '40px'],
    '6': ['48px', '48px'],
    '7': ['56px', '56px'],
    '8': ['64px', '64px'],
    '9': ['72px', '72px'],
    '10': ['80px', '80px'],
    '11': ['88px', '88px'],
    '12': ['96px', '96px'],
    'large': ['136px', '136px'],
    'xlarge': ['256px', '256px']
  },
  'inputs': {
    'checkbox-radius': '8px',
    'checkbox-size': '30px',
    'toggle-size': '24px'
  },
  'layouts': {
    'side-bar-width': '18.5rem',
    'side-bar-width-small': '12.5rem',
    'topbar-height': '90px',
    'layout-columns': true,
    'layout-rows': true,
    'layout-gutter': true,
    'layout-columns-gutter': true,
    'layout-four-columns': true,
    'layout-four-columns-gutter': true,
    'layout-three-columns': true,
    'layout-three-columns-gutter': true,
    'layout-two-columns': true,
    'layout-two-columns-gutter': true,
    'layout-sidebar': true,
    'layout-sidebar-small': true,
    'layout-sidebar-gutter': true,
    'layout-sidebar-small-gutter': true,
    'layout-content': true,
    'layout-topbar': true
  },
  'shadows': {
    'up': '0 3px 12px 2px rgba(0, 0, 0, 0.25)',
    'none': 'none'
  }
};
