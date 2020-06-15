'use strict';

import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

// import SearchBox from 'src/objects/search-box/search-box';

/**
 * The Mobile Nav module
 *
 * @class
 */
class MobileNav {
  /**
   * @constructor
   *
   * @return {object} The class
   */
  constructor() {
    this._toggle = new Toggle({
      selector: MobileNav.selector,
      before: () => {

      }
    });

    return this;
  }
}

/**
 * The dom selector for the module
 * @type {String}
 */
MobileNav.selector = '[data-js*="mobile-nav"]';

export default MobileNav;
