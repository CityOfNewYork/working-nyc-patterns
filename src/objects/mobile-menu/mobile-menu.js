'use strict';

import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';

/**
 * The Mobile Nav module
 *
 * @class
 */
class MobileMenu {
  /**
   * @constructor
   *
   * @return  {object}  The class
   */
  constructor() {
    this.selector = MobileMenu.selector;

    this.selectors = MobileMenu.selectors;

    this.toggle = new Toggle({
      selector: this.selector,
      after: toggle => {
        // Shift focus from the open to the close button in the Mobile Menu when toggled
        if (toggle.target.classList.contains(Toggle.activeClass)) {
          toggle.target.querySelector(this.selectors.CLOSE).focus();

          // When the last focusable item in the list looses focus loop to the first
          toggle.focusable.item(toggle.focusable.length - 1)
            .addEventListener('blur', () => {
              toggle.focusable.item(0).focus();
            });
        } else {
          document.querySelector(this.selectors.OPEN).focus();
        }
      }
    });

    return this;
  }
}

/** @type  {String}  The dom selector for the module */
MobileMenu.selector = '[data-js*="mobile-menu"]';

/** @type  {Object}  Additional selectors used by the script */
MobileMenu.selectors = {
  CLOSE: '[data-js-mobile-menu*="close"]',
  OPEN: '[data-js-mobile-menu*="open"]'
};

export default MobileMenu;
