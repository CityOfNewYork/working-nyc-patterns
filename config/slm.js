/**
 * Config
 */

const package = require('../package.json');
const tokens = require('./tokens');
const tailwind = require('./tailwind');

/**
 * Config
 */

module.exports = {
  src: 'src',
  views: 'views',
  dist: 'dist',
  marked: {
    gfm: true,
    headerIds: true,
    smartypants: true
  },
  beautify: {
    indent_size: 2,
    indent_char: ' ',
    preserve_newlines: false,
    indent_inner_html: false,
    wrap_line_length: 0,
    inline: [],
    indent_inner_html: false,
  },
  package: package,
  tokens: tokens,
  tailwind: tailwind,
  process: {
    env: {
      NODE_ENV: process.env.NODE_ENV
    }
  },
  segments: [
    {
      name: 'Find Work',
      segments: [
        {
          name: 'Employment',
          segments: [
            {
              name: 'Employment Services'
            },
            {
              name: 'Coordination & Barrier Reduction'
            }
          ]
        },
        {
          name: 'Internships',
          segments: [
            {
              name: 'In School'
            },
            {
              name: 'Out of School'
            }
          ]
        }
      ]
    },
    {
      name: 'Get Skills'
    },
    {
      name: 'Education',
      segments: [
        {
          name: 'Adult (Basic & ESOL)'
        },
        {
          name: 'College Support'
        },
        {
          name: 'Bridge'
        },
        {
          name: 'College and Career Prep'
        }
      ]
    },
    {
      name: 'Careers',
      segments: [
        {
          name: 'Sectors'
        },
        {
          name: 'Occupations'
        }
      ]
    }
  ],
  sectors: [
    {
      name: 'Technology',
      occupations: [
        {name: 'Entrepreneurship'},
        {name: 'Software Development'},
        {name: 'Computer Technician'},
      ]
    },
    {
      name: 'Culinary',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Security',
      occupations: [
        {name: 'Security Guard'}
      ]
    },
    {
      name: 'Construction',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Business',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Healthcare',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Driving',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Theater',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Media',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Human Resources',
      occupations: [
        {name: 'Multiple'}
      ]
    },
    {
      name: 'Green Infrastructure',
      occupations: [
        {name: 'Multiple'}
      ]
    }
  ]
};
