/**
 * Config
 */

const package = require('../package.json');
const merge = require('deepmerge');

const grid = '8px';

const spacing = {
  '0': '0',
  '1': 'calc(var(--wnyc-grid) * 1)',
  '2': 'calc(var(--wnyc-grid) * 2)',
  'DEFAULT': 'calc(var(--wnyc-grid) * 3)', // Grid × 3 = 24px
  '3': 'calc(var(--wnyc-grid) * 3)',
  '4': 'calc(var(--wnyc-grid) * 4)',
  '5': 'calc(var(--wnyc-grid) * 5)',
  '6': 'calc(var(--wnyc-grid) * 6)',
  '7': 'calc(var(--wnyc-grid) * 7)',
  '8': 'calc(var(--wnyc-grid) * 8)'
};

const color = {
  'default-0': '#03142C',
  'default-1': '#031837',
  'default-2': '#071F42',
  'default-3': '#0C264D',
  'default-4': '#122F5A',

  'light-0': '#FFFFFF',
  'light-1': '#FAFDFF',
  'light-2': '#F0F6FA',
  'light-3': '#E3F1FD',
  'light-4': '#C9E7FC',
  'light-5': '#B8E0FC',

  'blue-d-1': '#00369F',
  'blue': '#004CBE',
  'blue-l-1': '#217CEB',
  'blue-l-2': '#53B3FC',
  'blue-l-3': '#C9EEFE',

  'green-d-1': '#007539',
  'green': '#006333',
  'green-l-1': '#008E46',
  'green-l-2': '#4BAC4C',
  'green-l-3': '#A8DD7C',
  'green-l-4': '#DFEED2',

  'yellow-d-4': '#5C3D00',
  'yellow-d-3': '#8F5F00',
  'yellow-d-2': '#AD7200',
  'yellow-d-1': '#D99000',
  'yellow': '#FFBE17',
  'yellow-l-1': '#FFD466',
  'yellow-l-2': '#FFDF8D',
  'yellow-l-3': '#FFF0C7',

  'red': '#CF2A46',
  'red-l-1': '#F1647C',
  'red-l-2': '#FC9CAC',

  'purple': '#4439BE',
  'purple-l-1': '#7C72ED',
  'purple-l-2': '#A9ACFC',

  'black': '#000000',
  'white': '#FFFFFF',

  'transparent': 'rgba(255, 255, 255, 0)',
  'inherit': 'inherit',

  'text': 'var(--wnyc-text)',
  'brand': 'var(--wnyc-brand)',
  'alt': 'var(--wnyc-alt)',
  'em': 'var(--wnyc-em)',
  'primary': 'var(--wnyc-primary)',
  'secondary': 'var(--wnyc-secondary)',
  'tertiary': 'var(--wnyc-tertiary)',

  'scale-0': 'var(--wnyc-scale-0)',
  'scale-1': 'var(--wnyc-scale-1)',
  'scale-2': 'var(--wnyc-scale-2)',
  'scale-3': 'var(--wnyc-scale-3)',
  'scale-4': 'var(--wnyc-scale-4)'
};

