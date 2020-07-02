var WorkingNyc = (function () {
  'use strict';

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

    // Store the element for potential use in callbacks
    this.element = (s.element) ? s.element : false;

    if (this.element)
      { this.element.addEventListener('click', function (event) {
        this$1.toggle(event);
      }); }
    else
      // If there isn't an existing instantiated toggle, add the event listener.
      if (!window.ACCESS_TOGGLES.hasOwnProperty(this.settings.selector))
        { document.querySelector('body').addEventListener('click', function (event) {
          if (!event.target.matches(this$1.settings.selector))
            { return; }

          // Store the event for potential use in callbacks
          this$1.event = event;

          this$1.toggle(event);
        }); }

    // Record that a toggle using this selector has been instantiated. This
    // prevents double toggling.
    window.ACCESS_TOGGLES[this.settings.selector] = true;

    return this;
  };

  /**
   * Logs constants to the debugger
   *
   * @param{Object}eventThe main click event
   *
   * @return {Object}       The class
   */
  Toggle.prototype.toggle = function toggle (event) {
      var this$1 = this;

    var el = event.target;
    var target = false;
    var focusable = [];

    event.preventDefault();

    /** Anchor Links */
    target = (el.hasAttribute('href')) ?
      document.querySelector(el.getAttribute('href')) : target;

    /** Toggle Controls */
    target = (el.hasAttribute('aria-controls')) ?
      document.querySelector(("#" + (el.getAttribute('aria-controls')))) : target;

    /** Focusable Children */
    focusable = (target) ?
      target.querySelectorAll(Toggle.elFocusable.join(', ')) : focusable;

    /** Main Functionality */
    if (!target) { return this; }
    this.elementToggle(el, target, focusable);

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
   *
   * @param{Object}  el       The current element to toggle active
   * @param{Object}  target   The target element to toggle active/hidden
   * @param{NodeList}focusableAny focusable children in the target
   *
   * @return {Object}        The class
   */
  Toggle.prototype.elementToggle = function elementToggle (el, target, focusable) {
      var this$1 = this;
      if ( focusable === void 0 ) focusable = [];

    var i = 0;
    var attr = '';
    var value = '';

    // Get other toggles that might control the same element
    var others = document.querySelectorAll(
      ("[aria-controls=\"" + (el.getAttribute('aria-controls')) + "\"]"));

    // Store elements for potential use in callbacks
    this.element = el;
    this.target = target;
    this.others = others;
    this.focusable = focusable;

    /**
     * Toggling before hook
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
     * Hide the Toggle Target's focusable children from focus.
     * If an element has the data-attribute 'data-toggle-tabindex', use that
     * as the default tab index of the element.
     */
    focusable.forEach(function (el) {
      var tabindex = el.getAttribute('tabindex');

      if (tabindex === '-1') {
        var dataDefault = el.getAttribute(("data-" + (Toggle.namespace) + "-tabindex"));

        if (dataDefault) {
          el.setAttribute('tabindex', dataDefault);
        } else {
          el.removeAttribute('tabindex');
        }
      } else {
        el.setAttribute('tabindex', '-1');
      }
    });

    /**
     * Jump to Target Element (if Toggle Element is an anchor link).
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

  /** @type  {String}  The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type  {String}  The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type  {String}  The active class */
  Toggle.activeClass = 'active';

  /** @type  {Array}  Aria roles to toggle true/false on the toggling element */
  Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];

  /** @type  {Array}  Aria roles to toggle true/false on the target element */
  Toggle.targetAriaRoles = ['aria-hidden'];

  /** @type  {Array}  Focusable elements to hide within the hidden target element */
  Toggle.elFocusable = [
    'a', 'button', 'input', 'select', 'textarea', 'object', 'embed', 'form',
    'fieldset', 'legend', 'label', 'area', 'audio', 'video', 'iframe', 'svg',
    'details', 'table', '[tabindex]', '[contenteditable]', '[usemap]'
  ];

  /**
   * Copy to Clipboard Helper
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

    if (navigator.clipboard && navigator.clipboard.writeText)
      { navigator.clipboard.writeText(input.value); }
    else if (document.execCommand)
      { document.execCommand('copy'); }
    else
      { return false; }

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
    )
      { return false; }

    var event = [{
      'WT.ti': key
    }];

    if (data[0] && data[0].hasOwnProperty(Track.key))
      { event.push({
        'DCS.dcsuri': data[0][Track.key]
      }); }
    else
      { Object.assign(event, data); }

    // Format data for Webtrends
    var wtd = {argsa: event.flatMap(function (e) {
      return Object.keys(e).flatMap(function (k) { return [k, e[k]]; });
    })};

    // If 'action' is used as the key (for gtag.js), switch it to Webtrends
    var action = data.argsa.indexOf('action');

    if (action) { data.argsa[action] = 'DCS.dcsuri'; }

    // Webtrends doesn't send the page view for MultiTrack, add path to url
    var dcsuri = data.argsa.indexOf('DCS.dcsuri');

    if (dcsuri)
      { data.argsa[dcsuri + 1] = window.location.pathname + data.argsa[dcsuri + 1]; }

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
    )
      { return false; }

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
    )
      { return false; }

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
   * Uses the Share API to t
   */
  var WebShare = function WebShare(s) {
    var this$1 = this;
    if ( s === void 0 ) s = {};

    this.selector = (s.selector) ? s.selector : WebShare.selector;

    this.callback = (s.callback) ? s.callback : WebShare.callback;

    this.fallback = (s.fallback) ? s.fallback : WebShare.fallback;

    if (navigator.share) {
      // Remove fallback aria toggling attributes
      document.querySelectorAll(this.selector).forEach(function (item) {
        item.removeAttribute('aria-controls');
        item.removeAttribute('aria-expanded');
      });

      // Add event listener for the share click
      document.querySelector('body').addEventListener('click', function (event) {
        if (!event.target.matches(this$1.selector))
          { return; }

        this$1.element = event.target;

        this$1.data = JSON.parse(this$1.element.dataset.webShare);

        this$1.share(this$1.data);
      });
    } else
      { this.fallback(); } // Execute the fallback

    return this;
  };

  /**
   * Web Share API handler
   *
   * @param {Object}dataAn object containing title, url, and text.
   *
   * @return{Promise}     The response of the .share() method.
   */
  WebShare.prototype.share = function share (data) {
      var this$1 = this;
      if ( data === void 0 ) data = {};

    return navigator.share(data)
      .then(function (res) {
        this$1.callback(data);
      }).catch(function (err) {
        { console.dir(err); }
      });
  };

  /** The html selector for the component */
  WebShare.selector = '[data-js*="web-share"]';

  /** Placeholder callback for a successful send */
  WebShare.callback = function () {
    { console.dir('Success!'); }
  };

  /** Placeholder for the WebShare fallback */
  WebShare.fallback = function () {
    { console.dir('Fallback!'); }
  };

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

  /**
   * The Mobile Nav module
   *
   * @class
   */

  var MobileMenu = function MobileMenu() {
    this._toggle = new Toggle({
      selector: MobileMenu.selector
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  MobileMenu.selector = '[data-js*="mobile-menu"]';

  /**
   * The Search module
   *
   * @class
   */

  var Search = function Search() {
    this._toggle = new Toggle({
      selector: Search.selector,
      after: function (toggle) {
        var el = document.querySelector(Search.selector);
        var input = document.querySelector(Search.selectors.input);

        if (el.className.includes('active') && input) {
          input.focus();
        }
      }
    });
    return this;
  };
  /**
   * The dom selector for the module
   * @type {String}
   */


  Search.selector = '[data-js*="search"]';
  Search.selectors = {
    input: '[data-js*="search__input"]'
  };

  /** import modules here as they are written. */

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
   * @param {Object}settingsSettings for the Toggle Class
   * @return{Object}          Instance of toggle
   */


  main.prototype.toggle = function toggle (settings) {
      if ( settings === void 0 ) settings = false;

    return settings ? new Toggle(settings) : new Toggle();
  };
  /**
   *
   * @param{string}  selector
   * @param{function}submit
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
  }; // /**
  //* An API for the Tooltips element
  //* @param{Object} settings Settings for the Tooltips Class
  //* @return {nodelist}        Tooltip elements
  //*/
  // tooltips(elements = document.querySelectorAll(Tooltips.selector)) {
  // elements.forEach(element => {
  //   new Tooltips(element);
  // });
  // return (elements.length) ? elements : null;
  // }
  // /**
  //* An API for the Filter Component
  //* @return {Object} instance of Filter
  //*/
  // filter() {
  // return new Filter();
  // }
  // /**
  //* An API for the Nearby Stops Component
  //* @return {Object} instance of NearbyStops
  //*/
  // nearbyStops() {
  // return new NearbyStops();
  // }
  // /**
  //* An API for the Newsletter Object
  //* @return {Object} instance of Newsletter
  //*/
  // newsletter(element = document.querySelector(Newsletter.selector)) {
  // return (element) ? new Newsletter(element) : null;
  // }
  // /**
  //* An API for the AlertBanner Component
  //*
  //* @return{Object}Instance of AlertBanner
  //*/
  // alertBanner(element = document.querySelector(AlertBanner.selector)) {
  // return (element) ? new AlertBanner(element) : null;
  // }
  // /**
  //* An API for the ShareForm Component
  //*
  //* @return{Object}Instance of ShareForm
  //*/
  // shareForm(elements = document.querySelectorAll(ShareForm.selector)) {
  // elements.forEach(element => {
  //   new ShareForm(element);
  // });
  // return (elements.length) ? elements : null;
  // }
  // /**
  //* An API for the Disclaimer Component
  //* @return{Object}Instance of Disclaimer
  //*/
  // disclaimer() {
  // return new Disclaimer();
  // }
  // /**
  //* An API for the TextController Object
  //*
  //* @return{Object}Instance of TextController
  //*/
  // textController(element = document.querySelector(TextController.selector)) {
  // return (element) ? new TextController(element) : null;
  // }

  /**
   * An API for the Mobile Nav
   *
   * @return{Object}instance of MobileMenu
   */


  main.prototype.mobileMenu = function mobileMenu () {
    return new MobileMenu();
  };
  /**
   * An API for the Search Box
   *
   * @return{Object}instance of Search
   */


  main.prototype.search = function search () {
    return new Search();
  };
  /**
   * An API for Web Share
   *
   * @return{Object}instance of WebShare
   */


  main.prototype.webShare = function webShare () {
    return new WebShare({
      fallback: function () {
        new Toggle({
          selector: WebShare.selector
        });
      }
    });
  };

  return main;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdHJhY2svdHJhY2suanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3dlYi1zaGFyZS93ZWItc2hhcmUuanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uLmpzIiwiLi4vLi4vc3JjL29iamVjdHMvbW9iaWxlLW1lbnUvbW9iaWxlLW1lbnUuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9zZWFyY2gvc2VhcmNoLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBzICBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KCdBQ0NFU1NfVE9HR0xFUycpKVxuICAgICAgd2luZG93LkFDQ0VTU19UT0dHTEVTID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIFN0b3JlIHRoZSBlbGVtZW50IGZvciBwb3RlbnRpYWwgdXNlIGluIGNhbGxiYWNrc1xuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KVxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvdy5BQ0NFU1NfVE9HR0xFUy5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAvLyBTdG9yZSB0aGUgZXZlbnQgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50O1xuXG4gICAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgIC8vIFJlY29yZCB0aGF0IGEgdG9nZ2xlIHVzaW5nIHRoaXMgc2VsZWN0b3IgaGFzIGJlZW4gaW5zdGFudGlhdGVkLiBUaGlzXG4gICAgLy8gcHJldmVudHMgZG91YmxlIHRvZ2dsaW5nLlxuICAgIHdpbmRvdy5BQ0NFU1NfVE9HR0xFU1t0aGlzLnNldHRpbmdzLnNlbGVjdG9yXSA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG4gICAgbGV0IGZvY3VzYWJsZSA9IFtdO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8qKiBBbmNob3IgTGlua3MgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZ2V0QXR0cmlidXRlKCdocmVmJykpIDogdGFyZ2V0O1xuXG4gICAgLyoqIFRvZ2dsZSBDb250cm9scyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YCkgOiB0YXJnZXQ7XG5cbiAgICAvKiogRm9jdXNhYmxlIENoaWxkcmVuICovXG4gICAgZm9jdXNhYmxlID0gKHRhcmdldCkgP1xuICAgICAgdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoVG9nZ2xlLmVsRm9jdXNhYmxlLmpvaW4oJywgJykpIDogZm9jdXNhYmxlO1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCwgZm9jdXNhYmxlKTtcblxuICAgIC8qKiBVbmRvICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG5cbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgICBlbCAgICAgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgIHRhcmdldCAgICAgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEBwYXJhbSAge05vZGVMaXN0fSAgZm9jdXNhYmxlICBBbnkgZm9jdXNhYmxlIGNoaWxkcmVuIGluIHRoZSB0YXJnZXRcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIGVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCwgZm9jdXNhYmxlID0gW10pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8vIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgbGV0IG90aGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgW2FyaWEtY29udHJvbHM9XCIke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWApO1xuXG4gICAgLy8gU3RvcmUgZWxlbWVudHMgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgdGhpcy5lbGVtZW50ID0gZWw7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5vdGhlcnMgPSBvdGhlcnM7XG4gICAgdGhpcy5mb2N1c2FibGUgPSBmb2N1c2FibGU7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGluZyBiZWZvcmUgaG9va1xuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSkgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwpIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZGUgdGhlIFRvZ2dsZSBUYXJnZXQncyBmb2N1c2FibGUgY2hpbGRyZW4gZnJvbSBmb2N1cy5cbiAgICAgKiBJZiBhbiBlbGVtZW50IGhhcyB0aGUgZGF0YS1hdHRyaWJ1dGUgJ2RhdGEtdG9nZ2xlLXRhYmluZGV4JywgdXNlIHRoYXRcbiAgICAgKiBhcyB0aGUgZGVmYXVsdCB0YWIgaW5kZXggb2YgdGhlIGVsZW1lbnQuXG4gICAgICovXG4gICAgZm9jdXNhYmxlLmZvckVhY2goZWwgPT4ge1xuICAgICAgbGV0IHRhYmluZGV4ID0gZWwuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXG4gICAgICBpZiAodGFiaW5kZXggPT09ICctMScpIHtcbiAgICAgICAgbGV0IGRhdGFEZWZhdWx0ID0gZWwuZ2V0QXR0cmlidXRlKGBkYXRhLSR7VG9nZ2xlLm5hbWVzcGFjZX0tdGFiaW5kZXhgKTtcblxuICAgICAgICBpZiAoZGF0YURlZmF1bHQpIHtcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgZGF0YURlZmF1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSnVtcCB0byBUYXJnZXQgRWxlbWVudCAoaWYgVG9nZ2xlIEVsZW1lbnQgaXMgYW4gYW5jaG9yIGxpbmspLlxuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9vay5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcikgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0b2dnbGluZyBlbGVtZW50ICovXG5Ub2dnbGUuZWxBcmlhUm9sZXMgPSBbJ2FyaWEtcHJlc3NlZCcsICdhcmlhLWV4cGFuZGVkJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRm9jdXNhYmxlIGVsZW1lbnRzIHRvIGhpZGUgd2l0aGluIHRoZSBoaWRkZW4gdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS5lbEZvY3VzYWJsZSA9IFtcbiAgJ2EnLCAnYnV0dG9uJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScsICdvYmplY3QnLCAnZW1iZWQnLCAnZm9ybScsXG4gICdmaWVsZHNldCcsICdsZWdlbmQnLCAnbGFiZWwnLCAnYXJlYScsICdhdWRpbycsICd2aWRlbycsICdpZnJhbWUnLCAnc3ZnJyxcbiAgJ2RldGFpbHMnLCAndGFibGUnLCAnW3RhYmluZGV4XScsICdbY29udGVudGVkaXRhYmxlXScsICdbdXNlbWFwXSdcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb3B5IHRvIENsaXBib2FyZCBIZWxwZXJcbiAqL1xuY2xhc3MgQ29weSB7XG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnNlbGVjdG9yID0gQ29weS5zZWxlY3RvcjtcblxuICAgIHRoaXMuYXJpYSA9IENvcHkuYXJpYTtcblxuICAgIHRoaXMubm90aWZ5VGltZW91dCA9IENvcHkubm90aWZ5VGltZW91dDtcblxuICAgIC8vIFNlbGVjdCB0aGUgZW50aXJlIHRleHQgd2hlbiBpdCdzIGZvY3VzZWQgb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKENvcHkuc2VsZWN0b3JzLlRBUkdFVFMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gdGhpcy5zZWxlY3QoaXRlbSkpO1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2VsZWN0KGl0ZW0pKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBtYWluIGNsaWNrIGV2ZW50IGZvciB0aGUgY2xhc3NcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmFyaWEsIGZhbHNlKTtcblxuICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmVsZW1lbnQuZGF0YXNldC5jb3B5O1xuXG4gICAgICBpZiAodGhpcy5jb3B5KHRoaXMudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMuYXJpYSwgdHJ1ZSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZWxlbWVudFsndGltZW91dCddKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRbJ3RpbWVvdXQnXSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5hcmlhLCBmYWxzZSk7XG4gICAgICAgIH0sIHRoaXMubm90aWZ5VGltZW91dCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgdGFyZ2V0ICBDb250ZW50IG9mIHRhcmdldCBkYXRhIGF0dHJpYnV0ZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gICAgICAgICBXZXRoZXIgY29weSB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICovXG4gIGNvcHkodGFyZ2V0KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gQ29weS5zZWxlY3RvcnMuVEFSR0VUUy5yZXBsYWNlKCddJywgYD1cIiR7dGFyZ2V0fVwiXWApO1xuXG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICB0aGlzLnNlbGVjdChpbnB1dCk7XG5cbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dClcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGlucHV0LnZhbHVlKTtcbiAgICBlbHNlIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZClcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgdGhlIHRleHQgc2VsZWN0aW9uIG1ldGhvZFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgaW5wdXQgIFRoZSBpbnB1dCB3aXRoIGNvbnRlbnQgdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3QoaW5wdXQpIHtcbiAgICBpbnB1dC5zZWxlY3QoKTtcblxuICAgIGlucHV0LnNldFNlbGVjdGlvblJhbmdlKDAsIDk5OTk5KTtcbiAgfVxufVxuXG4vKiogVGhlIG1haW4gZWxlbWVudCBzZWxlY3RvciAqL1xuQ29weS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJjb3B5XCJdJztcblxuLyoqIENsYXNzIHNlbGVjdG9ycyAqL1xuQ29weS5zZWxlY3RvcnMgPSB7XG4gIFRBUkdFVFM6ICdbZGF0YS1jb3B5LXRhcmdldF0nXG59O1xuXG4vKiogQnV0dG9uIGFyaWEgcm9sZSB0byB0b2dnbGUgKi9cbkNvcHkuYXJpYSA9ICdhcmlhLXByZXNzZWQnO1xuXG4vKiogVGltZW91dCBmb3IgdGhlIFwiQ29waWVkIVwiIG5vdGlmaWNhdGlvbiAqL1xuQ29weS5ub3RpZnlUaW1lb3V0ID0gMTUwMDtcblxuZXhwb3J0IGRlZmF1bHQgQ29weTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnc3ZnL2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIFJlbW92ZSBkeW5hbWljIGF0dHJpYnV0ZXMgZnJvbSB0aGUgaW5wdXRcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSk7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcbiAgICBsZXQgaWQgPSBgJHtlbC5nZXRBdHRyaWJ1dGUoJ2lkJyl9LSR7dGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0V9YDtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gQWRkIGR5bmFtaWMgYXR0cmlidXRlcyB0byB0aGUgaW5wdXRcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSwgdGhpcy5hdHRycy5FUlJPUl9JTlBVVFsxXSk7XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwsIGlkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYWlyeSBvZiBzdHJpbmdzIGluIHRoZSBmb3JtYXQuXG4gKiB7XG4gKiAgICdWQUxJRF9SRVFVSVJFRCc6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAqICAgJ1ZBTElEX3t7IFRZUEUgfX1fSU5WQUxJRCc6ICdJbnZhbGlkJ1xuICogfVxuICovXG5Gb3Jtcy5zdHJpbmdzID0ge307XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIHN1Ym1pdCBmdW5jdGlvbiAqL1xuRm9ybXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqIENsYXNzZXMgZm9yIHZhcmlvdXMgY29udGFpbmVycyAqL1xuRm9ybXMuY2xhc3NlcyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZXJyb3ItbWVzc2FnZScsIC8vIGVycm9yIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZVxuICAnRVJST1JfQ09OVEFJTkVSJzogJ2Vycm9yJywgLy8gY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlIHBhcmVudFxuICAnRVJST1JfRk9STSc6ICdlcnJvcidcbn07XG5cbi8qKiBIVE1MIHRhZ3MgYW5kIG1hcmt1cCBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMubWFya3VwID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdkaXYnLFxufTtcblxuLyoqIERPTSBTZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLnNlbGVjdG9ycyA9IHtcbiAgJ1JFUVVJUkVEJzogJ1tyZXF1aXJlZD1cInRydWVcIl0nLCAvLyBTZWxlY3RvciBmb3IgcmVxdWlyZWQgaW5wdXQgZWxlbWVudHNcbiAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogZmFsc2Vcbn07XG5cbi8qKiBBdHRyaWJ1dGVzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5hdHRycyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiBbJ2FyaWEtbGl2ZScsICdwb2xpdGUnXSwgLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG4gICdFUlJPUl9JTlBVVCc6IFsnYXJpYS1pbnZhbGlkJywgJ3RydWUnXSxcbiAgJ0VSUk9SX0xBQkVMJzogJ2FyaWEtZGVzY3JpYmVkYnknXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUcmFja2luZyBidXMgZm9yIEdvb2dsZSBhbmFseXRpY3MgYW5kIFdlYnRyZW5kcy5cbiAqL1xuY2xhc3MgVHJhY2sge1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRyYWNrLnNlbGVjdG9yLFxuICAgIH07XG5cbiAgICB0aGlzLmRlc2luYXRpb25zID0gVHJhY2suZGVzdGluYXRpb25zO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgbGV0IGtleSA9IGV2ZW50LnRhcmdldC5kYXRhc2V0LnRyYWNrS2V5O1xuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LnRhcmdldC5kYXRhc2V0LnRyYWNrRGF0YSk7XG5cbiAgICAgIHRoaXMudHJhY2soa2V5LCBkYXRhKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNraW5nIGZ1bmN0aW9uIHdyYXBwZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICBUaGUgZmluYWwgZGF0YSBvYmplY3RcbiAgICovXG4gIHRyYWNrKGtleSwgZGF0YSkge1xuICAgIC8vIFNldCB0aGUgcGF0aCBuYW1lIGJhc2VkIG9uIHRoZSBsb2NhdGlvblxuICAgIGNvbnN0IGQgPSBkYXRhLm1hcChlbCA9PiB7XG4gICAgICAgIGlmIChlbC5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKVxuICAgICAgICAgIGVsW1RyYWNrLmtleV0gPSBgJHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9LyR7ZWxbVHJhY2sua2V5XX1gXG4gICAgICAgIHJldHVybiBlbDtcbiAgICAgIH0pO1xuXG4gICAgbGV0IHd0ID0gdGhpcy53ZWJ0cmVuZHMoa2V5LCBkKTtcbiAgICBsZXQgZ2EgPSB0aGlzLmd0YWcoa2V5LCBkKTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHsnVHJhY2snOiBbd3QsIGdhXX0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuXG4gICAgcmV0dXJuIGQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERhdGEgYnVzIGZvciB0cmFja2luZyB2aWV3cyBpbiBXZWJ0cmVuZHMgYW5kIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGFwcCAgIFRoZSBuYW1lIG9mIHRoZSBTaW5nbGUgUGFnZSBBcHBsaWNhdGlvbiB0byB0cmFja1xuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIHZpZXcoYXBwLCBrZXksIGRhdGEpIHtcbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGRhdGEpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZ1ZpZXcoYXBwLCBrZXkpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggRXZlbnRzIHRvIFdlYnRyZW5kc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIHdlYnRyZW5kcyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgV2VidHJlbmRzID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnd2VidHJlbmRzJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgZXZlbnQgPSBbe1xuICAgICAgJ1dULnRpJzoga2V5XG4gICAgfV07XG5cbiAgICBpZiAoZGF0YVswXSAmJiBkYXRhWzBdLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICBldmVudC5wdXNoKHtcbiAgICAgICAgJ0RDUy5kY3N1cmknOiBkYXRhWzBdW1RyYWNrLmtleV1cbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIE9iamVjdC5hc3NpZ24oZXZlbnQsIGRhdGEpO1xuXG4gICAgLy8gRm9ybWF0IGRhdGEgZm9yIFdlYnRyZW5kc1xuICAgIGxldCB3dGQgPSB7YXJnc2E6IGV2ZW50LmZsYXRNYXAoZSA9PiB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoZSkuZmxhdE1hcChrID0+IFtrLCBlW2tdXSk7XG4gICAgfSl9O1xuXG4gICAgLy8gSWYgJ2FjdGlvbicgaXMgdXNlZCBhcyB0aGUga2V5IChmb3IgZ3RhZy5qcyksIHN3aXRjaCBpdCB0byBXZWJ0cmVuZHNcbiAgICBsZXQgYWN0aW9uID0gZGF0YS5hcmdzYS5pbmRleE9mKCdhY3Rpb24nKTtcblxuICAgIGlmIChhY3Rpb24pIGRhdGEuYXJnc2FbYWN0aW9uXSA9ICdEQ1MuZGNzdXJpJztcblxuICAgIC8vIFdlYnRyZW5kcyBkb2Vzbid0IHNlbmQgdGhlIHBhZ2UgdmlldyBmb3IgTXVsdGlUcmFjaywgYWRkIHBhdGggdG8gdXJsXG4gICAgbGV0IGRjc3VyaSA9IGRhdGEuYXJnc2EuaW5kZXhPZignRENTLmRjc3VyaScpO1xuXG4gICAgaWYgKGRjc3VyaSlcbiAgICAgIGRhdGEuYXJnc2FbZGNzdXJpICsgMV0gPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBkYXRhLmFyZ3NhW2Rjc3VyaSArIDFdO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBpZiAodHlwZW9mIFdlYnRyZW5kcyAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICBXZWJ0cmVuZHMubXVsdGlUcmFjayh3dGQpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydXZWJ0cmVuZHMnLCB3dGRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIENsaWNrIEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgZ3RhZyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB1cmkgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSk7XG5cbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAnZXZlbnRfY2F0ZWdvcnknOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIFNjcmVlbiBWaWV3IEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGFwcCAgVGhlIG5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGtleSAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKi9cbiAgZ3RhZ1ZpZXcoYXBwLCBrZXkpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB2aWV3ID0ge1xuICAgICAgYXBwX25hbWU6IGFwcCxcbiAgICAgIHNjcmVlbl9uYW1lOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKCdldmVudCcsICdzY3JlZW5fdmlldycsIHZpZXcpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksICdzY3JlZW5fdmlldycsIHZpZXddO1xuICB9O1xufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0cmFja2luZyBmdW5jdGlvbiB0byAqL1xuVHJhY2suc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidHJhY2tcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gZXZlbnQgdHJhY2tpbmcga2V5IHRvIG1hcCB0byBXZWJ0cmVuZHMgRENTLnVyaSAqL1xuVHJhY2sua2V5ID0gJ2V2ZW50JztcblxuLyoqIEB0eXBlIHtBcnJheX0gV2hhdCBkZXN0aW5hdGlvbnMgdG8gcHVzaCBkYXRhIHRvICovXG5UcmFjay5kZXN0aW5hdGlvbnMgPSBbXG4gICd3ZWJ0cmVuZHMnLFxuICAnZ3RhZydcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVc2VzIHRoZSBTaGFyZSBBUEkgdG8gdFxuICovXG5jbGFzcyBXZWJTaGFyZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMgPSB7fSkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogV2ViU2hhcmUuc2VsZWN0b3I7XG5cbiAgICB0aGlzLmNhbGxiYWNrID0gKHMuY2FsbGJhY2spID8gcy5jYWxsYmFjayA6IFdlYlNoYXJlLmNhbGxiYWNrO1xuXG4gICAgdGhpcy5mYWxsYmFjayA9IChzLmZhbGxiYWNrKSA/IHMuZmFsbGJhY2sgOiBXZWJTaGFyZS5mYWxsYmFjaztcblxuICAgIGlmIChuYXZpZ2F0b3Iuc2hhcmUpIHtcbiAgICAgIC8vIFJlbW92ZSBmYWxsYmFjayBhcmlhIHRvZ2dsaW5nIGF0dHJpYnV0ZXNcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcikuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgaXRlbS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKTtcbiAgICAgICAgaXRlbS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBzaGFyZSBjbGlja1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3IpKVxuICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgICAgdGhpcy5kYXRhID0gSlNPTi5wYXJzZSh0aGlzLmVsZW1lbnQuZGF0YXNldC53ZWJTaGFyZSk7XG5cbiAgICAgICAgdGhpcy5zaGFyZSh0aGlzLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlXG4gICAgICB0aGlzLmZhbGxiYWNrKCk7IC8vIEV4ZWN1dGUgdGhlIGZhbGxiYWNrXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXZWIgU2hhcmUgQVBJIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGRhdGEgIEFuIG9iamVjdCBjb250YWluaW5nIHRpdGxlLCB1cmwsIGFuZCB0ZXh0LlxuICAgKlxuICAgKiBAcmV0dXJuICB7UHJvbWlzZX0gICAgICAgVGhlIHJlc3BvbnNlIG9mIHRoZSAuc2hhcmUoKSBtZXRob2QuXG4gICAqL1xuICBzaGFyZShkYXRhID0ge30pIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLnNoYXJlKGRhdGEpXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKGRhdGEpO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgY29uc29sZS5kaXIoZXJyKTtcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKiBUaGUgaHRtbCBzZWxlY3RvciBmb3IgdGhlIGNvbXBvbmVudCAqL1xuV2ViU2hhcmUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwid2ViLXNoYXJlXCJdJztcblxuLyoqIFBsYWNlaG9sZGVyIGNhbGxiYWNrIGZvciBhIHN1Y2Nlc3NmdWwgc2VuZCAqL1xuV2ViU2hhcmUuY2FsbGJhY2sgPSAoKSA9PiB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgIGNvbnNvbGUuZGlyKCdTdWNjZXNzIScpO1xufTtcblxuLyoqIFBsYWNlaG9sZGVyIGZvciB0aGUgV2ViU2hhcmUgZmFsbGJhY2sgKi9cbldlYlNoYXJlLmZhbGxiYWNrID0gKCkgPT4ge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICBjb25zb2xlLmRpcignRmFsbGJhY2shJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYlNoYXJlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgQWNjb3JkaW9uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IEFjY29yZGlvbi5zZWxlY3RvclxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5BY2NvcmRpb24uc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwiYWNjb3JkaW9uXCJdJztcblxuZXhwb3J0IGRlZmF1bHQgQWNjb3JkaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLy8gaW1wb3J0IFNlYXJjaCBmcm9tICdzcmMvb2JqZWN0cy9zZWFyY2gvc2VhcmNoJztcblxuLyoqXG4gKiBUaGUgTW9iaWxlIE5hdiBtb2R1bGVcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTW9iaWxlTWVudSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IE1vYmlsZU1lbnUuc2VsZWN0b3JcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuTW9iaWxlTWVudS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJtb2JpbGUtbWVudVwiXSc7XG5cbmV4cG9ydCBkZWZhdWx0IE1vYmlsZU1lbnU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBTZWFyY2ggbW9kdWxlXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFNlYXJjaCB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IFNlYXJjaC5zZWxlY3RvcixcbiAgICAgIGFmdGVyOiAodG9nZ2xlKSA9PiB7XG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU2VhcmNoLnNlbGVjdG9yKTtcbiAgICAgICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWFyY2guc2VsZWN0b3JzLmlucHV0KTtcblxuICAgICAgICBpZiAoZWwuY2xhc3NOYW1lLmluY2x1ZGVzKCdhY3RpdmUnKSAmJiBpbnB1dCkge1xuICAgICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRvbSBzZWxlY3RvciBmb3IgdGhlIG1vZHVsZVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuU2VhcmNoLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInNlYXJjaFwiXSc7XG5cblNlYXJjaC5zZWxlY3RvcnMgPSB7XG4gIGlucHV0OiAnW2RhdGEtanMqPVwic2VhcmNoX19pbnB1dFwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcbmltcG9ydCBDb3B5IGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHknO1xuaW1wb3J0IEljb25zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9pY29ucy9pY29ucyc7XG5pbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2Zvcm1zL2Zvcm1zJztcbi8vIGltcG9ydCBUb29sdGlwcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9vbHRpcHMvdG9vbHRpcHMnO1xuaW1wb3J0IFRyYWNrIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90cmFjay90cmFjayc7XG5pbXBvcnQgV2ViU2hhcmUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3dlYi1zaGFyZS93ZWItc2hhcmUnO1xuXG4vLyBFbGVtZW50c1xuLy8gaW1wb3J0IC4uLiBmcm9tICcuLi9lbGVtZW50cy8uLi4nO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG4vLyBpbXBvcnQgLi4uIGZyb20gJy4uL2NvbXBvbmVudHMvLi4uJztcblxuLy8gT2JqZWN0c1xuaW1wb3J0IE1vYmlsZU1lbnUgZnJvbSAnLi4vb2JqZWN0cy9tb2JpbGUtbWVudS9tb2JpbGUtbWVudSc7XG5pbXBvcnQgU2VhcmNoIGZyb20gJy4uL29iamVjdHMvc2VhcmNoL3NlYXJjaCc7XG4vLyBpbXBvcnQgLi4uIGZyb20gJy4uL29iamVjdHMvLi4uJztcbi8qKiBpbXBvcnQgbW9kdWxlcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBVdGlsaXR5XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBwYXRoICBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICBpbnN0YW5jZSBvZiBJY29uc1xuICAgKi9cbiAgaWNvbnMocGF0aCA9ICdzdmcvaWNvbnMuc3ZnJykge1xuICAgIHJldHVybiBuZXcgSWNvbnMocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVG9nZ2xlIFV0aWxpdHlcbiAgICogQHBhcmFtICAge09iamVjdH0gIHNldHRpbmdzICBTZXR0aW5ncyBmb3IgdGhlIFRvZ2dsZSBDbGFzc1xuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgIEluc3RhbmNlIG9mIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlKHNldHRpbmdzID0gZmFsc2UpIHtcbiAgICByZXR1cm4gKHNldHRpbmdzKSA/IG5ldyBUb2dnbGUoc2V0dGluZ3MpIDogbmV3IFRvZ2dsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gICAgc2VsZWN0b3JcbiAgICogQHBhcmFtICB7ZnVuY3Rpb259ICBzdWJtaXRcbiAgICovXG4gIHZhbGlkKHNlbGVjdG9yLCBzdWJtaXQpIHtcbiAgICB0aGlzLmZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpO1xuXG4gICAgdGhpcy5mb3JtLnN1Ym1pdCA9IHN1Ym1pdDtcblxuICAgIHRoaXMuZm9ybS5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQgPSAnLmMtcXVlc3Rpb25fX2NvbnRhaW5lcic7XG5cbiAgICB0aGlzLmZvcm0ud2F0Y2goKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBY2NvcmRpb24gQ29tcG9uZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgQWNjb3JkaW9uXG4gICAqL1xuICBhY2NvcmRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBBY2NvcmRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBDb3B5IFV0aWxpdHlcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIENvcHlcbiAgICovXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb3B5KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVHJhY2sgT2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBUcmFja1xuICAgKi9cbiAgdHJhY2soKSB7XG4gICAgcmV0dXJuIG5ldyBUcmFjaygpO1xuICB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIFRvb2x0aXBzIGVsZW1lbnRcbiAgLy8gICogQHBhcmFtICB7T2JqZWN0fSAgIHNldHRpbmdzIFNldHRpbmdzIGZvciB0aGUgVG9vbHRpcHMgQ2xhc3NcbiAgLy8gICogQHJldHVybiB7bm9kZWxpc3R9ICAgICAgICAgIFRvb2x0aXAgZWxlbWVudHNcbiAgLy8gICovXG4gIC8vIHRvb2x0aXBzKGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChUb29sdGlwcy5zZWxlY3RvcikpIHtcbiAgLy8gICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAvLyAgICAgbmV3IFRvb2x0aXBzKGVsZW1lbnQpO1xuICAvLyAgIH0pO1xuXG4gIC8vICAgcmV0dXJuIChlbGVtZW50cy5sZW5ndGgpID8gZWxlbWVudHMgOiBudWxsO1xuICAvLyB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIEZpbHRlciBDb21wb25lbnRcbiAgLy8gICogQHJldHVybiB7T2JqZWN0fSBpbnN0YW5jZSBvZiBGaWx0ZXJcbiAgLy8gICovXG4gIC8vIGZpbHRlcigpIHtcbiAgLy8gICByZXR1cm4gbmV3IEZpbHRlcigpO1xuICAvLyB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIE5lYXJieSBTdG9wcyBDb21wb25lbnRcbiAgLy8gICogQHJldHVybiB7T2JqZWN0fSBpbnN0YW5jZSBvZiBOZWFyYnlTdG9wc1xuICAvLyAgKi9cbiAgLy8gbmVhcmJ5U3RvcHMoKSB7XG4gIC8vICAgcmV0dXJuIG5ldyBOZWFyYnlTdG9wcygpO1xuICAvLyB9XG5cbiAgLy8gLyoqXG4gIC8vICAqIEFuIEFQSSBmb3IgdGhlIE5ld3NsZXR0ZXIgT2JqZWN0XG4gIC8vICAqIEByZXR1cm4ge09iamVjdH0gaW5zdGFuY2Ugb2YgTmV3c2xldHRlclxuICAvLyAgKi9cbiAgLy8gbmV3c2xldHRlcihlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9yKSkge1xuICAvLyAgIHJldHVybiAoZWxlbWVudCkgPyBuZXcgTmV3c2xldHRlcihlbGVtZW50KSA6IG51bGw7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgQWxlcnRCYW5uZXIgQ29tcG9uZW50XG4gIC8vICAqXG4gIC8vICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAvLyAgKi9cbiAgLy8gYWxlcnRCYW5uZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQWxlcnRCYW5uZXIuc2VsZWN0b3IpKSB7XG4gIC8vICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBBbGVydEJhbm5lcihlbGVtZW50KSA6IG51bGw7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgU2hhcmVGb3JtIENvbXBvbmVudFxuICAvLyAgKlxuICAvLyAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgU2hhcmVGb3JtXG4gIC8vICAqL1xuICAvLyBzaGFyZUZvcm0oZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFNoYXJlRm9ybS5zZWxlY3RvcikpIHtcbiAgLy8gICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAvLyAgICAgbmV3IFNoYXJlRm9ybShlbGVtZW50KTtcbiAgLy8gICB9KTtcblxuICAvLyAgIHJldHVybiAoZWxlbWVudHMubGVuZ3RoKSA/IGVsZW1lbnRzIDogbnVsbDtcbiAgLy8gfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBBbiBBUEkgZm9yIHRoZSBEaXNjbGFpbWVyIENvbXBvbmVudFxuICAvLyAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgRGlzY2xhaW1lclxuICAvLyAgKi9cbiAgLy8gZGlzY2xhaW1lcigpIHtcbiAgLy8gICByZXR1cm4gbmV3IERpc2NsYWltZXIoKTtcbiAgLy8gfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBBbiBBUEkgZm9yIHRoZSBUZXh0Q29udHJvbGxlciBPYmplY3RcbiAgLy8gICpcbiAgLy8gICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFRleHRDb250cm9sbGVyXG4gIC8vICAqL1xuICAvLyB0ZXh0Q29udHJvbGxlcihlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcikpIHtcbiAgLy8gICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IFRleHRDb250cm9sbGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBNb2JpbGUgTmF2XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBpbnN0YW5jZSBvZiBNb2JpbGVNZW51XG4gICAqL1xuICBtb2JpbGVNZW51KCkge1xuICAgIHJldHVybiBuZXcgTW9iaWxlTWVudSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFNlYXJjaCBCb3hcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIGluc3RhbmNlIG9mIFNlYXJjaFxuICAgKi9cbiAgc2VhcmNoKCkge1xuICAgIHJldHVybiBuZXcgU2VhcmNoKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciBXZWIgU2hhcmVcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIGluc3RhbmNlIG9mIFdlYlNoYXJlXG4gICAqL1xuICB3ZWJTaGFyZSgpIHtcbiAgICByZXR1cm4gbmV3IFdlYlNoYXJlKHtcbiAgICAgIGZhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIG5ldyBUb2dnbGUoe1xuICAgICAgICAgIHNlbGVjdG9yOiBXZWJTaGFyZS5zZWxlY3RvclxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbInRoaXMiLCJsZXQiLCJjb25zdCIsImkiLCJBY2NvcmRpb24iLCJjb25zdHJ1Y3RvciIsIl90b2dnbGUiLCJUb2dnbGUiLCJzZWxlY3RvciIsIk1vYmlsZU1lbnUiLCJTZWFyY2giLCJhZnRlciIsInRvZ2dsZSIsImVsIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiaW5wdXQiLCJzZWxlY3RvcnMiLCJjbGFzc05hbWUiLCJpbmNsdWRlcyIsImZvY3VzIiwibWFpbiIsImljb25zIiwicGF0aCIsIkljb25zIiwic2V0dGluZ3MiLCJ2YWxpZCIsInN1Ym1pdCIsImZvcm0iLCJGb3JtcyIsIkVSUk9SX01FU1NBR0VfUEFSRU5UIiwid2F0Y2giLCJhY2NvcmRpb24iLCJjb3B5IiwiQ29weSIsInRyYWNrIiwiVHJhY2siLCJtb2JpbGVNZW51Iiwic2VhcmNoIiwid2ViU2hhcmUiLCJXZWJTaGFyZSIsImZhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7RUFFQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFNLE1BQU0sR0FRVixlQUFXLENBQUMsQ0FBQyxFQUFFOztBQUFDO0VBQ2xCO0VBQ0EsRUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztFQUNoRCxNQUFNLE1BQU0sQ0FBQyxjQUFjLEdBQUcsRUFBRSxHQUFDO0FBQ2pDO0VBQ0EsRUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCO0VBQ0EsRUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHO0VBQ3BCLElBQU0sUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRO0VBQzNELElBQU0sU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTO0VBQy9ELElBQU0sYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFD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
