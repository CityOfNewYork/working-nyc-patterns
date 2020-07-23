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
  /**
   * Configuration
   */
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
  /**
   * Package Variables
   */
  package: package,
  tokens: tokens,
  tailwind: tailwind,
  process: {
    env: {
      NODE_ENV: process.env.NODE_ENV
    }
  },
  baseUrl: (process.env.NODE_ENV === 'production') ? package.homepage : '',
  links: {
    nycopportunity: {
      homepage: 'http://nyc.gov/opportunity',
      social: {
        github: 'https://github.com/nycopportunity',
        twitter:  'https://twitter.com/nycopportunity',
        facebook: 'https://www.facebook.com/nycopportunity',
        instagram: 'https://www.instagram.com/nycopportunity'
      }
    }
  },
  /**
   * Pattern Variables
   */
  newsletter: {
    action: 'https://nyc.us18.list-manage.com/subscribe/post?u=d04b7b607bddbd338b416fa89&id=aa67394696',
    boroughs: [
      {
        id: 'mce-group[4369]-4369-0',
        name: 'group[4369][1]',
        value: '1',
        label: 'Bronx'
      },
      {
        id: 'mce-group[4369]-4369-4',
        name: 'group[4369][16]',
        value: '16',
        label: 'Staten Island'
      },
      {
        id: 'mce-group[4369]-4369-3',
        name: 'group[4369][8]',
        value: '8',
        label: 'Queens'
      },
      {
        id: 'mce-group[4369]-4369-1',
        name: 'group[4369][2]',
        value: '2',
        label: 'Brooklyn'
      },
      {
        id: 'mce-group[4369]-4369-2',
        name: 'group[4369][4]',
        value: '4',
        label: 'Manhattan'
      }
    ]
  },
  programs: [
    {
      title: '<span data-program="plain-language-name">Commercial driver training</span>',
      subtitle: '<span data-program="title">Red Hook on the Road<span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <mark class="badge status-alt me-2" data-program="recruiting">
          Actively Recruiting
        </mark>

        <!-- <span class="flex me-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use xlink:href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex me-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use xlink:href="#icon-wnyc-ui-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `
        <p><span data-program="summary">Through this program students prepare
        to work as commercial drivers.</span> For
        <b class="text-alt" data-program="taxonomy.population">Unemployed New
        Yorkers</b> and <b class="text-alt" data-program="taxonomy.population">
        Adults</b>.</p>`,
      features: [
        {
          icon: 'icon-wnyc-ui-award',
          text: `<span>
            <span data-program="taxonomy.services">Job training</span>,&nbsp;
            <span data-program="taxonomy.services">job certification</span>
            </span>`
        },
        {
          icon: 'icon-wnyc-ui-info',
          text: '<span data-program="taxonomy.sector">Transportation</span>'
        },
        {
          icon: 'icon-wnyc-ui-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">4 weeks</span>,&nbsp;
            <span data-program="taxonomy.schedule">night class</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      title: '<span data-program="plain-language-name">HSE and job prep for youth</span>',
      subtitle: '<span data-program="title">Advance & Earn<span>',
      url: '/demos/programs/advance-and-earn',
      status: `
        <mark class="badge status-alt me-2" data-program="recruiting">
          Actively Recruiting
        </mark>

        <!-- <span class="flex me-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use xlink:href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex me-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use xlink:href="#icon-wnyc-ui-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `
        <p><span data-program="summary">Create a plan to achieve career and
        educational goals.</span> For
        <b class="text-alt" data-program="taxonomy.population">Unemployed New
        Yorkers</b> and <b class="text-alt" data-program="taxonomy.population">
        Youth (16–24)</b>.</p>`,
      features: [
        {
          icon: 'icon-wnyc-ui-award',
          text: `<span>
            <span data-program="taxonomy.services">Academic help</span>,&nbsp;
            <span data-program="taxonomy.services">paid work</span>,&nbsp;
            <span data-program="taxonomy.services">skill building</span>
            </span>`
        },
        {
          icon: 'icon-wnyc-ui-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">6 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">full time</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      title: '<span data-program="plain-language-name">Web development training</span>',
      subtitle: '<span data-program="title">Web Development Fellowship at Fullstack Academy<span>',
      url: '/demos/programs/web-development-fellowship-at-fullstack-academy',
      status: `
        <mark class="badge status-alt me-2" data-program="recruiting">
          Actively Recruiting
        </mark>

        <!-- <span class="flex me-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use xlink:href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex me-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use xlink:href="#icon-wnyc-ui-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">This program takes students
        from amateur to professional in 24 weeks.</span> For
        <b class="text-alt" data-program="taxonomy.population">Unemployed New
        Yorkers</b>, <b class="text-alt" data-program="taxonomy.population">
        Adults</b>, and <b class="text-alt" data-program="taxonomy.population">
        Low-income</b>.</p>`,
      features: [
        {
          icon: 'icon-wnyc-ui-award',
          text: `<span>
            <span data-program="taxonomy.services">Job training</span>,&nbsp;
            <span data-program="taxonomy.services">job prep</span>
            </span>`
        },
        {
          icon: 'icon-wnyc-ui-info',
          text: '<span data-program="taxonomy.sector">Technology</span>'
        },
        {
          icon: 'icon-wnyc-ui-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">6 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">full time</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      type: '<span data-program="sector">Health care</span>',
      title: '<span data-program="plain-language-name">Home health aide training</span>',
      subtitle: '<span data-program="title">SBS Home Health Aide Training<span>',
      url: '/demos/programs/web-development-fellowship-at-fullstack-academy',
      status: `
        <!-- <span class="flex me-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use xlink:href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex me-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use xlink:href="#icon-wnyc-ui-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">Prepare for a job in the
        healthcare field.</span> For
        <b class="text-alt" data-program="taxonomy.population">Adults</b>.</p>`,
      features: [
        {
          icon: 'icon-wnyc-ui-award',
          text: `<span>
            <span data-program="taxonomy.services">Job training</span>,&nbsp;
            <span data-program="taxonomy.services">job certification</span>
            </span>`
        },
        {
          icon: 'icon-wnyc-ui-info',
          text: '<span data-program="taxonomy.sector">Health care</span>'
        },
        {
          icon: 'icon-wnyc-ui-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">100 hours</span>,&nbsp;
            <span data-program="taxonomy.schedule">flexible</span>&nbsp;schedule
            <span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      type: '<span data-program="sector">Health care</span>',
      title: '<span data-program="plain-language-name">Math and reading for HSE Prep</span>',
      subtitle: '<span data-program="title">NYC DOE Basic Education Classes<span>',
      url: '/demos/programs/web-development-fellowship-at-fullstack-academy',
      status: `
        <!-- <span class="flex me-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use xlink:href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex me-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use xlink:href="#icon-wnyc-ui-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">Prepare for a job in the
        healthcare field.</span> For
        <b class="text-alt" data-program="taxonomy.population">Adults</b> and
        <b class="text-alt" data-program="taxonomy.population">Immigrant New
        Yorkers</b>.</p>`,
      features: [
        {
          icon: 'icon-wnyc-ui-award',
          text: `<span>
            <span data-program="taxonomy.services">Adult education</span>,&nbsp;
            <span data-program="taxonomy.services">HSE prep</span>
            </span>`
        },
        {
          icon: 'icon-wnyc-ui-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">3 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">varied</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      type: '<span data-program="sector">Health care</span>',
      title: '<span data-program="plain-language-name">Math and reading for HSE Prep</span>',
      subtitle: '<span data-program="title">NYC DOE Basic Education Classes<span>',
      url: '/demos/programs/web-development-fellowship-at-fullstack-academy',
      status: `
        <!-- <span class="flex me-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use xlink:href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex me-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use xlink:href="#icon-wnyc-ui-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">Prepare for a job in the
        healthcare field.</span> For
        <b class="text-alt" data-program="taxonomy.population">Adults</b> and
        <b class="text-alt" data-program="taxonomy.population">Immigrant New
        Yorkers</b>.</p>`,
      features: [
        {
          icon: 'icon-wnyc-ui-award',
          text: `<span>
            <span data-program="taxonomy.services">Adult education</span>,&nbsp;
            <span data-program="taxonomy.services">HSE prep</span>
            </span>`
        },
        {
          icon: 'icon-wnyc-ui-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">3 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">varied</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    }
  ],
  filters: [
    {
      legend: 'Services',
      options: [
        {label: 'Job training'},
        {label: 'Job certification'},
        {label: 'Job prep'},
        {label: 'Paid work'},
        {label: 'Job placement'},
        {label: 'Skill building'},
        {label: 'HSE prep'},
        {label: 'English language learning'},
      ]
    },
    {
      legend: 'Sectors',
      options: [
        {label: 'Transportation'},
        {label: 'Health care'},
        {label: 'Construction'},
        {label: 'Restaurant'},
        {label: 'Human resources'},
        {label: 'Marketing'},
        {label: 'Media'},
        {label: 'Security'},
        {label: 'Technology'},
        {label: 'Arts'},
        {label: 'Salon services'},
        {label: 'IT infrastructure'},
        {label: 'Manufacturing'}
      ]
    },
    {
      legend: 'Population',
      options: [
        {label: 'Adults (18+)'},
        {label: 'Youth (16–24)'},
        {label: 'Immigrant New Yorkers'},
        {label: 'Unemployed New Yorkers'},
        {label: 'Low-income New Yorkers'},
        {label: 'Seniors (55+)'},
        {label: 'NYCHA residents'},
        {label: 'People with disabilities'},
        {label: 'Veterans'}
      ]
    },
    {
      legend: 'Schedule',
      options: [
        {label: 'Full-time'},
        {label: 'Night classes'},
        {label: 'Weekends'},
        {label: 'Flexible'},
        {label: 'Varies'}
      ]
    },
    {
      legend: 'Location',
      options: [
        {label: 'Brooklyn'},
        {label: 'Bronx'},
        {label: 'Manhattan'},
        {label: 'Queens'},
        {label: 'Staten Island'},
        {label: 'Virtual'}
      ]
    }
  ],
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
  ],
  /**
   * Functions
   */
  createId: () => Math.random().toString(16).substring(2),
  createSlug: (s) => s.toLowerCase().replace(/[^0-9a-zA-Z - _]+/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-')
};
