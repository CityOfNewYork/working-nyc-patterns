'use strict';

import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

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
      after: (toggle) => {
        let el = document.querySelector(SearchBox.selector);
        let input = document.querySelector(SearchBox.selectors.input);

        if (el.className.includes('active') && input) {
          input.focus();
        }
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

SearchBox.selectors = {
  input: '[data-js*="search-box__input"]'
};

export default SearchBox;
