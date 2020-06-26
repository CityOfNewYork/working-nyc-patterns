/**
 * Config
 */

const package = require('../package.json');

module.exports = {
  'output': '"./src/config/_tokens.scss"',
  'version': package.version,
  'cdn': `"https://cdn.jsdelivr.net/gh/cityofnewyork/nyco-wnyc-patterns@v${package.version}/dist/"`,
  'google-fonts': '"https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i%7CMontserrat:400,400i,700"',
  'languages': [
    'default',
    'ar',
    'es',
    'kr',
    'ur',
    'tc'
  ],
  'languages-rtl': [
    'ar',
    'ur'
  ],
  'font-family': {
    'system': [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen-Sans',
      'Ubuntu',
      'Cantarell',
      '"Helvetica Neue"',
      'sans-serif'
    ],
    'inherit': 'inherit',
    'primary': [
      '"Montserrat"',
      'sans-serif'
    ],
    'primary-ar': [],
    'primary-zh-hant': [],
    // ...
    'secondary': [
      '"Lato"',
      'sans-serif'
    ],
    'secondary-ar': [],
    'secondary-zh-hant': [],
    // ...
    'code': ['monospace']
  },
  'font': {
    'body': 'primary',
    'h1': 'primary',
    'h2': 'primary',
    'h3': 'primary',
    'blockquote': 'primary',
    'h4': 'primary',
    'h5': 'primary',
    'h6': 'primary',
    'p': 'secondary',
    'button': 'secondary',
    'option': 'secondary',
    'code': 'code',
  },
  'font-weight': {
    'body': 'normal',
    'h1': 'bold',
    'h2': 'bold',
    'h3': 'bold',
    'blockquote': 'normal',
    'h4': 'normal',
    'h5': 'bold',
    'h6': 'italic',
    'p': 'normal',
    'small': 'normal',
    'button': 'bold',
    'normal': 'normal',
    'bold': 'bold',
    'option': 'bold'
  },
  'font-size': {
    'body': '1rem',
    'h1': '3rem',
    'h2': '2.5rem',
    'h3': '2rem',
    'blockquote': '2rem',
    'h4': '1.5rem',
    'h5': '1rem',
    'h6': '1rem',
    'p': '0.9rem',
    'small': '0.72rem',
    'button': '1rem',
    'option': 'inherit'
  },
  'line-height': {
    'normal': 'normal',
    'body': 'normal',
    'h1': '1.2',
    'h2': '1.3',
    'h3': '1.3',
    'blockquote': '1.3',
    'h4': 'normal',
    'h5': 'normal',
    'h6': 'normal',
    'p': '1.5',
    'small': 'normal',
    'button': 'normal',
    'option': 'normal'
  },
  'typography': {
    'desktop': '22px',
    'tablet': '20px',
    'mobile': '18px',
    'sm-mobile': '16px',
    'margin-bottom': '1rem'
  },
  'links': {
    'font-weight': 'bold',
    'text-decoration': 'underline'
  },
  'colors': {
    'scale-0': 'var(--color-scale-0)',
    'scale-1': 'var(--color-scale-1)',
    'scale-2': 'var(--color-scale-2)',
    'scale-3': 'var(--color-scale-3)',
    'scale-4': 'var(--color-scale-4)',
    'default': {
      '0': '#03142C',
      '1': '#031837',
      '2': '#071F42',
      '3': '#0C264D',
      '4': '#003C7A'
    },
    'dark': {
      '0': '#171717',
      '1': '#1C1C1C',
      '2': '#252525',
      '3': '#2D2D2D',
      '4': '#3D3D3D'
    },
    'mid': {
      '0': '#203A60',
      '1': '#284777',
      '2': '#2A4E83',
      '3': '#31568C',
      '4': '#336599'
    },
    'light': {
      '1': '#FFFFFF',
      '2': '#FCFCFC',
      '3': '#F7F7F7',
      '4': '#F0F0F0'
    },
    'blue': '#1E78BE',
    'blue-l-1': '#3194E0',
    'blue-l-2': '#68B7F4',
    'blue-l-3': '#C9EEFE',
    'green': '#006333',
    'green-l-1': '#008E46',
    'green-l-2': '#4BAC4C',
    'green-l-3': '#A8DD7C',
    'yellow-d-2': '#755C00',
    'yellow-d-1': '#8F6F00',
    'yellow': '#FFD029',
    'yellow-l-1': '#FAD457',
    'yellow-l-2': '#F6D772',
    'yellow-l-3': '#FDE9A6',
    'black': '#000000',
    'white': '#FFFFFF',
    'transparent': 'rgba(255, 255, 255, 0)',
    'inherit': 'inherit'
  },
  'color-modes': {
    'default': {
      'text': 'white',
      'text-alt': 'blue-l-3',
      'text-primary': 'blue-l-1',
      'text-secondary': 'green-l-3',
      'text-tertiary': 'yellow-l-2',
      'hyperlinks': 'blue-l-1',
      'hyperlinks-hover': 'blue-l-3',
      'hyperlinks-visited': 'blue-l-3',
      'background': 'scale-1',
      'smoothing': true,

      'card-header': 'scale-2',
      'card-body': 'scale-3',

      'modal': {
        'text': 'scale-1',
        'text-alt': 'scale-2',
        'background': 'blue-l-3',
        'hyperlinks': 'scale-4',
        'hyperlinks-hover': 'scale-3',
        'hyperlinks-visited': 'scale-3',
        'smoothing': false
      },

      'input-text': 'default-1',
      'input-background': 'white',

      'option': {
        'text': 'blue',
        'background': 'scale-2',
        'border': 'transparent',

        'text-hover ': 'blue-l-3',
        'border-hover': 'blue-l-3',
        'background-hover': 'scale-0',

        'text-focus': 'blue-l-3',
        'border-focus': 'blue-l-3',
        'background-focus': 'scale-0',

        'text-checked': 'blue-l-3',
        'background-checked': 'scale-0',

        'graphic-checkbox': 'tranparent',
        'graphic-checkbox-checked': 'scale-0'
      },

      'button': {
        'primary': {
          'text': 'blue-l-1',
          'text-hover': 'blue-l-2',
          'background': 'scale-2',
          'background-hover': 'scale-0'
        },
        'secondary': {
          'text': 'green-l-3',
          'text-hover': 'green-l-3',
          'background': 'scale-2',
          'background-hover': 'scale-0'
        },
        'tertiary': {
          'text': 'yellow-l-2',
          'text-hover': 'yellow-l-3',
          'background': 'scale-2',
          'background-hover': 'scale-0'
        }
      },

      'shadow-up': '0 3px 12px 2px rgba(0, 0, 0, 0.25)',

      'code': {
        'text': '',
        'background': '',
        'border': ''
      }
    }
  },
  'screens': {
    'desktop': '960px',
    'tablet': '768px',
    'mobile': '480px',
    'mobile-small': '400px'
  },
  'grid': '8px',
  'dimensions': {
    'spacing-base': 3, // × grid
    'mobile-menu-width': '80vw',
    'content-width': '1024px',
    'site-max-width': '1440px',
    'site-min-width': '320px',
    'navigation-logo': '128px',
    'navigation-height-mobile': '80px', // size is actually determined by padding, etc. this is a reference for other components
    'footer-height-mobile-sm': '427px',
    'footer-height-mobile': '581px',
    'footer-height-tablet': '448px',
    'side-bar-width': '18.5rem',
    'side-bar-width-small': '12.5rem',
    'topbar-height': '80px'
  },
  'z': {
    '0': 0,
    '10': 10,
    '20': 20,
    '30': 30,
    '40': 40,
    '50': 50,
    'footer': 0,
    'search-box': 1000,
    'navigation': 1010,
    'auto': 'auto',
  },
  'animate': {
    'ease-in': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)', // Quint
    'ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)', // Quint
    'duration': '0.5s',
    'timing-function': 'cubic-bezier(0.23, 1, 0.32, 1)'
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
    'default': ['1rem', '1rem'], // = the base line height
    '1': ['8px', '8px'],
    '2': ['16px', '16px'],
    '3': ['24px', '24px'],
    '4': ['32px', '32px'],
    '5': ['40px', '40px'],
    '6': ['48px', '48px'],
    '7': ['56px', '56px'],
    '8': ['64px', '64px'],
    'logo-standard-menu-item': ['130px', '18px'],
    'logo-standard-tagline': ['320px', '30px'],
    'logo-stacked-menu-item': ['100px', '32px'],
    'logo-nyco-menu-item': ['150px', '17px'],
    'logo-nyc-copyright': ['41px', '15px']
  },
  'buttons': {
    'inner-size': '1rem',
    'radius': '5px',
    'radius-tag': '50px'
  },
  'options': {
    'inner-size': '1rem',
    'radius': '5px',
    'border-style': 'solid',
    'border-width': '2px',
    'stroke-width': '2px',
    'stroke-line': 'round'
  },
  'layouts': {
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
    'up': 'var(--shadow-up)',
    'none': 'none'
  }
};