const colorTokens = {
  'text': 'var(--wnyc-color-white)',
  'brand': 'var(--wnyc-color-blue-l-2)',
  'alt': 'var(--wnyc-color-blue-l-3)',
  'em': 'var(--wnyc-color-yellow-l-2)',
  'error': 'var(--wnyc-color-yellow-l-2)',

  'primary': 'var(--wnyc-color-blue-l-1)',
  'secondary': 'var(--wnyc-color-green-l-3)',
  'tertiary': 'var(--wnyc-color-yellow-l-2)',

  'link': 'var(--wnyc-color-blue-l-2)',
  'link-hover': 'var(--wnyc-color-blue-l-3)',
  // 'link-visited': 'var(--wnyc-color-purple-l-2)',
  'link-visited': 'var(--wnyc-color-blue-l-3)',

  'focus': 'var(--wnyc-color-blue-l-2)',
  'focus-background': 'var(--wnyc-background)',

  'background': 'var(--wnyc-scale-1)',

  'webkit-font-smoothing': 'antialiased', // true
  'moz-osx-font-smoothing': 'grayscale', // true

  'scale': {
    '0': 'var(--wnyc-color-default-0)',
    '1': 'var(--wnyc-color-default-1)',
    '2': 'var(--wnyc-color-default-2)',
    '3': 'var(--wnyc-color-default-3)',
    '4': 'var(--wnyc-color-default-4)'
  },

  'card': {
    'header': 'var(--wnyc-scale-3)',
    'body': 'var(--wnyc-scale-4)'
  },

  'modal': {
    'text': 'var(--wnyc-scale-1)',
    'alt': 'var(--wnyc-scale-2)',

    'background': 'var(--wnyc-color-blue-l-3)',

    'link': 'var(--wnyc-scale-4)',
    'link-hover': 'var(--wnyc-scale-3)',
    'link-visited': 'var(--wnyc-scale-3)',

    'smoothing': false
  },

  'input': {
    'text': 'var(--wnyc-scale-1)',
    'background': 'var(--wnyc-color-white)',
    'border': 'var(--wnyc-color-transparent)'
  },

  'option': {
    'text': 'var(--wnyc-color-blue-l-2)',
    'background': 'var(--wnyc-scale-2)',
    'border': 'var(--wnyc-color-transparent)',

    'text-hover ': 'var(--wnyc-color-blue-l-3)',
    'border-hover': 'var(--wnyc-color-transparent)',
    'background-hover': 'var(--wnyc-scale-0)',

    'text-checked': 'var(--wnyc-color-blue-l-3)',
    'background-checked': 'var(--wnyc-scale-0)',

    'graphic-checkbox': 'var(--wnyc-color-transparent)',
    'graphic-checkbox-checked': 'var(--wnyc-scale-0)'
  },

  'statuses': {
    'primary': {
      'text': 'var(--wnyc-scale-2)',
      'background': 'var(--wnyc-color-blue-l-2)',
    },
    'secondary': {
      'text': 'var(--wnyc-scale-2)',
      'background': 'var(--wnyc-color-green-l-3)',
    },
    'tertiary': {
      'text': 'var(--wnyc-scale-2)',
      'background': 'var(--wnyc-color-yellow-l-1)',
    },
    'alt': {
      'text': 'var(--wnyc-scale-1)',
      'background': 'var(--wnyc-color-blue-l-3)'
    }
  },

  'button': {
    'primary': {
      'text': 'var(--wnyc-color-blue-l-2)',
      'text-hover': 'var(--wnyc-color-blue-l-3)',
      'background': 'var(--wnyc-scale-2)',
      'background-hover': 'var(--wnyc-scale-0)'
    },
    'secondary': {
      'text': 'var(--wnyc-color-green-l-3)',
      'text-hover': 'var(--wnyc-color-green-l-3)',
      'background': 'var(--wnyc-scale-2)',
      'background-hover': 'var(--wnyc-scale-0)'
    },
    'tertiary': {
      'text': 'var(--wnyc-color-yellow-l-2)',
      'text-hover': 'var(--wnyc-color-yellow-l-3)',
      'background': 'var(--wnyc-scale-2)',
      'background-hover': 'var(--wnyc-scale-0)'
    },
    'disabled': {
      'text': 'var(--wnyc-color-light-0)',
      'background': 'var(--wnyc-scale-2)'
    }
  },

  'badge': {
    'color': 'var(--wnyc-color-yellow-d-4)',
    'background': 'var(--wnyc-color-yellow-l-3)'
  },

  'table': {
    'odd': 'var(--wnyc-scale-3)',
    'even': 'var(--wnyc-scale-2)'
  },

  'descriptionList': {
    'term': 'var(--wnyc-alt)',
    'odd': 'var(--wnyc-scale-3)',
    'even': 'var(--wnyc-scale-2)',
    'border': 'var(--wnyc-scale-2)'
  },

  'code': {
    'text': 'var(--wnyc-color-blue-l-3)',
    'text-base': 'var(--wnyc-color-blue-l-3)',
    'text-keyword': 'var(--wnyc-color-blue-l-1)',
    'text-javascript': 'var(--wnyc-color-blue-l-3)',
    'text-css': 'var(--wnyc-color-blue-l-3)',
    'text-comment': 'var(--wnyc-color-purple-l-1)',
    'text-string': 'var(--wnyc-color-yellow-l-1)',
    'text-symbol': 'var(--wnyc-color-yellow-l-1)',
    'text-code': 'var(--wnyc-color-yellow-l-1)',
    'link': 'var(--wnyc-color-blue-l-3)',
    'background': 'var(--wnyc-color-default-2)',
    'border': 'var(--wnyc-color-transparent)',
    'webkit-font-smoothing': 'antialiased', // true
    'moz-osx-font-smoothing': 'grayscale' // true
  },

  'newsletter': {
    'heading': 'var(--wnyc-text-alt)',
    'text': 'inherit',
    'background': 'var(--wnyc-scale-2)'
  }
};

