'use strict';

class {{ Pattern }} {
  /**
   * @param  {Object}  settings  This could be some configuration
   *                             options. for the pattern module.
   * @param  {Object}  data      This could be a set of data needed
   *                             for the pattern module to render.

   * @return {Object}            The instantiated pattern
   * @constructor
   */
  constructor(settings = {}, data = {}) {
    this.data = data;

    this.settings = settings;

    this.selector = {{ Pattern }}.selector;

    this.el = document.querySelector(this.selector);

    return this;
  }
}

/**  */
{{ Pattern }}.selector = '[data-js*=\"{{ pattern }}\"]';

export default {{ Pattern }};
