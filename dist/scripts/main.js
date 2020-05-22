var WorkingNyc = (function () {
  'use strict';

  /**
   * Utilities for Form components
   * @class
   */
  var Forms = function Forms(form) {
    if ( form === void 0 ) form = false;

    this.FORM = form;

    this.strings = Forms.strings;

    this.submit = Forms.submit;

    this.classes = Forms.classes;

    this.markup = Forms.markup;

    this.selectors = Forms.selectors;

    this.attrs = Forms.attrs;

    this.FORM.setAttribute('novalidate', true);

    return this;
  };

  /**
   * Map toggled checkbox values to an input.
   * @param{Object} event The parent click event.
   * @return {Element}    The target element.
   */
  Forms.prototype.joinValues = function joinValues (event) {
    if (!event.target.matches('input[type="checkbox"]'))
      { return; }

    if (!event.target.closest('[data-js-join-values]'))
      { return; }

    var el = event.target.closest('[data-js-join-values]');
    var target = document.querySelector(el.dataset.jsJoinValues);

    target.value = Array.from(
        el.querySelectorAll('input[type="checkbox"]')
      )
      .filter(function (e) { return (e.value && e.checked); })
      .map(function (e) { return e.value; })
      .join(', ');

    return target;
  };

  /**
   * A simple form validation class that uses native form validation. It will
   * add appropriate form feedback for each input that is invalid and native
   * localized browser messaging.
   *
   * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
   * See https://caniuse.com/#feat=form-validation for support
   *
   * @param{Event}       event The form submission event
   * @return {Class/Boolean}     The form class or false if invalid
   */
  Forms.prototype.valid = function valid (event) {
    var validity = event.target.checkValidity();
    var elements = event.target.querySelectorAll(this.selectors.REQUIRED);

    for (var i = 0; i < elements.length; i++) {
      // Remove old messaging if it exists
      var el = elements[i];

      this.reset(el);

      // If this input valid, skip messaging
      if (el.validity.valid) { continue; }

      this.highlight(el);
    }

    return (validity) ? this : validity;
  };

  /**
   * Adds focus and blur events to inputs with required attributes
   * @param {object}formPassing a form is possible, otherwise it will use
   *                        the form passed to the constructor.
   * @return{class}       The form class
   */
  Forms.prototype.watch = function watch (form) {
      var this$1 = this;
      if ( form === void 0 ) form = false;

    this.FORM = (form) ? form : this.FORM;

    var elements = this.FORM.querySelectorAll(this.selectors.REQUIRED);

    /** Watch Individual Inputs */
    var loop = function ( i ) {
      // Remove old messaging if it exists
      var el = elements[i];

      el.addEventListener('focus', function () {
        this$1.reset(el);
      });

      el.addEventListener('blur', function () {
        if (!el.validity.valid)
          { this$1.highlight(el); }
      });
    };

      for (var i = 0; i < elements.length; i++) loop( i );

    /** Submit Event */
    this.FORM.addEventListener('submit', function (event) {
      event.preventDefault();

      if (this$1.valid(event) === false)
        { return false; }

      this$1.submit(event);
    });

    return this;
  };

  /**
   * Removes the validity message and classes from the message.
   * @param {object}elThe input element
   * @return{class}     The form class
   */
  Forms.prototype.reset = function reset (el) {
    var container = (this.selectors.ERROR_MESSAGE_PARENT)
      ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

    var message = container.querySelector('.' + this.classes.ERROR_MESSAGE);

    // Remove old messaging if it exists
    container.classList.remove(this.classes.ERROR_CONTAINER);
    if (message) { message.remove(); }

    // Remove error class from the form
    container.closest('form').classList.remove(this.classes.ERROR_CONTAINER);

    // Remove dynamic attributes from the input
    el.removeAttribute(this.attrs.ERROR_INPUT[0]);
    el.removeAttribute(this.attrs.ERROR_LABEL);

    return this;
  };

  /**
   * Displays a validity message to the user. It will first use any localized
   * string passed to the class for required fields missing input. If the
   * input is filled in but doesn't match the required pattern, it will use
   * a localized string set for the specific input type. If one isn't provided
   * it will use the default browser provided message.
   * @param {object}elThe invalid input element
   * @return{class}     The form class
   */
  Forms.prototype.highlight = function highlight (el) {
    var container = (this.selectors.ERROR_MESSAGE_PARENT)
      ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

    // Create the new error message.
    var message = document.createElement(this.markup.ERROR_MESSAGE);
    var id = (el.getAttribute('id')) + "-" + (this.classes.ERROR_MESSAGE);

    // Get the error message from localized strings (if set).
    if (el.validity.valueMissing && this.strings.VALID_REQUIRED)
      { message.innerHTML = this.strings.VALID_REQUIRED; }
    else if (!el.validity.valid &&
      this.strings[("VALID_" + (el.type.toUpperCase()) + "_INVALID")]) {
      var stringKey = "VALID_" + (el.type.toUpperCase()) + "_INVALID";
      message.innerHTML = this.strings[stringKey];
    } else
      { message.innerHTML = el.validationMessage; }

    // Set aria attributes and css classes to the message
    message.setAttribute('id', id);
    message.setAttribute(this.attrs.ERROR_MESSAGE[0],
      this.attrs.ERROR_MESSAGE[1]);
    message.classList.add(this.classes.ERROR_MESSAGE);

    // Add the error class and error message to the dom.
    container.classList.add(this.classes.ERROR_CONTAINER);
    container.insertBefore(message, container.childNodes[0]);

    // Add the error class to the form
    container.closest('form').classList.add(this.classes.ERROR_CONTAINER);

    // Add dynamic attributes to the input
    el.setAttribute(this.attrs.ERROR_INPUT[0], this.attrs.ERROR_INPUT[1]);
    el.setAttribute(this.attrs.ERROR_LABEL, id);

    return this;
  };

  /**
   * A dictionairy of strings in the format.
   * {
   *   'VALID_REQUIRED': 'This is required',
   *   'VALID_{{ TYPE }}_INVALID': 'Invalid'
   * }
   */
  Forms.strings = {};

  /** Placeholder for the submit function */
  Forms.submit = function() {};

  /** Classes for various containers */
  Forms.classes = {
    'ERROR_MESSAGE': 'error-message', // error class for the validity message
    'ERROR_CONTAINER': 'error', // class for the validity message parent
    'ERROR_FORM': 'error'
  };

  /** HTML tags and markup for various elements */
  Forms.markup = {
    'ERROR_MESSAGE': 'div',
  };

  /** DOM Selectors for various elements */
  Forms.selectors = {
    'REQUIRED': '[required="true"]', // Selector for required input elements
    'ERROR_MESSAGE_PARENT': false
  };

  /** Attributes for various elements */
  Forms.attrs = {
    'ERROR_MESSAGE': ['aria-live', 'polite'], // Attribute for valid error message
    'ERROR_INPUT': ['aria-invalid', 'true'],
    'ERROR_LABEL': 'aria-describedby'
  };

  /**
   * The Simple Toggle class. This will toggle the class 'active' and 'hidden'
   * on target elements, determined by a click event on a selected link or
   * element. This will also toggle the aria-hidden attribute for targeted
   * elements to support screen readers. Target settings and other functionality
   * can be controlled through data attributes.
   *
   * This uses the .matches() method which will require a polyfill for IE
   * https://polyfill.io/v2/docs/features/#Element_prototype_matches
   *
   * @class
   */
  var Toggle = function Toggle(s) {
    var this$1 = this;

    // Create an object to store existing toggle listeners (if it doesn't exist)
    if (!window.hasOwnProperty('ACCESS_TOGGLES'))
      { window.ACCESS_TOGGLES = []; }

    s = (!s) ? {} : s;

    this.settings = {
      selector: (s.selector) ? s.selector : Toggle.selector,
      namespace: (s.namespace) ? s.namespace : Toggle.namespace,
      inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
      activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
      before: (s.before) ? s.before : false,
      after: (s.after) ? s.after : false
    };

    this.element = (s.element) ? s.element : false;

    if (this.element) {
      this.element.addEventListener('click', function (event) {
        this$1.toggle(event);
      });
    } else {
      // If there isn't an existing instantiated toggle, add the event listener.
      if (!window.ACCESS_TOGGLES.hasOwnProperty(this.settings.selector))
        { document.querySelector('body').addEventListener('click', function (event) {
          if (!event.target.matches(this$1.settings.selector))
            { return; }

          this$1.toggle(event);
        }); }
    }

    // Record that a toggle using this selector has been instantiated. This
    // prevents double toggling.
    window.ACCESS_TOGGLES[this.settings.selector] = true;

    return this;
  };

  /**
   * Logs constants to the debugger
   * @param{object} eventThe main click event
   * @return {object}      The class
   */
  Toggle.prototype.toggle = function toggle (event) {
      var this$1 = this;

    var el = event.target;
    var target = false;

    event.preventDefault();

    /** Anchor Links */
    target = (el.hasAttribute('href')) ?
      document.querySelector(el.getAttribute('href')) : target;

    /** Toggle Controls */
    target = (el.hasAttribute('aria-controls')) ?
      document.querySelector(("#" + (el.getAttribute('aria-controls')))) : target;

    /** Main Functionality */
    if (!target) { return this; }
    this.elementToggle(el, target);

    /** Undo */
    if (el.dataset[((this.settings.namespace) + "Undo")]) {
      var undo = document.querySelector(
        el.dataset[((this.settings.namespace) + "Undo")]
      );

      undo.addEventListener('click', function (event) {
        event.preventDefault();
        this$1.elementToggle(el, target);
        undo.removeEventListener('click');
      });
    }

    return this;
  };

  /**
   * The main toggling method
   * @param{object} el   The current element to toggle active
   * @param{object} target The target element to toggle active/hidden
   * @return {object}      The class
   */
  Toggle.prototype.elementToggle = function elementToggle (el, target) {
      var this$1 = this;

    var i = 0;
    var attr = '';
    var value = '';

    // Get other toggles that might control the same element
    var others = document.querySelectorAll(
      ("[aria-controls=\"" + (el.getAttribute('aria-controls')) + "\"]"));

    /**
     * Toggling before hook.
     */
    if (this.settings.before) { this.settings.before(this); }

    /**
     * Toggle Element and Target classes
     */
    if (this.settings.activeClass) {
      el.classList.toggle(this.settings.activeClass);
      target.classList.toggle(this.settings.activeClass);

      // If there are other toggles that control the same element
      if (others) { others.forEach(function (other) {
        if (other !== el) { other.classList.toggle(this$1.settings.activeClass); }
      }); }
    }

    if (this.settings.inactiveClass)
      { target.classList.toggle(this.settings.inactiveClass); }

    /**
     * Target Element Aria Attributes
     */
    for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
      attr = Toggle.targetAriaRoles[i];
      value = target.getAttribute(attr);

      if (value != '' && value)
        { target.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
    }

    /**
     * Jump Links
     */
    if (el.hasAttribute('href')) {
      // Reset the history state, this will clear out
      // the hash when the jump item is toggled closed.
      history.pushState('', '',
        window.location.pathname + window.location.search);

      // Target element toggle.
      if (target.classList.contains(this.settings.activeClass)) {
        window.location.hash = el.getAttribute('href');

        target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
      } else
        { target.removeAttribute('tabindex'); }
    }

    /**
     * Toggle Element (including multi toggles) Aria Attributes
     */
    for (i = 0; i < Toggle.elAriaRoles.length; i++) {
      attr = Toggle.elAriaRoles[i];
      value = el.getAttribute(attr);

      if (value != '' && value)
        { el.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }

      // If there are other toggles that control the same element
      if (others) { others.forEach(function (other) {
        if (other !== el && other.getAttribute(attr))
          { other.setAttribute(attr, (value === 'true') ? 'false' : 'true'); }
      }); }
    }

    /**
     * Toggling complete hook.
     */
    if (this.settings.after) { this.settings.after(this); }

    return this;
  };

  /** @type {String} The main selector to add the toggling function to */
  Toggle.selector = '[data-js*="toggle"]';

  /** @type {String} The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type {String} The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type {String} The active class */
  Toggle.activeClass = 'active';

  /** @type {Array} Aria roles to toggle true/false on the toggling element */
  Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];

  /** @type {Array} Aria roles to toggle true/false on the target element */
  Toggle.targetAriaRoles = ['aria-hidden'];

  /**
   * The Icon module
   * @class
   */
  var Icons = function Icons(path) {
    path = (path) ? path : Icons.path;

    fetch(path)
      .then(function (response) {
        if (response.ok)
          { return response.text(); }
        else
          // eslint-disable-next-line no-console
          { console.dir(response); }
      })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        { console.dir(error); }
      })
      .then(function (data) {
        var sprite = document.createElement('div');
        sprite.innerHTML = data;
        sprite.setAttribute('aria-hidden', true);
        sprite.setAttribute('style', 'display: none;');
        document.body.appendChild(sprite);
      });

    return this;
  };

  /** @type {String} The path of the icon file */
  Icons.path = 'svg/icons.svg';

  /**
   * Tracking bus for Google analytics and Webtrends.
   */
  var Track = function Track(s) {
    var this$1 = this;

    var body = document.querySelector('body');

    s = (!s) ? {} : s;

    this._settings = {
      selector: (s.selector) ? s.selector : Track.selector,
    };

    this.desinations = Track.destinations;

    body.addEventListener('click', function (event) {
      if (!event.target.matches(this$1._settings.selector))
        { return; }

      var key = event.target.dataset.trackKey;
      var data = JSON.parse(event.target.dataset.trackData);

      this$1.track(key, data);
    });

    return this;
  };

  /**
   * Tracking function wrapper
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   *
   * @return {Object}          The final data object
   */
  Track.prototype.track = function track (key, data) {
    // Set the path name based on the location
    var d = data.map(function (el) {
        if (el.hasOwnProperty(Track.key))
          { el[Track.key] = (window.location.pathname) + "/" + (el[Track.key]); }
        return el;
      });

    var wt = this.webtrends(key, d);
    var ga = this.gtag(key, d);

    /* eslint-disable no-console */
    { console.dir({'Track': [wt, ga]}); }
    /* eslint-enable no-console */

    return d;
  };
  /**
   * Data bus for tracking views in Webtrends and Google Analytics
   *
   * @param{String}    app The name of the Single Page Application to track
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.view = function view (app, key, data) {
    var wt = this.webtrends(key, data);
    var ga = this.gtagView(app, key);

    /* eslint-disable no-console */
    { console.dir({'Track': [wt, ga]}); }
    /* eslint-enable no-console */
  };
  /**
   * Push Events to Webtrends
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.webtrends = function webtrends (key, data) {
    if (
      typeof Webtrends === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('webtrends')
    ) {
      return false;
    }

    var event = [{
      'WT.ti': key
    }];

    if (data[0] && data[0].hasOwnProperty(Track.key)) {
      event.push({
        'DCS.dcsuri': data[0][Track.key]
      });
    } else {
      Object.assign(event, data);
    }

    // Format data for Webtrends
    var wtd = {argsa: event.flatMap(function (e) {
      return Object.keys(e).flatMap(function (k) { return [k, e[k]]; });
    })};

    // If 'action' is used as the key (for gtag.js), switch it to Webtrends
    var action = data.argsa.indexOf('action');

    if (action) { data.argsa[action] = 'DCS.dcsuri'; }

    // Webtrends doesn't send the page view for MultiTrack, add path to url
    var dcsuri = data.argsa.indexOf('DCS.dcsuri');

    if (dcsuri) {
      data.argsa[dcsuri + 1] = window.location.pathname +
        data.argsa[dcsuri + 1];
    }

    /* eslint-disable no-undef */
    if (typeof Webtrends !== 'undefined')
      { Webtrends.multiTrack(wtd); }
    /* eslint-disable no-undef */

    return ['Webtrends', wtd];
  };
  /**
   * Push Click Events to Google Analytics
   *
   * @param{String}    key The key or event of the data
   * @param{Collection}dataThe data to track
   */
  Track.prototype.gtag = function gtag$1 (key, data) {
    if (
      typeof gtag === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('gtag')
    ) {
      return false;
    }

    var uri = data.find(function (element) { return element.hasOwnProperty(Track.key); });

    var event = {
      'event_category': key
    };

    /* eslint-disable no-undef */
    gtag(Track.key, uri[Track.key], event);
    /* eslint-enable no-undef */

    return ['gtag', Track.key, uri[Track.key], event];
  };
  /**
   * Push Screen View Events to Google Analytics
   *
   * @param{String}appThe name of the application
   * @param{String}keyThe key or event of the data
   */
  Track.prototype.gtagView = function gtagView (app, key) {
    if (
      typeof gtag === 'undefined' ||
      typeof data === 'undefined' ||
      !this.desinations.includes('gtag')
    ) {
      return false;
    }

    var view = {
      app_name: app,
      screen_name: key
    };

    /* eslint-disable no-undef */
    gtag('event', 'screen_view', view);
    /* eslint-enable no-undef */

    return ['gtag', Track.key, 'screen_view', view];
  };

  /** @type {String} The main selector to add the tracking function to */
  Track.selector = '[data-js*="track"]';

  /** @type {String} The main event tracking key to map to Webtrends DCS.uri */
  Track.key = 'event';

  /** @type {Array} What destinations to push data to */
  Track.destinations = [
    'webtrends',
    'gtag'
  ];

  /**
   * Copy to Clipboard Helper
   *
   * <input data-copy-target="web-share-url" id="web-share-url" name="web-share-url" type="text" value="https://myurl" />
   *
   * <button aria-pressed="false" data-copy="web-share-url" data-js="copy">
   *   Copy to Clipboard
   * </button>
   */
  var Copy = function Copy() {
    var this$1 = this;

    // Set attributes
    this.selector = Copy.selector;

    this.aria = Copy.aria;

    this.notifyTimeout = Copy.notifyTimeout;

    // Select the entire text when it's focused on
    document.querySelectorAll(Copy.selectors.TARGETS).forEach(function (item) {
      item.addEventListener('focus', function () { return this$1.select(item); });
      item.addEventListener('click', function () { return this$1.select(item); });
    });

    // The main click event for the class
    document.querySelector('body').addEventListener('click', function (event) {
      if (!event.target.matches(this$1.selector))
        { return; }

      this$1.element = event.target;

      this$1.element.setAttribute(this$1.aria, false);

      this$1.target = this$1.element.dataset.copy;

      if (this$1.copy(this$1.target)) {
        this$1.element.setAttribute(this$1.aria, true);

        clearTimeout(this$1.element['timeout']);

        this$1.element['timeout'] = setTimeout(function () {
          this$1.element.setAttribute(this$1.aria, false);
        }, this$1.notifyTimeout);
      }
    });

    return this;
  };

  /**
   * The click event handler
   *
   * @param {String}targetContent of target data attribute
   *
   * @return{Boolean}       Wether copy was successful or not
   */
  Copy.prototype.copy = function copy (target) {
    var selector = Copy.selectors.TARGETS.replace(']', ("=\"" + target + "\"]"));

    var input = document.querySelector(selector);

    this.select(input);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value);
    } else if (document.execCommand) {
      document.execCommand('copy');
    } else {
      return false;
    }

    return true;
  };

  /**
   * Handler for the text selection method
   *
   * @param {Object}inputThe input with content to select
   */
  Copy.prototype.select = function select (input) {
    input.select();

    input.setSelectionRange(0, 99999);
  };

  /** The main element selector */
  Copy.selector = '[data-js*="copy"]';

  /** Class selectors */
  Copy.selectors = {
    TARGETS: '[data-copy-target]'
  };

  /** Button aria role to toggle */
  Copy.aria = 'aria-pressed';

  /** Timeout for the "Copied!" notification */
  Copy.notifyTimeout = 1500;

  /**
   * The Accordion module
   * @class
   */

  var Accordion = function Accordion() {
    this._toggle = new Toggle({
      selector: Accordion.selector
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Accordion.selector = '[data-js*="accordion"]';

  // import Filter from '../components/filter/filter';
  // import NearbyStops from '../components/nearby-stops/nearby-stops';
  // import ShareForm from '../components/share-form/share-form';
  // import WebShare from '../components/web-share/web-share';
  // Objects
  // import AlertBanner from '../objects/alert-banner/alert-banner';
  // import Newsletter from '../objects/newsletter/newsletter';
  // import TextController from '../objects/text-controller/text-controller';

  /** import components here as they are written. */

  /**
   * The Main module
   * @class
   */

  var main = function main () {};

  main.prototype.icons = function icons (path) {
      if ( path === void 0 ) path = 'svg/icons.svg';

    return new Icons(path);
  };
  /**
   * An API for the Toggle Utility
   * @param{Object} settings Settings for the Toggle Class
   * @return {Object}        Instance of toggle
   */


  main.prototype.toggle = function toggle (settings) {
      if ( settings === void 0 ) settings = false;

    return settings ? new Toggle(settings) : new Toggle();
  };
  /**
   *
   * @param {string} selector
   * @param {function} submit
   */


  main.prototype.valid = function valid (selector, submit) {
    this.form = new Forms(document.querySelector(selector));
    this.form.submit = submit;
    this.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
    this.form.watch();
  };
  /**
   * An API for the Accordion Component
   * @return {Object} instance of Accordion
   */


  main.prototype.accordion = function accordion () {
    return new Accordion();
  };
  /**
   * An API for the Copy Utility
   *
   * @return{Object}Instance of Copy
   */


  main.prototype.copy = function copy () {
    return new Copy();
  };
  /**
   * An API for the Track Object
   *
   * @return{Object}Instance of Track
   */


  main.prototype.track = function track () {
    return new Track();
  };

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvaWNvbnMvaWNvbnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RyYWNrL3RyYWNrLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHkuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIFJlbW92ZSBkeW5hbWljIGF0dHJpYnV0ZXMgZnJvbSB0aGUgaW5wdXRcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSk7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcbiAgICBsZXQgaWQgPSBgJHtlbC5nZXRBdHRyaWJ1dGUoJ2lkJyl9LSR7dGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0V9YDtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gQWRkIGR5bmFtaWMgYXR0cmlidXRlcyB0byB0aGUgaW5wdXRcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSwgdGhpcy5hdHRycy5FUlJPUl9JTlBVVFsxXSk7XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwsIGlkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYWlyeSBvZiBzdHJpbmdzIGluIHRoZSBmb3JtYXQuXG4gKiB7XG4gKiAgICdWQUxJRF9SRVFVSVJFRCc6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAqICAgJ1ZBTElEX3t7IFRZUEUgfX1fSU5WQUxJRCc6ICdJbnZhbGlkJ1xuICogfVxuICovXG5Gb3Jtcy5zdHJpbmdzID0ge307XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIHN1Ym1pdCBmdW5jdGlvbiAqL1xuRm9ybXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqIENsYXNzZXMgZm9yIHZhcmlvdXMgY29udGFpbmVycyAqL1xuRm9ybXMuY2xhc3NlcyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZXJyb3ItbWVzc2FnZScsIC8vIGVycm9yIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZVxuICAnRVJST1JfQ09OVEFJTkVSJzogJ2Vycm9yJywgLy8gY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlIHBhcmVudFxuICAnRVJST1JfRk9STSc6ICdlcnJvcidcbn07XG5cbi8qKiBIVE1MIHRhZ3MgYW5kIG1hcmt1cCBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMubWFya3VwID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdkaXYnLFxufTtcblxuLyoqIERPTSBTZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLnNlbGVjdG9ycyA9IHtcbiAgJ1JFUVVJUkVEJzogJ1tyZXF1aXJlZD1cInRydWVcIl0nLCAvLyBTZWxlY3RvciBmb3IgcmVxdWlyZWQgaW5wdXQgZWxlbWVudHNcbiAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogZmFsc2Vcbn07XG5cbi8qKiBBdHRyaWJ1dGVzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5hdHRycyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiBbJ2FyaWEtbGl2ZScsICdwb2xpdGUnXSwgLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG4gICdFUlJPUl9JTlBVVCc6IFsnYXJpYS1pbnZhbGlkJywgJ3RydWUnXSxcbiAgJ0VSUk9SX0xBQkVMJzogJ2FyaWEtZGVzY3JpYmVkYnknXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzcy4gVGhpcyB3aWxsIHRvZ2dsZSB0aGUgY2xhc3MgJ2FjdGl2ZScgYW5kICdoaWRkZW4nXG4gKiBvbiB0YXJnZXQgZWxlbWVudHMsIGRldGVybWluZWQgYnkgYSBjbGljayBldmVudCBvbiBhIHNlbGVjdGVkIGxpbmsgb3JcbiAqIGVsZW1lbnQuIFRoaXMgd2lsbCBhbHNvIHRvZ2dsZSB0aGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIGZvciB0YXJnZXRlZFxuICogZWxlbWVudHMgdG8gc3VwcG9ydCBzY3JlZW4gcmVhZGVycy4gVGFyZ2V0IHNldHRpbmdzIGFuZCBvdGhlciBmdW5jdGlvbmFsaXR5XG4gKiBjYW4gYmUgY29udHJvbGxlZCB0aHJvdWdoIGRhdGEgYXR0cmlidXRlcy5cbiAqXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KCdBQ0NFU1NfVE9HR0xFUycpKVxuICAgICAgd2luZG93LkFDQ0VTU19UT0dHTEVTID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvdy5BQ0NFU1NfVE9HR0xFUy5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoYXQgYSB0b2dnbGUgdXNpbmcgdGhpcyBzZWxlY3RvciBoYXMgYmVlbiBpbnN0YW50aWF0ZWQuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBkb3VibGUgdG9nZ2xpbmcuXG4gICAgd2luZG93LkFDQ0VTU19UT0dHTEVTW3RoaXMuc2V0dGluZ3Muc2VsZWN0b3JdID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgY29uc3RhbnRzIHRvIHRoZSBkZWJ1Z2dlclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLyoqIEFuY2hvciBMaW5rcyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgOiB0YXJnZXQ7XG5cbiAgICAvKiogVG9nZ2xlIENvbnRyb2xzICovXG4gICAgdGFyZ2V0ID0gKGVsLmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gKSA6IHRhcmdldDtcblxuICAgIC8qKiBNYWluIEZ1bmN0aW9uYWxpdHkgKi9cbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuXG4gICAgLyoqIFVuZG8gKi9cbiAgICBpZiAoZWwuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsICAgICBUaGUgY3VycmVudCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmVcbiAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbCwgdGFyZ2V0KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvLyBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgIGxldCBvdGhlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYFthcmlhLWNvbnRyb2xzPVwiJHtlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rLlxuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSkgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwpIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1bXAgTGlua3NcbiAgICAgKi9cbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpIHtcbiAgICAgIC8vIFJlc2V0IHRoZSBoaXN0b3J5IHN0YXRlLCB0aGlzIHdpbGwgY2xlYXIgb3V0XG4gICAgICAvLyB0aGUgaGFzaCB3aGVuIHRoZSBqdW1wIGl0ZW0gaXMgdG9nZ2xlZCBjbG9zZWQuXG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgICAvLyBUYXJnZXQgZWxlbWVudCB0b2dnbGUuXG4gICAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2suXG4gICAgICovXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWZ0ZXIpIHRoaXMuc2V0dGluZ3MuYWZ0ZXIodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbi8qKiBAdHlwZSB7QXJyYXl9IEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRvZ2dsaW5nIGVsZW1lbnQgKi9cblRvZ2dsZS5lbEFyaWFSb2xlcyA9IFsnYXJpYS1wcmVzc2VkJywgJ2FyaWEtZXhwYW5kZWQnXTtcblxuLyoqIEB0eXBlIHtBcnJheX0gQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnc3ZnL2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNraW5nIGJ1cyBmb3IgR29vZ2xlIGFuYWx5dGljcyBhbmQgV2VidHJlbmRzLlxuICovXG5jbGFzcyBUcmFjayB7XG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVHJhY2suc2VsZWN0b3IsXG4gICAgfTtcblxuICAgIHRoaXMuZGVzaW5hdGlvbnMgPSBUcmFjay5kZXN0aW5hdGlvbnM7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBsZXQga2V5ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tLZXk7XG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tEYXRhKTtcblxuICAgICAgdGhpcy50cmFjayhrZXksIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gd3JhcHBlclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBmaW5hbCBkYXRhIG9iamVjdFxuICAgKi9cbiAgdHJhY2soa2V5LCBkYXRhKSB7XG4gICAgLy8gU2V0IHRoZSBwYXRoIG5hbWUgYmFzZWQgb24gdGhlIGxvY2F0aW9uXG4gICAgY29uc3QgZCA9IGRhdGEubWFwKGVsID0+IHtcbiAgICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICAgICAgZWxbVHJhY2sua2V5XSA9IGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtlbFtUcmFjay5rZXldfWBcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgfSk7XG5cbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGQpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZyhrZXksIGQpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbiAgICByZXR1cm4gZDtcbiAgfTtcblxuICAvKipcbiAgICogRGF0YSBidXMgZm9yIHRyYWNraW5nIHZpZXdzIGluIFdlYnRyZW5kcyBhbmQgR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgYXBwICAgVGhlIG5hbWUgb2YgdGhlIFNpbmdsZSBQYWdlIEFwcGxpY2F0aW9uIHRvIHRyYWNrXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgdmlldyhhcHAsIGtleSwgZGF0YSkge1xuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZGF0YSk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnVmlldyhhcHAsIGtleSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBFdmVudHMgdG8gV2VidHJlbmRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgd2VidHJlbmRzKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBXZWJ0cmVuZHMgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCd3ZWJ0cmVuZHMnKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBldmVudCA9IFt7XG4gICAgICAnV1QudGknOiBrZXlcbiAgICB9XTtcblxuICAgIGlmIChkYXRhWzBdICYmIGRhdGFbMF0uaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSkge1xuICAgICAgZXZlbnQucHVzaCh7XG4gICAgICAgICdEQ1MuZGNzdXJpJzogZGF0YVswXVtUcmFjay5rZXldXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmFzc2lnbihldmVudCwgZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gRm9ybWF0IGRhdGEgZm9yIFdlYnRyZW5kc1xuICAgIGxldCB3dGQgPSB7YXJnc2E6IGV2ZW50LmZsYXRNYXAoZSA9PiB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoZSkuZmxhdE1hcChrID0+IFtrLCBlW2tdXSk7XG4gICAgfSl9O1xuXG4gICAgLy8gSWYgJ2FjdGlvbicgaXMgdXNlZCBhcyB0aGUga2V5IChmb3IgZ3RhZy5qcyksIHN3aXRjaCBpdCB0byBXZWJ0cmVuZHNcbiAgICBsZXQgYWN0aW9uID0gZGF0YS5hcmdzYS5pbmRleE9mKCdhY3Rpb24nKTtcblxuICAgIGlmIChhY3Rpb24pIGRhdGEuYXJnc2FbYWN0aW9uXSA9ICdEQ1MuZGNzdXJpJztcblxuICAgIC8vIFdlYnRyZW5kcyBkb2Vzbid0IHNlbmQgdGhlIHBhZ2UgdmlldyBmb3IgTXVsdGlUcmFjaywgYWRkIHBhdGggdG8gdXJsXG4gICAgbGV0IGRjc3VyaSA9IGRhdGEuYXJnc2EuaW5kZXhPZignRENTLmRjc3VyaScpO1xuXG4gICAgaWYgKGRjc3VyaSkge1xuICAgICAgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArXG4gICAgICAgIGRhdGEuYXJnc2FbZGNzdXJpICsgMV07XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBpZiAodHlwZW9mIFdlYnRyZW5kcyAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICBXZWJ0cmVuZHMubXVsdGlUcmFjayh3dGQpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydXZWJ0cmVuZHMnLCB3dGRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIENsaWNrIEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgZ3RhZyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB1cmkgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSk7XG5cbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAnZXZlbnRfY2F0ZWdvcnknOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIFNjcmVlbiBWaWV3IEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGFwcCAgVGhlIG5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGtleSAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKi9cbiAgZ3RhZ1ZpZXcoYXBwLCBrZXkpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB2aWV3ID0ge1xuICAgICAgYXBwX25hbWU6IGFwcCxcbiAgICAgIHNjcmVlbl9uYW1lOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKCdldmVudCcsICdzY3JlZW5fdmlldycsIHZpZXcpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksICdzY3JlZW5fdmlldycsIHZpZXddO1xuICB9O1xufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0cmFja2luZyBmdW5jdGlvbiB0byAqL1xuVHJhY2suc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidHJhY2tcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gZXZlbnQgdHJhY2tpbmcga2V5IHRvIG1hcCB0byBXZWJ0cmVuZHMgRENTLnVyaSAqL1xuVHJhY2sua2V5ID0gJ2V2ZW50JztcblxuLyoqIEB0eXBlIHtBcnJheX0gV2hhdCBkZXN0aW5hdGlvbnMgdG8gcHVzaCBkYXRhIHRvICovXG5UcmFjay5kZXN0aW5hdGlvbnMgPSBbXG4gICd3ZWJ0cmVuZHMnLFxuICAnZ3RhZydcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb3B5IHRvIENsaXBib2FyZCBIZWxwZXJcbiAqXG4gKiA8aW5wdXQgZGF0YS1jb3B5LXRhcmdldD1cIndlYi1zaGFyZS11cmxcIiBpZD1cIndlYi1zaGFyZS11cmxcIiBuYW1lPVwid2ViLXNoYXJlLXVybFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCJodHRwczovL215dXJsXCIgLz5cbiAqXG4gKiA8YnV0dG9uIGFyaWEtcHJlc3NlZD1cImZhbHNlXCIgZGF0YS1jb3B5PVwid2ViLXNoYXJlLXVybFwiIGRhdGEtanM9XCJjb3B5XCI+XG4gKiAgIENvcHkgdG8gQ2xpcGJvYXJkXG4gKiA8L2J1dHRvbj5cbiAqL1xuY2xhc3MgQ29weSB7XG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnNlbGVjdG9yID0gQ29weS5zZWxlY3RvcjtcblxuICAgIHRoaXMuYXJpYSA9IENvcHkuYXJpYTtcblxuICAgIHRoaXMubm90aWZ5VGltZW91dCA9IENvcHkubm90aWZ5VGltZW91dDtcblxuICAgIC8vIFNlbGVjdCB0aGUgZW50aXJlIHRleHQgd2hlbiBpdCdzIGZvY3VzZWQgb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKENvcHkuc2VsZWN0b3JzLlRBUkdFVFMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gdGhpcy5zZWxlY3QoaXRlbSkpO1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2VsZWN0KGl0ZW0pKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBtYWluIGNsaWNrIGV2ZW50IGZvciB0aGUgY2xhc3NcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmFyaWEsIGZhbHNlKTtcblxuICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmVsZW1lbnQuZGF0YXNldC5jb3B5O1xuXG4gICAgICBpZiAodGhpcy5jb3B5KHRoaXMudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMuYXJpYSwgdHJ1ZSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZWxlbWVudFsndGltZW91dCddKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRbJ3RpbWVvdXQnXSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5hcmlhLCBmYWxzZSk7XG4gICAgICAgIH0sIHRoaXMubm90aWZ5VGltZW91dCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgdGFyZ2V0ICBDb250ZW50IG9mIHRhcmdldCBkYXRhIGF0dHJpYnV0ZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gICAgICAgICBXZXRoZXIgY29weSB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICovXG4gIGNvcHkodGFyZ2V0KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gQ29weS5zZWxlY3RvcnMuVEFSR0VUUy5yZXBsYWNlKCddJywgYD1cIiR7dGFyZ2V0fVwiXWApO1xuXG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICB0aGlzLnNlbGVjdChpbnB1dCk7XG5cbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCkge1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoaW5wdXQudmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQpIHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciB0aGUgdGV4dCBzZWxlY3Rpb24gbWV0aG9kXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBpbnB1dCAgVGhlIGlucHV0IHdpdGggY29udGVudCB0byBzZWxlY3RcbiAgICovXG4gIHNlbGVjdChpbnB1dCkge1xuICAgIGlucHV0LnNlbGVjdCgpO1xuXG4gICAgaW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgOTk5OTkpO1xuICB9XG59XG5cbi8qKiBUaGUgbWFpbiBlbGVtZW50IHNlbGVjdG9yICovXG5Db3B5LnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cImNvcHlcIl0nO1xuXG4vKiogQ2xhc3Mgc2VsZWN0b3JzICovXG5Db3B5LnNlbGVjdG9ycyA9IHtcbiAgVEFSR0VUUzogJ1tkYXRhLWNvcHktdGFyZ2V0XSdcbn07XG5cbi8qKiBCdXR0b24gYXJpYSByb2xlIHRvIHRvZ2dsZSAqL1xuQ29weS5hcmlhID0gJ2FyaWEtcHJlc3NlZCc7XG5cbi8qKiBUaW1lb3V0IGZvciB0aGUgXCJDb3BpZWQhXCIgbm90aWZpY2F0aW9uICovXG5Db3B5Lm5vdGlmeVRpbWVvdXQgPSAxNTAwO1xuXG5leHBvcnQgZGVmYXVsdCBDb3B5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvclxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiYWNjb3JkaW9uXCJdJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgSWNvbnMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2ljb25zL2ljb25zJztcbmltcG9ydCBUcmFjayBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdHJhY2svdHJhY2snO1xuaW1wb3J0IENvcHkgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2NvcHkvY29weSc7XG5cbi8vIEVsZW1lbnRzXG4vLyBpbXBvcnQgSW5wdXRzQXV0b2NvbXBsZXRlIGZyb20gJy4uL2VsZW1lbnRzL2lucHV0cy9pbnB1dHMtYXV0b2NvbXBsZXRlJztcbi8vIGltcG9ydCBUb29sdGlwcyBmcm9tICcuLi9lbGVtZW50cy90b29sdGlwcy90b29sdGlwcyc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBY2NvcmRpb24gZnJvbSAnLi4vY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbi8vIGltcG9ydCBEaXNjbGFpbWVyIGZyb20gJy4uL2NvbXBvbmVudHMvZGlzY2xhaW1lci9kaXNjbGFpbWVyJztcbi8vIGltcG9ydCBGaWx0ZXIgZnJvbSAnLi4vY29tcG9uZW50cy9maWx0ZXIvZmlsdGVyJztcbi8vIGltcG9ydCBOZWFyYnlTdG9wcyBmcm9tICcuLi9jb21wb25lbnRzL25lYXJieS1zdG9wcy9uZWFyYnktc3RvcHMnO1xuLy8gaW1wb3J0IFNoYXJlRm9ybSBmcm9tICcuLi9jb21wb25lbnRzL3NoYXJlLWZvcm0vc2hhcmUtZm9ybSc7XG4vLyBpbXBvcnQgV2ViU2hhcmUgZnJvbSAnLi4vY29tcG9uZW50cy93ZWItc2hhcmUvd2ViLXNoYXJlJztcblxuLy8gT2JqZWN0c1xuLy8gaW1wb3J0IEFsZXJ0QmFubmVyIGZyb20gJy4uL29iamVjdHMvYWxlcnQtYmFubmVyL2FsZXJ0LWJhbm5lcic7XG4vLyBpbXBvcnQgTmV3c2xldHRlciBmcm9tICcuLi9vYmplY3RzL25ld3NsZXR0ZXIvbmV3c2xldHRlcic7XG4vLyBpbXBvcnQgVGV4dENvbnRyb2xsZXIgZnJvbSAnLi4vb2JqZWN0cy90ZXh0LWNvbnRyb2xsZXIvdGV4dC1jb250cm9sbGVyJztcbi8qKiBpbXBvcnQgY29tcG9uZW50cyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBVdGlsaXR5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgSWNvbnNcbiAgICovXG4gIGljb25zKHBhdGggPSAnc3ZnL2ljb25zLnN2ZycpIHtcbiAgICByZXR1cm4gbmV3IEljb25zKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFRvZ2dsZSBVdGlsaXR5XG4gICAqIEBwYXJhbSAge09iamVjdH0gc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBUb2dnbGUgQ2xhc3NcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICBJbnN0YW5jZSBvZiB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZShzZXR0aW5ncyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIChzZXR0aW5ncykgPyBuZXcgVG9nZ2xlKHNldHRpbmdzKSA6IG5ldyBUb2dnbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gICBzZWxlY3RvclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdWJtaXRcbiAgICovXG4gIHZhbGlkKHNlbGVjdG9yLCBzdWJtaXQpIHtcbiAgICB0aGlzLmZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpO1xuXG4gICAgdGhpcy5mb3JtLnN1Ym1pdCA9IHN1Ym1pdDtcblxuICAgIHRoaXMuZm9ybS5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQgPSAnLmMtcXVlc3Rpb25fX2NvbnRhaW5lcic7XG5cbiAgICB0aGlzLmZvcm0ud2F0Y2goKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBY2NvcmRpb24gQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgQWNjb3JkaW9uXG4gICAqL1xuICBhY2NvcmRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBBY2NvcmRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBDb3B5IFV0aWxpdHlcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIENvcHlcbiAgICovXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb3B5KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVHJhY2sgT2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBUcmFja1xuICAgKi9cbiAgdHJhY2soKSB7XG4gICAgcmV0dXJuIG5ldyBUcmFjaygpO1xuICB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIFRvb2x0aXBzIGVsZW1lbnRcbiAgLy8gICogQHBhcmFtICB7T2JqZWN0fSAgIHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9vbHRpcHMgQ2xhc3NcbiAgLy8gICogQHJldHVybiB7bm9kZWxpc3R9ICAgICAgICAgIFRvb2x0aXAgZWxlbWVudHNcbiAgLy8gICovXG4gIC8vIHRvb2x0aXBzKGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChUb29sdGlwcy5zZWxlY3RvcikpIHtcbiAgLy8gICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAvLyAgICAgbmV3IFRvb2x0aXBzKGVsZW1lbnQpO1xuICAvLyAgIH0pO1xuXG4gIC8vICAgcmV0dXJuIChlbGVtZW50cy5sZW5ndGgpID8gZWxlbWVudHMgOiBudWxsO1xuICAvLyB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIEZpbHRlciBDb21wb25lbnRcbiAgLy8gICogQHJldHVybiB7T2JqZWN0fSBpbnN0YW5jZSBvZiBGaWx0ZXJcbiAgLy8gICovXG4gIC8vIGZpbHRlcigpIHtcbiAgLy8gICByZXR1cm4gbmV3IEZpbHRlcigpO1xuICAvLyB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIE5lYXJieSBTdG9wcyBDb21wb25lbnRcbiAgLy8gICogQHJldHVybiB7T2JqZWN0fSBpbnN0YW5jZSBvZiBOZWFyYnlTdG9wc1xuICAvLyAgKi9cbiAgLy8gbmVhcmJ5U3RvcHMoKSB7XG4gIC8vICAgcmV0dXJuIG5ldyBOZWFyYnlTdG9wcygpO1xuICAvLyB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIE5ld3NsZXR0ZXIgT2JqZWN0XG4gIC8vICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgTmV3c2xldHRlclxuICAvLyAgKi9cbiAgLy8gbmV3c2xldHRlcihlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9yKSkge1xuICAvLyAgIHJldHVybiAoZWxlbWVudCkgPyBuZXcgTmV3c2xldHRlcihlbGVtZW50KSA6IG51bGw7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgQWxlcnRCYW5uZXIgQ29tcG9uZW50XG4gIC8vICAqXG4gIC8vICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAvLyAgKi9cbiAgLy8gYWxlcnRCYW5uZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQWxlcnRCYW5uZXIuc2VsZWN0b3IpKSB7XG4gIC8vICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBBbGVydEJhbm5lcihlbGVtZW50KSA6IG51bGw7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgU2hhcmVGb3JtIENvbXBvbmVudFxuICAvLyAgKlxuICAvLyAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgU2hhcmVGb3JtXG4gIC8vICAqL1xuICAvLyBzaGFyZUZvcm0oZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFNoYXJlRm9ybS5zZWxlY3RvcikpIHtcbiAgLy8gICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAvLyAgICAgbmV3IFNoYXJlRm9ybShlbGVtZW50KTtcbiAgLy8gICB9KTtcblxuICAvLyAgIHJldHVybiAoZWxlbWVudHMubGVuZ3RoKSA/IGVsZW1lbnRzIDogbnVsbDtcbiAgLy8gfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBBbiBBUEkgZm9yIHRoZSBXZWJTaGFyZSBDb21wb25lbnRcbiAgLy8gICpcbiAgLy8gICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFdlYlNoYXJlXG4gIC8vICAqL1xuICAvLyB3ZWJTaGFyZSgpIHtcbiAgLy8gICByZXR1cm4gbmV3IFdlYlNoYXJlKCk7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgRGlzY2xhaW1lciBDb21wb25lbnRcbiAgLy8gICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIERpc2NsYWltZXJcbiAgLy8gICovXG4gIC8vIGRpc2NsYWltZXIoKSB7XG4gIC8vICAgcmV0dXJuIG5ldyBEaXNjbGFpbWVyKCk7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgVGV4dENvbnRyb2xsZXIgT2JqZWN0XG4gIC8vICAqXG4gIC8vICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBUZXh0Q29udHJvbGxlclxuICAvLyAgKi9cbiAgLy8gdGV4dENvbnRyb2xsZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoVGV4dENvbnRyb2xsZXIuc2VsZWN0b3IpKSB7XG4gIC8vICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBUZXh0Q29udHJvbGxlcihlbGVtZW50KSA6IG51bGw7XG4gIC8vIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFpbjtcbiJdLCJuYW1lcyI6WyJsZXQiLCJ0aGlzIiwiaSIsImNvbnN0IiwiQWNjb3JkaW9uIiwiY29uc3RydWN0b3IiLCJfdG9nZ2xlIiwiVG9nZ2xlIiwic2VsZWN0b3IiLCJtYWluIiwiaWNvbnMiLCJwYXRoIiwiSWNvbnMiLCJ0b2dnbGUiLCJzZXR0aW5ncyIsInZhbGlkIiwic3VibWl0IiwiZm9ybSIsIkZvcm1zIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwic2VsZWN0b3JzIiwiRVJST1JfTUVTU0FHRV9QQVJFTlQiLCJ3YXRjaCIsImFjY29yZGlvbiIsImNvcHkiLCJDb3B5IiwidHJhY2siLCJUcmFjayJdLCJtYXBwaW5ncyI6Ijs7O0VBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFNLEtBQUssR0FLVCxjQUFXLENBQUMsSUFBWSxFQUFFOytCQUFWLEdBQUc7QUFBUTtFQUM3QixFQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0VBQ0EsRUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDakM7RUFDQSxFQUFJLElBQUksQ0FBQyxNQUFN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
