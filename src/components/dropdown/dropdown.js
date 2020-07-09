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
    this.toggle = new Toggle({
      selector: Dropdown.selector,
      after: () => {
        let body = document.querySelector('body');

        window.scroll(0, 0);
        body.classList.toggle(Dropdown.classes.OVERFLOW);
      }
    });

    return this;
  }
}

/** @type  String  Main DOM selector */
Dropdown.selector = '[data-js*=\"dropdown\"]';

/** @type  Object  Various classes used by the script */
Dropdown.classes = {
  OVERFLOW: 'overflow-hidden'
};

export default Dropdown;
