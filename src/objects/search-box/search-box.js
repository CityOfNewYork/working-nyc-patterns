'use strict';

import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

// import MobileNav from 'src/objects/mobile-nav/mobile-nav';

/**
 * The SearchBox module
 *
 * @class
 */
class SearchBox {
  /**
   * @constructor
   *
   * @return {object} The class
   */
  constructor() {
    this._toggle = new Toggle({
      selector: SearchBox.selector,
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
SearchBox.selector = '[data-js*="search-box"]';

export default SearchBox;
