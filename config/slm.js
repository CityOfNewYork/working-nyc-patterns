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
  newsletter: {
    action: 'https://nyc.us18.list-manage.com/subscribe/post?u=d04b7b607bddbd338b416fa89&id=aa67394696',
    boroughs: [
      {
        'id': 'mce-group[4369]-4369-0',
        'name': 'group[4369][1]',
        'value': '1',
        'label': 'Bronx'
      },
      {
        'id': 'mce-group[4369]-4369-4',
        'name': 'group[4369][16]',
        'value': '16',
        'label': 'Staten Island'
      },
      {
        'id': 'mce-group[4369]-4369-3',
        'name': 'group[4369][8]',
        'value': '8',
        'label': 'Queens'
      },
      {
        'id': 'mce-group[4369]-4369-1',
        'name': 'group[4369][2]',
        'value': '2',
        'label': 'Brooklyn'
      },
      {
        'id': 'mce-group[4369]-4369-2',
        'name': 'group[4369][4]',
        'value': '4',
        'label': 'Manhattan'
      }
    ]
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