const light = merge(colorTokens, {
  'text': 'var(--wnyc-color-default-3)',
  'brand': 'var(--wnyc-color-blue)',
  'alt': 'var(--wnyc-text)',
  'em': 'var(--wnyc-color-yellow-d-4)',
  'error': 'var(--wnyc-color-red)',

  'primary': 'var(--wnyc-color-blue)',
  'secondary': 'var(--wnyc-color-green)',
  'tertiary': 'var(--wnyc-color-yellow-d-1)',

  'link': 'var(--wnyc-color-blue)',
  'link-hover': 'var(--wnyc-text)',
  // 'link-visited': 'var(--wnyc-color-purple)',
  'link-visited': 'var(--wnyc-text)',

  'focus': 'var(--wnyc-color-blue)',
  'focus-background': 'var(--wnyc-background)',

  'background': 'var(--wnyc-scale-1)',

  'webkit-font-smoothing': 'auto',  // false
  'moz-osx-font-smoothing': 'auto', // false

  'scale': {
    '0': 'var(--wnyc-color-light-0)',
    '1': 'var(--wnyc-color-light-1)',
    '2': 'var(--wnyc-color-light-2)',
    '3': 'var(--wnyc-color-light-3)',
    '4': 'var(--wnyc-color-light-4)'
  },

  'card': {
    'header': 'var(--wnyc-color-light-2)',
    'body': 'var(--wnyc-color-light-0)'
  },

  'modal': {
    'text': 'var(--wnyc-color-default-1)',
    'text-alt': 'var(--wnyc-scale-2)',
    'background': 'var(--wnyc-color-blue-l-3)',
    'link': 'var(--wnyc-color-blue)',
    'link-hover': 'var(--wnyc-color-default-1)',
    'link-visited': 'var(--wnyc-color-default-1)'
  },

  'input': {
    'text': 'var(--wnyc-color-default-1)',
    'background': 'var(--wnyc-color-white)',
    'border': 'var(--wnyc-color-default-1)'
  },

  'option': {
    'text': 'var(--wnyc-text)',
    'background': 'var(--wnyc-scale-2)',
    'border': 'var(--wnyc-color-transparent)',

    'text-hover ': 'var(--wnyc-link)',
    'border-hover': 'var(--wnyc-link)',
    'background-hover': 'var(--wnyc-scale-0)',

    'text-checked': 'var(--wnyc-color-blue)',
    'background-checked': 'var(--wnyc-scale-0)',

    'graphic-checkbox': 'var(--wnyc-color-transparent)',
    'graphic-checkbox-checked': 'var(--wnyc-scale-0)'
  },

  'statuses': {
    'primary': {
      'text': 'var(--wnyc-text)',
      'background': 'var(--wnyc-color-blue-l-3)',
    },
    'secondary': {
      'text': 'var(--wnyc-text)',
      'background': 'var(--wnyc-color-green-l-4)',
    },
    'tertiary': {
      'text': 'var(--wnyc-text)',
      'background': 'var(--wnyc-color-yellow-l-2)',
    },
    'alt': {
      'text': 'var(--wnyc-text)',
      'background': 'var(--wnyc-color-blue-l-3)'
    }
  },

  'button': {
    'primary': {
      'text': 'var(--wnyc-scale-0)',
      'text-hover': 'var(--wnyc-scale-0)',
      'background': 'var(--wnyc-color-blue)',
      'background-hover': 'var(--wnyc-color-blue-d-1)'
    },
    'secondary': {
      'text': 'var(--wnyc-scale-0)',
      'text-hover': 'var(--wnyc-scale-0)',
      'background': 'var(--wnyc-color-default-2)',
      'background-hover': 'var(--wnyc-color-default-4)'
    },
    'tertiary': {
      'text': 'var(--wnyc-text)',
      'text-hover': 'var(--wnyc-text)',
      'background': 'var(--wnyc-color-yellow-l-1)',
      'background-hover': 'var(--wnyc-color-yellow-l-2)'
    },
    'disabled': {
      'text': 'var(--wnyc-color-default-4)',
      'background': 'var(--wnyc-scale-3)'
    }
  },

  // 'code': {
  //   'text': 'var(--wnyc-color-blue-l-2)',
  //   'text-base': 'var(--wnyc-color-blue-l-2)',
  //   'text-keyword': 'var(--wnyc-color-blue)',
  //   'text-javascript': 'var(--wnyc-color-blue-l-2)',
  //   'text-css': 'var(--wnyc-color-blue-l-2)',
  //   'text-comment': 'var(--wnyc-color-blue-l-3)',
  //   'text-string': 'var(--wnyc-color-green-l-2)',
  //   'text-symbol': 'var(--wnyc-color-yellow-l-2)',
  //   'text-code': 'var(--wnyc-color-green-l-3)',
  //   'background': 'var(--wnyc-scale-3)',
  //   'border': 'var(--wnyc-color-transparent)'
  // },

  'newsletter': {
    'heading': 'var(--wnyc-color-white)',
    'text': 'var(--wnyc-color-white)',
    'background': 'var(--wnyc-color-default-3)',
    'webkit-font-smoothing': 'antialiased', // true
    'moz-osx-font-smoothing': 'grayscale', // true
  }
});

