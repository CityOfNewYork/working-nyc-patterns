'use strict';

import Toggle from '@nycopportunity/pttrn-scripts/src/toggle/toggle';

/**
 * @class  Dropdown
 *
 * Usage
 *
 * Element Attributes. Either <a> or <button>
 *
 * @attr  data-js="dropdown"         Instantiates the toggling method
 * @attr  aria-controls=""           Targets the id of the dropdown
 * @attr  aria-expanded="false"      Declares target closed/open when toggled
 * @attr  data-dropdown="open"       Designates the primary opening element of the dropdown
 * @attr  data-dropdown="close"      Designates the primary closing element of the dropdown
 * @attr  data-dropdown-lock="true"  Wether to lock screen scrolling when drodown is open
 *
 * Target Attributes. Any <element>
 *
 * @attr  id=""               Matches aria-controls attr of Element
 * @attr  class="hidden"      Hidden class
 * @attr  aria-hidden="true"  Declares target open/closed when toggled
 */
class Dropdown {
  /**
   * @constructor  Instantiates dropdown and toggle method
   *
   * @return  {Object}  The instantiated dropdown with properties
   */
  constructor() {
    this.selector = Dropdown.selector;

    this.selectors = Dropdown.selectors;

    this.classes = Dropdown.classes;

    this.dataAttrs = Dropdown.dataAttrs;

    this.toggle = new Toggle({
      selector: this.selector,
      after: (toggle) => {
        let active = toggle.target.classList.contains(Toggle.activeClass);

        // Lock the body from scrolling if lock attribute is present
        if (active && toggle.element.dataset[this.dataAttrs.LOCK] === 'true') {
          // Scroll to the top of the page
          window.scroll(0, 0);

          // Prevent scrolling on the body
          document.querySelector('body').classList.add(this.classes.OVERFLOW);

          // When the last focusable item in the list looses focus loop to the first
          toggle.focusable.item(toggle.focusable.length - 1)
            .addEventListener('blur', () => {
              toggle.focusable.item(0).focus();
            });
        } else {
          // Remove if all other dropdown body locks are inactive
          let locks = document.querySelectorAll([
              this.selector,
              this.selectors.locks,
              `.${Toggle.activeClass}`
            ].join(''));

          if (locks.length === 0) {
            document.querySelector('body').classList.remove(this.classes.OVERFLOW);
          }
        }

        // Focus on the close or open button if present
        let id = `[aria-controls="${toggle.target.getAttribute('id')}"]`;
        let close = document.querySelector(this.selectors.CLOSE + id);
        let open = document.querySelector(this.selectors.OPEN + id);

        if (active && close) {
          close.focus();
        } else if (open) {
          open.focus();
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
  CLOSE: '[data-dropdown*="close"]',
  OPEN: '[data-dropdown*="open"]',
  LOCKS: '[data-dropdown-lock="true"]'
};

/** @type  {Object}  Data attribute namespaces */
Dropdown.dataAttrs = {
  LOCK: 'dropdownLock'
};

/** @type  {Object}  Various classes used by the script */
Dropdown.classes = {
  OVERFLOW: 'overflow-hidden'
};

export default Dropdown;
