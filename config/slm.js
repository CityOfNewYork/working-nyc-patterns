/**
 * Config
 */

const package = require('../package.json');
const tokens = require('./tokens');
const tailwind = require('./tailwindcss');

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
  urls: {
    tailwindDocs: 'https://tailwindcss.com/docs/'
  },
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
   * Newsletter Data
   *
   * @type {Array}
   */
  newsletter: {
    action: 'https://nyc.us18.list-manage.com/subscribe/post?u=d04b7b607bddbd338b416fa89&id=aa67394696',
    boroughs: [
      {
        id: 'mce-group[4369]-4369-0',
        name: 'group[4369][1]',
        value: '1',
        label: 'Bronx',
        class: 'mb-0'
      },
      {
        id: 'mce-group[4369]-4369-4',
        name: 'group[4369][16]',
        value: '16',
        label: 'Staten Island',
        class: 'mb-0'
      },
      {
        id: 'mce-group[4369]-4369-3',
        name: 'group[4369][8]',
        value: '8',
        label: 'Queens',
        class: 'mb-0'
      },
      {
        id: 'mce-group[4369]-4369-1',
        name: 'group[4369][2]',
        value: '2',
        label: 'Brooklyn',
        class: 'mb-0'
      },
      {
        id: 'mce-group[4369]-4369-2',
        name: 'group[4369][4]',
        value: '4',
        label: 'Manhattan',
        class: 'mb-0'
      }
    ]
  },

  /**
   * Sample Programs
   *
   * @type {Array}
   */
  programs: [
    {
      collection: 'training',
      title: '<span data-program="plain-language-name">Commercial driver training</span>',
      subtitle: '<b data-program="title">Red Hook on the Road</b> by <span data-program="provider">Brooklyn Workforce Innovations</span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <mark class="badge mie-2" data-program="recruiting">
          Actively recruiting
        </mark>

        <!-- <span class="flex mie-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <!-- <span class="flex mie-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use href="#icon-wnyc-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span> -->
      `,
      summary: `
        <p><span data-program="summary">Through this program students prepare
        to work as commercial drivers.</span> For
        <b class="text-em" data-program="taxonomy.population">Unemployed New
        Yorkers</b> and <b class="text-em" data-program="taxonomy.population">
        Adults</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Training for a new career</span>,&nbsp;
            <span data-program="taxonomy.services">job certification</span>
            </span>`
        },
        // {
        //   icon: 'feather-info',
        //   text: '<span data-program="taxonomy.sector">Transportation</span>'
        // },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">4 weeks</span>,&nbsp;
            <span data-program="taxonomy.schedule">evening</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'adult-education',
      title: '<span data-program="plain-language-name">HSE and job prep for youth</span>',
      subtitle: '<span data-program="title">Advance & Earn<span>',
      url: '/demos/programs/red-hook-on-the-road',
      // status: `
      //   <!-- <mark class="badge mie-2" data-program="recruiting">
      //     Actively recruiting
      //   </mark> -->

      //   <!-- <span class="flex mie-2" data-program="accessible">
      //     <svg aria-hidden="true" class="icon text-alt">
      //       <use href="#icon-wnyc-accessible"></use>
      //     </svg>

      //     <span class="sr-only">Accommodates Disabilities</span>
      //   </span> -->

      //   <!-- <span class="flex mie-2" data-program="multilingual">
      //     <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
      //       <use href="#icon-wnyc-translate"></use>
      //     </svg>

      //     <span class="sr-only">Accommodates Multiple Languages</span>
      //   </span> -->
      // `,
      summary: `
        <p><span data-program="summary">Create a plan to achieve career and
        educational goals.</span> For
        <b class="text-em" data-program="taxonomy.population">Unemployed New
        Yorkers</b> and <b class="text-em" data-program="taxonomy.population">
        Youth (16–24)</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Academic help</span>,&nbsp;
            <span data-program="taxonomy.services">paid work</span>,&nbsp;
            <span data-program="taxonomy.services">skill building</span>
            </span>`
        },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">6 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">full-time</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'training',
      title: '<span data-program="plain-language-name">Web development training</span>',
      subtitle: '<span data-program="title">Web Development Fellowship at Fullstack Academy<span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <mark class="badge mie-2" data-program="recruiting">
          Actively recruiting
        </mark>

        <!-- <span class="flex mie-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <!-- <span class="flex mie-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use href="#icon-wnyc-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span> -->
      `,
      summary: `<p><span data-program="summary">This program takes students
        from amateur to professional in 24 weeks.</span> For
        <b class="text-em" data-program="taxonomy.population">Unemployed New
        Yorkers</b>, <b class="text-em" data-program="taxonomy.population">
        Adults</b>, and <b class="text-em" data-program="taxonomy.population">
        Low-income</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Job training</span>,&nbsp;
            <span data-program="taxonomy.services">job prep</span>
            </span>`
        },
        // {
        //   icon: 'feather-info',
        //   text: '<span data-program="taxonomy.sector">Technology</span>'
        // },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">6 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">full time</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'training',
      type: '<span data-program="sector">Health care</span>',
      title: '<span data-program="plain-language-name">Home health aide training</span>',
      subtitle: '<span data-program="title">SBS Home Health Aide Training<span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <mark class="badge mie-2" data-program="recruiting">
          Actively recruiting
        </mark>

        <!-- <span class="flex mie-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <!-- <span class="flex mie-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use href="#icon-wnyc-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span> -->
      `,
      summary: `<p><span data-program="summary">Prepare for a job in the
        healthcare field.</span> For
        <b class="text-em" data-program="taxonomy.population">Adults (18+)</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Job training</span>,&nbsp;
            <span data-program="taxonomy.services">job certification</span>
            </span>`
        },
        // {
        //   icon: 'feather-info',
        //   text: '<span data-program="taxonomy.sector">Health care</span>'
        // },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">100 hours</span>,&nbsp;
            <span data-program="taxonomy.schedule">flexible</span>&nbsp;schedule
            <span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'adult-education',
      title: '<span data-program="plain-language-name">Math and reading for HSE Prep</span>',
      subtitle: '<span data-program="title">NYC DOE Basic Education Classes<span>',
      url: '/demos/programs/red-hook-on-the-road',
      // status: `
      //   <!-- <span class="flex mie-2" data-program="accessible">
      //     <svg aria-hidden="true" class="icon text-alt">
      //       <use href="#icon-wnyc-accessible"></use>
      //     </svg>

      //     <span class="sr-only">Accommodates Disabilities</span>
      //   </span> -->

      //   <!-- <span class="flex mie-2" data-program="multilingual">
      //     <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
      //       <use href="#icon-wnyc-translate"></use>
      //     </svg>

      //     <span class="sr-only">Accommodates Multiple Languages</span>
      //   </span> -->
      // `,
      summary: `<p>For
        <b class="text-em" data-program="taxonomy.population">Adults</b> and
        <b class="text-em" data-program="taxonomy.population">Immigrant New
        Yorkers</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Adult education</span>,&nbsp;
            <span data-program="taxonomy.services">HSE prep</span>
            </span>`
        },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">3 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">varied</span>&nbsp;schedule
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'adult-education',
      title: '<span data-program="plain-language-name">Classes to improve English skills</span>',
      subtitle: '<span data-program="title">English for Speakers of Other Languages<span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <!-- <span class="flex mie-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex mie-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use href="#icon-wnyc-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">English language learners in the
        Flatbush/East Flatbush communities get help with language and math
        skills.</span> For
        <b class="text-em" data-program="taxonomy.population">Immigrant New Yorkers</b> and
        <b class="text-em" data-program="taxonomy.population">Young Adults (16–24)</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Improving English skills</span>
            </span>`
        },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">3 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">daytime</span>, or&nbsp;
            <span data-program="taxonomy.schedule">part-time</span>
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'adult-education',
      title: '<span data-program="plain-language-name">Career-focused English learning</span>',
      subtitle: '<span data-program="title">NYPL English for Work Classes<span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <!-- <span class="flex mie-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex mie-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use href="#icon-wnyc-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">Intermediate and Advanced
        speakers can improve English skills aimed at finding a new job or
        career.</span> For
        <b class="text-em" data-program="taxonomy.population">Immigrant New Yorkers</b> and
        <b class="text-em" data-program="taxonomy.population">Adults (18+)</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">English language learning</span>,&nbsp;
            <span data-program="taxonomy.services">help finding work</span>
            </span>`
        },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">Less than 3 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">evening</span>,&nbsp;
            <span data-program="taxonomy.schedule">weekend</span>, or&nbsp;
            <span data-program="taxonomy.schedule">part-time</span>
            </span>`
        }
      ],
      cta: 'Learn more'
    },
    {
      collection: 'training',
      title: '<span data-program="plain-language-name">Bilingual commercial driver training</span>',
      subtitle: '<span data-program="title">Sunset Park Bridge to Commercial Driving<span>',
      url: '/demos/programs/red-hook-on-the-road',
      status: `
        <mark class="badge mie-2" data-program="recruiting">
          Actively recruiting
        </mark>

        <!-- <span class="flex mie-2" data-program="accessible">
          <svg aria-hidden="true" class="icon text-alt">
            <use href="#icon-wnyc-accessible"></use>
          </svg>

          <span class="sr-only">Accommodates Disabilities</span>
        </span> -->

        <span class="flex mie-2" data-program="multilingual">
          <svg aria-hidden="true" class="icon-wnyc-ui text-alt">
            <use href="#icon-wnyc-translate"></use>
          </svg>

          <span class="sr-only">Accommodates Multiple Languages</span>
        </span>
      `,
      summary: `<p><span data-program="summary">This program includes classes to
        improve English skills followed by training to become a commercial
        driver.</span> For
        <b class="text-em" data-program="taxonomy.population">Immigrant New Yorkers</b> and
        <b class="text-em" data-program="taxonomy.population">Adults (18+)</b>.</p>`,
      features: [
        {
          feature: 'Services',
          icon: 'feather-award',
          text: `<span>
            <span data-program="taxonomy.services">Training for a new career</span>,&nbsp;
            <span data-program="taxonomy.services">English language learning</span>
            </span>`
        },
        {
          feature: 'Schedule',
          icon: 'feather-calendar',
          text: `<span>
            <span data-program="taxonomy.duration">Less than 3 months</span>,&nbsp;
            <span data-program="taxonomy.schedule">full-time</span>
            </span>`
        }
      ],
      cta: 'Learn more'
    }
  ],

  /**
   * Survey Questions
   *
   * @type {Array}
   */
  survey: [
    {
      legend: 'Population',
      options: [
        {label: 'You’re between 16 and 24 years old'},
        {label: 'You’re over 55 years old'},
        {label: 'You’re an immigrant'},
        {label: 'You live in NYCHA housing'},
        {label: 'You have a disability '},
        {label: 'You’ve been impacted by the justice system'},
        {label: 'You get public assistance'},
        {label: 'You’re unemployed or have a low income'},
        {label: 'You’re an adult age 18+'},
        {label: 'You’re not sure'}
      ]
    },
    {
      legend: 'Services',
      options: [
        {label: 'Skills for a new job or career'},     // Training for a new career
        {label: 'Help applying for jobs'},             // Help applying for work
        {label: 'An internship or short-term job'},    // Internship and short-term work
        {label: 'Your high school equivalency (GED)'}, // High school equivalency (GED) prep
        {label: 'Better English language skills'},     // English language learning
        {label: 'I\'m not sure'}
      ]
    },
    {
      legend: 'Schedule',
      options: [
        {label: 'Daytime'},
        {label: 'Evening'},
        {label: 'Weekend'},
        {label: 'Part-time'},
        {label: 'Full-time'},
        {label: 'You need a flexible schedule'},
        {label: 'You’re not sure'}
      ]
    }
  ],

  /**
   * Program Filters
   *
   * @type {Array}
   */
  filters: [
    {
      legend: 'Services',
      options: [
        {label: 'Training for a new career'},
        {label: 'Help applying for work'},
        {label: 'Internship and short-term work'},
        {label: 'High school equivalency (GED) prep'},
        {label: 'English language learning'}
        // {label: 'Job training'},
        // {label: 'Job certification'},
        // {label: 'Job prep'},
        // {label: 'Paid work'},
        // {label: 'Job placement'},
        // {label: 'Skill building'},
        // {label: 'HSE prep'},
        // {label: 'English language learning'}
      ]
    },
    // {
    //   legend: 'Sectors',
    //   options: [
    //     {label: 'Transportation'},
    //     {label: 'Health care'},
    //     {label: 'Construction'},
    //     {label: 'Restaurant'},
    //     {label: 'Human resources'},
    //     {label: 'Marketing'},
    //     {label: 'Media'},
    //     {label: 'Security'},
    //     {label: 'Technology'},
    //     {label: 'Arts'},
    //     {label: 'Salon services'},
    //     {label: 'IT infrastructure'},
    //     {label: 'Manufacturing'}
    //   ]
    // },
    {
      legend: 'Population',
      options: [
        {label: 'Young adults (16–24)'},
        {label: 'Adults (18+)'},
        {label: 'Older adults (55+)'},
        {label: 'Immigrant New Yorker'},
        {label: 'NYCHA residents'},
        {label: 'People with disabilities'},
        {label: 'People with justice involvement'},
        {label: 'Public assistance recipients'},
        {label: 'Low-income New Yorker'},
        // {label: 'Adults (18+)'},
        // {label: 'Youth (16–24)'},
        // {label: 'Immigrant New Yorkers'},
        // {label: 'Unemployed New Yorkers'},
        // {label: 'Low-income New Yorkers'},
        // {label: 'Seniors (55+)'},
        // {label: 'NYCHA residents'},
        // {label: 'People with disabilities'},
        // {label: 'Veterans'}
      ]
    },
    {
      legend: 'Schedule',
      options: [
        {label: 'Daytime'},
        {label: 'Evening'},
        {label: 'Weekend'},
        {label: 'Part-time'},
        {label: 'Full-time'},
        {label: 'Flexible'}
        // {label: 'Full-time'},
        // {label: 'Night classes'},
        // {label: 'Weekends'},
        // {label: 'Flexible'},
        // {label: 'Varies'}
      ]
    },
    // {
    //   legend: 'Location',
    //   options: [
    //     {label: 'Brooklyn'},
    //     {label: 'Bronx'},
    //     {label: 'Manhattan'},
    //     {label: 'Queens'},
    //     {label: 'Staten Island'},
    //     {label: 'Virtual'}
    //   ]
    // }
  ],

  /**
   * Announcements Content
   *
   * @type {Array}
   */
  announcements: [
    {
      title: `
        <mark class="badge">New</mark> Money for heat and utility expenses
        <svg aria-hidden="true" class="icon-wnyc-ui rtl:flip">
          <use href="#feather-external-link"></use>
        </svg>
      `,
      url: '/demos/news/#',
      summary: `<p>The HEAP Program is open from November 2, 2020 to March 15, 2021.</p>`,
      features: [
        {
          feature: 'Last Updated',
          icon: 'feather-alert-triangle',
          text: '<span>Posted Tuesday, November 24th, 10:39am</span>'
        }
      ],
      webShare: true
    },
    {
      title: `
        Get no-cost or low-cost healthcare
        <svg aria-hidden="true" class="icon-wnyc-ui rtl:flip">
          <use href="#feather-external-link"></use>
        </svg>
      `,
      url: '/demos/news/#',
      summary: '<p>Available to those who don\'t qualify for government-sponsored health insurance.</p>',
      features: [
        {
          feature: 'Last Updated',
          icon: 'feather-alert-triangle',
          text: '<span>Posted Tuesday, November 24th, 10:39am</span>'
        }
      ],
      webShare: true
    },
    {
      title: `
        Help Avoiding Eviction
        <svg aria-hidden="true" class="icon-wnyc-ui rtl:flip">
          <use href="#feather-external-link"></use>
        </svg>
      `,
      url: '/demos/news/#',
      summary: '<p>Available regardless of immigration status.</p>',
      features: [
        {
          feature: 'Last Updated',
          icon: 'feather-alert-triangle',
          text: '<span>Posted Tuesday, November 24th, 10:39am</span>'
        }
      ],
      webShare: true
    },
    {
      title: `
        Low-cost and free health insurance
        <svg aria-hidden="true" class="icon-wnyc-ui rtl:flip">
          <use href="#feather-external-link"></use>
        </svg>
      `,
      url: '/demos/news/#',
      summary: '<p>Open enrollment through the New York State of Health is from November 1, 2020 to January 31, 2021.</p>',
      features: [
        {
          feature: 'Last Updated',
          icon: 'feather-alert-triangle',
          text: '<span>Posted Tuesday, November 24th, 10:39am</span>'
        }
      ],
      webShare: true
    }
  ],

  /**
   * Functions
   */
  createId: () => Math.random().toString(16).substring(2),
  createSlug: (s) => s.toLowerCase().replace(/[^0-9a-zA-Z - _]+/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-')
};
