'use strict';

import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

// import Search from 'src/objects/search/search';

/**
 * The Mobile Nav module
 *
 * @class
 */
class MobileMenu {
  /**
   * @constructor
   *
   * @return {object} The class
   */
  constructor() {
    this._toggle = new Toggle({
      selector: MobileMenu.selector
    });

    return this;
  }
}

/**
 * The dom selector for the module
 * @type {String}
 */
MobileMenu.selector = '[data-js*="mobile-menu"]';

export default MobileMenu;
