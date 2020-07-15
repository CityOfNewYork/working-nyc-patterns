'use strict';

import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

class Dropdown {
  /**
   * @constructor
   *
   * @param  {Object}  settings  This could be some configuration
   *                             options. for the pattern module.
   * @param  {Object}  data      This could be a set of data needed
   *                             for the pattern module to render.

   * @return {Object}            The instantiated pattern
   */
  constructor() {
    this.selector = Dropdown.selector;

    this.selectors = Dropdown.selectors;

    this.classes = Dropdown.classes;

    this.toggle = new Toggle({
      selector: this.selector,
      after: (toggle) => {
        let body = document.querySelector('body');

        // Scroll to the top of the page
        window.scroll(0, 0);

        // Prevent scrolling on the body
        body.classList.toggle(this.classes.OVERFLOW);

        // Focus on the close or open button
        if (toggle.target.classList.contains(Toggle.activeClass)) {
          let close = document.querySelector(this.selectors.CLOSE);
          if (close) close.focus();
        } else {
          let open = document.querySelector(this.selectors.OPEN);
          if (open) open.focus();
        }
      }
    });

    return this;
  }
}

/** @type  {String}  Main DOM selector */
Dropdown.selector = '[data-js*=\"dropdown\"]';

/** @type  {Object}  Additional selectors used by the script */
Dropdown.selectors = {
  CLOSE: '[data-js-dropdown*="close"]',
  OPEN: '[data-js-dropdown*="open"]'
};

/** @type  {Object}  Various classes used by the script */
Dropdown.classes = {
  OVERFLOW: 'overflow-hidden'
};

export default Dropdown;