const shadow = {
  'up-default': '0 3px 12px 2px rgba(0, 0, 0, 0.15)',
  'up-light': '0 3px 12px 2px rgba(21, 60, 96, 0.13)'
};

module.exports = {
  'output': `"${process.env.PWD}/src/config/_tokens.scss"`,
  'stringKeys': 'stringKeys, fontFace-system, fontFace-nyc, fontFace-primary, fontFace-secondary, fontFace-code',
  'version': package.version,
  'cdn': `"https://cdn.jsdelivr.net/gh/cityofnewyork/nyco-wnyc-patterns@v${package.version}/dist/"`,
  'googleFonts': '"https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i,800,800i%7CMontserrat:400,400i,700"',
  'language': [
    'default',
    'ar',
    'es',
    'kr',
    'ur',
    'tc'
  ],
  'languageRtl': [
    'ar',
    'ur'
  ],
  'fontFace-system': 'ui-sans-serif, system-ui, sans-serif',
  'fontFace-nyc': '\'Helvetica Neue Pro\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
  'fontFace-primary': '\'Montserrat\', sans-serif',
  'fontFace-secondary': '\'Lato\', sans-serif',
  'fontFace-code': 'monospace',
  'fontFamily': {
    'body': 'var(--wnyc-fontFace-secondary)',
    'h1': 'var(--wnyc-fontFace-primary)',
    'h2': 'var(--wnyc-fontFace-primary)',
    'h3': 'var(--wnyc-fontFace-primary)',
    'blockquote': 'var(--wnyc-fontFace-primary)',
    'h4': 'var(--wnyc-fontFace-secondary)',
    'h5': 'var(--wnyc-fontFace-secondary)',
    'h6': 'var(--wnyc-fontFace-secondary)',
    'p': 'var(--wnyc-fontFace-secondary)',
    'button': 'var(--wnyc-fontFace-secondary)',
    'tables': 'var(--wnyc-fontFace-secondary)',
    'option': 'var(--wnyc-fontFace-secondary)',
    'question': 'var(--wnyc-fontFace-secondary)',
    'code': 'var(--wnyc-fontFace-code)',
    'primary': 'var(--wnyc-fontFace-primary)',
    'secondary': 'var(--wnyc-fontFace-secondary)',
    'inherit': 'inherit',
  },
  'fontWeight': {
    'body': 'normal',
    'h1': 'bold',
    'h2': 'bold',
    'h3': 'bold',
    'blockquote': 'normal',
    'h4': 'bold',
    'h5': 'bold',
    'h6': 'normal',
    'p': 'normal',
    'link': 'bold',
    'small': 'normal',
    'button': 'bold',
    'tables': 'normal',
    'normal': 'normal',
    'bold': '800',
    'option': 'bold',
    'question': 'normal',
    'code': 'normal'
  },
  'fontStyle': {
    'body': 'normal',
    'h1': 'normal',
    'h2': 'normal',
    'h3': 'normal',
    'blockquote': 'normal',
    'h4': 'normal',
    'h5': 'normal',
    'h6': 'italic',
    'p': 'normal',
    'link': 'normal',
    'small': 'normal',
    'button': 'normal',
    'tables': 'normal',
    'question': 'normal',
    'normal': 'normal',
    'italic': 'italic'
  },
  'fontSize': {
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
    'tables': '0.8rem',
    'option': 'inherit',
    'question': 'inherit',
    'code': '0.72rem'
  },
  'lineHeight': {
    'normal': 'normal',
    'body': 'normal',
    'h1': '1.2',
    'h2': '1.3',
    'h3': '1.3',
    'blockquote': '1.3',
    'h4': '1.1',
    'h5': 'normal',
    'h6': 'normal',
    'p': '1.6',
    'small': 'normal',
    'button': 'normal',
    'tables': 'normal',
    'option': 'normal',
    'question': 'normal',
    'code': '1.9'
  },
  'typography': {
    'small': '16px',
    'mobile': '18px',
    'tablet': '20px',
    'desktop': '22px',
    'margin-bottom': '1rem',
    'list-indent': '1.5rem'
  },
  'scale': {
    'default': [0, 1, 2, 3, 4],
    'light':   [0, 1, 2, 3, 4]
  },
  'color': color,
  'colorMode': {
    'default': {
      ...colorTokens,
      'shadow': {
        'up': shadow['up-default']
      }
    },
    'light': {
      ...light,
      'shadow': {
        'up': shadow['up-light']
      }
    }
  },
  'screen': {
    'desktop': '1112px', // Set minimum width for devices.
    'tablet': '768px',
    'mobile': '480px',
    'small': '400px',
    'max-width-offset': '0.02px' // There is a max width mixin but its is discouraged over min width
  },
  'grid': grid,
  'dimension': {
    'auto': 'auto',
    'full': '100%',
    'half': '50%',
    '90vh': '90vh',
    '100vh': '100vh',
    'mobile-menu-width': '80vw',
    'content-width': 'calc(var(--wnyc-grid) * 112)',    // '896px',
    'site-max-width': 'calc(var(--wnyc-grid) * 180)',   // '1440px',
    'site-min-width': 'calc(var(--wnyc-grid) * 40)',    // '320px',
    'navigation-logo': 'calc(var(--wnyc-grid) * 16)',   // '128px',
    'feedback-height': 'calc(var(--wnyc-grid) * 12.5)', // '100px', // Static reference. Overridden via JavaScript
    'navigation-height': 'calc(var(--wnyc-grid) * 10)', // '80px', // Static reference. Overridden via JavaScript
    'webshare-fallback': 'calc(var(--wnyc-grid) * 54)'  // '432px'
  },
  'z': {
    '0': 0,
    '10': 10,
    '20': 20,
    '30': 30,
    '40': 40,
    '50': 50,
    'footer': 0,
    'search': 1000,
    'navigation': 1010,
    'mobile-menu': 1020,
    'auto': 'auto',
  },
  'animate': {
    'ease-in': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)', // Quint
    'ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',        // Quint
    'duration': '0.25s',
    'timing-function': 'cubic-bezier(0.23, 1, 0.32, 1)'
  },
  'borderWidth': {
    '0': '0',
    'DEFAULT': '1px',
    '2': '2px',
    '3': '3px',
    '4': '4px',
    '5': '5px',
    '6': '6px',
    '7': '7px',
    '8': '8px'
  },
  'spacing': spacing,
  'margin': {
    ...spacing,
    'auto': 'auto'
  },
  'iconSize': {
    'default': ['1rem', '1rem'], // Equal to the base line height
    '1': [spacing['1'], spacing['1']],
    '2': [spacing['2'], spacing['2']],
    '3': [spacing['3'], spacing['3']],
    '4': [spacing['4'], spacing['4']],
    '5': [spacing['5'], spacing['5']],
    '6': [spacing['6'], spacing['6']],
    '7': [spacing['7'], spacing['7']],
    '8': [spacing['8'], spacing['8']],
    'logo-google-translate': ['175px', '16px'],
    'logo-standard-menu-item': ['130px', '18px'],
    'logo-homepage': ['186px', '18px'],
    'logo-stacked-menu-item': ['100px', '32px'],
    'logo-nyco-menu-item': ['150px', '17px'],
    'logo-partnership-footer': ['206px', '80px'],
    'logo-nyc-copyright': ['41px', '15px']
  },
  'focus': {
    'gap': '4px',
    'width': '4px'
  },
  'button': {
    'inner-size': '1rem',
    'radius': '5px',
    'radius-tag': '50px',
    'border-style': 'solid',
    'border-width': '2px',
    'variants': ['primary', 'secondary', 'tertiary']
  },
  'input': {
    'inner-size': '1rem',
    'radius': '0px',
    'border-style': 'solid',
    'border-width': '2px',
    'error-border-width': '4px',
    'icon-padding': '30px',
    'currency-font-size': '22px',
    'search-icon': [spacing['3'], spacing['3']]
  },
  'select': {
    'inner-size': '1rem',
    'radius': '5px',
    'border-style': 'solid',
    'border-width': '2px',
    'border-width': '2px',
    'stroke-width': '2px',
    'stroke-line': 'round'
  },
  'option': {
    'inner-size': '1rem',
    'radius': '5px',
    'border-style': 'solid',
    'border-width': '2px',
    'stroke-width': '2px',
    'stroke-line': 'round'
  },
  'badge': {
    'font-size': '90%',
    'font-weight': 'bold',
    'line-height': 'inherit',
    'text-transform': 'normal',
    'padding': '0 var(--wnyc-grid)',
    'radius': '10px',
    'small-line-height': '1.3',
    'small-padding': '0 calc(var(--wnyc-grid) * 0.5)'
  },
  'shadow': {
    ...shadow,
    'up': 'var(--wnyc-shadow-up)',
    'none': 'none'
  },
  'cell': {
    'padding': '0.8rem 1rem'
  }
};
