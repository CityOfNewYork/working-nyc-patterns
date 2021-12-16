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
  class Toggle {
    /**
     * @constructor
     *
     * @param  {Object}  s  Settings for this Toggle instance
     *
     * @return {Object}     The class
     */
    constructor(s) {
      // Create an object to store existing toggle listeners (if it doesn't exist)
      if (!window.hasOwnProperty(Toggle.callback))
        window[Toggle.callback] = [];

      s = (!s) ? {} : s;

      this.settings = {
        selector: (s.selector) ? s.selector : Toggle.selector,
        namespace: (s.namespace) ? s.namespace : Toggle.namespace,
        inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
        activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
        before: (s.before) ? s.before : false,
        after: (s.after) ? s.after : false,
        valid: (s.valid) ? s.valid : false,
        focusable: (s.hasOwnProperty('focusable')) ? s.focusable : true,
        jump: (s.hasOwnProperty('jump')) ? s.jump : true
      };

      // Store the element for potential use in callbacks
      this.element = (s.element) ? s.element : false;

      if (this.element) {
        this.element.addEventListener('click', (event) => {
          this.toggle(event);
        });
      } else {
        // If there isn't an existing instantiated toggle, add the event listener.
        if (!window[Toggle.callback].hasOwnProperty(this.settings.selector)) {
          let body = document.querySelector('body');

          for (let i = 0; i < Toggle.events.length; i++) {
            let tggleEvent = Toggle.events[i];

            body.addEventListener(tggleEvent, event => {
              if (!event.target.matches(this.settings.selector))
                return;

              this.event = event;

              let type = event.type.toUpperCase();

              if (
                this[event.type] &&
                Toggle.elements[type] &&
                Toggle.elements[type].includes(event.target.tagName)
              ) this[event.type](event);
            });
          }
        }
      }

      // Record that a toggle using this selector has been instantiated.
      // This prevents double toggling.
      window[Toggle.callback][this.settings.selector] = true;

      return this;
    }

    /**
     * Click event handler
     *
     * @param  {Event}  event  The original click event
     */
    click(event) {
      this.toggle(event);
    }

    /**
     * Input/select/textarea change event handler. Checks to see if the
     * event.target is valid then toggles accordingly.
     *
     * @param  {Event}  event  The original input change event
     */
    change(event) {
      let valid = event.target.checkValidity();

      if (valid && !this.isActive(event.target)) {
        this.toggle(event); // show
      } else if (!valid && this.isActive(event.target)) {
        this.toggle(event); // hide
      }
    }

    /**
     * Check to see if the toggle is active
     *
     * @param  {Object}  element  The toggle element (trigger)
     */
    isActive(element) {
      let active = false;

      if (this.settings.activeClass) {
        active = element.classList.contains(this.settings.activeClass);
      }

      // if () {
        // Toggle.elementAriaRoles
        // TODO: Add catch to see if element aria roles are toggled
      // }

      // if () {
        // Toggle.targetAriaRoles
        // TODO: Add catch to see if target aria roles are toggled
      // }

      return active;
    }

    /**
     * Get the target of the toggle element (trigger)
     *
     * @param  {Object}  el  The toggle element (trigger)
     */
    getTarget(element) {
      let target = false;

      /** Anchor Links */
      target = (element.hasAttribute('href')) ?
        document.querySelector(element.getAttribute('href')) : target;

      /** Toggle Controls */
      target = (element.hasAttribute('aria-controls')) ?
        document.querySelector(`#${element.getAttribute('aria-controls')}`) : target;

      return target;
    }

    /**
     * The toggle event proxy for getting and setting the element/s and target
     *
     * @param  {Object}  event  The main click event
     *
     * @return {Object}         The Toggle instance
     */
    toggle(event) {
      let element = event.target;
      let target = false;
      let focusable = [];

      event.preventDefault();

      target = this.getTarget(element);

      /** Focusable Children */
      focusable = (target) ?
        target.querySelectorAll(Toggle.elFocusable.join(', ')) : focusable;

      /** Main Functionality */
      if (!target) return this;
      this.elementToggle(element, target, focusable);

      /** Undo */
      if (element.dataset[`${this.settings.namespace}Undo`]) {
        const undo = document.querySelector(
          element.dataset[`${this.settings.namespace}Undo`]
        );

        undo.addEventListener('click', (event) => {
          event.preventDefault();
          this.elementToggle(element, target);
          undo.removeEventListener('click');
        });
      }

      return this;
    }

    /**
     * Get other toggles that might control the same element
     *
     * @param   {Object}    element  The toggling element
     *
     * @return  {NodeList}           List of other toggling elements
     *                               that control the target
     */
    getOthers(element) {
      let selector = false;

      if (element.hasAttribute('href')) {
        selector = `[href="${element.getAttribute('href')}"]`;
      } else if (element.hasAttribute('aria-controls')) {
        selector = `[aria-controls="${element.getAttribute('aria-controls')}"]`;
      }

      return (selector) ? document.querySelectorAll(selector) : [];
    }

    /**
     * Hide the Toggle Target's focusable children from focus.
     * If an element has the data-attribute `data-toggle-tabindex`
     * it will use that as the default tab index of the element.
     *
     * @param   {NodeList}  elements  List of focusable elements
     *
     * @return  {Object}              The Toggle Instance
     */
    toggleFocusable(elements) {
      elements.forEach(element => {
        let tabindex = element.getAttribute('tabindex');

        if (tabindex === '-1') {
          let dataDefault = element
            .getAttribute(`data-${Toggle.namespace}-tabindex`);

          if (dataDefault) {
            element.setAttribute('tabindex', dataDefault);
          } else {
            element.removeAttribute('tabindex');
          }
        } else {
          element.setAttribute('tabindex', '-1');
        }
      });

      return this;
    }

    /**
     * Jumps to Element visibly and shifts focus
     * to the element by setting the tabindex
     *
     * @param   {Object}  element  The Toggling Element
     * @param   {Object}  target   The Target Element
     *
     * @return  {Object}           The Toggle instance
     */
    jumpTo(element, target) {
      // Reset the history state. This will clear out
      // the hash when the target is toggled closed
      history.pushState('', '',
        window.location.pathname + window.location.search);

      // Focus if active
      if (target.classList.contains(this.settings.activeClass)) {
        window.location.hash = element.getAttribute('href');

        target.setAttribute('tabindex', '0');
        target.focus({preventScroll: true});
      } else {
        target.removeAttribute('tabindex');
      }

      return this;
    }

    /**
     * The main toggling method for attributes
     *
     * @param  {Object}    element    The Toggle element
     * @param  {Object}    target     The Target element to toggle active/hidden
     * @param  {NodeList}  focusable  Any focusable children in the target
     *
     * @return {Object}               The Toggle instance
     */
    elementToggle(element, target, focusable = []) {
      let i = 0;
      let attr = '';
      let value = '';

      /**
       * Store elements for potential use in callbacks
       */

      this.element = element;
      this.target = target;
      this.others = this.getOthers(element);
      this.focusable = focusable;

      /**
       * Validity method property that will cancel the toggle if it returns false
       */

      if (this.settings.valid && !this.settings.valid(this))
        return this;

      /**
       * Toggling before hook
       */

      if (this.settings.before)
        this.settings.before(this);

      /**
       * Toggle Element and Target classes
       */

      if (this.settings.activeClass) {
        this.element.classList.toggle(this.settings.activeClass);
        this.target.classList.toggle(this.settings.activeClass);

        // If there are other toggles that control the same element
        this.others.forEach(other => {
          if (other !== this.element)
            other.classList.toggle(this.settings.activeClass);
        });
      }

      if (this.settings.inactiveClass)
        target.classList.toggle(this.settings.inactiveClass);

      /**
       * Target Element Aria Attributes
       */

      for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
        attr = Toggle.targetAriaRoles[i];
        value = this.target.getAttribute(attr);

        if (value != '' && value)
          this.target.setAttribute(attr, (value === 'true') ? 'false' : 'true');
      }

      /**
       * Toggle the target's focusable children tabindex
       */

      if (this.settings.focusable)
        this.toggleFocusable(this.focusable);

      /**
       * Jump to Target Element if Toggle Element is an anchor link
       */

      if (this.settings.jump && this.element.hasAttribute('href'))
        this.jumpTo(this.element, this.target);

      /**
       * Toggle Element (including multi toggles) Aria Attributes
       */

      for (i = 0; i < Toggle.elAriaRoles.length; i++) {
        attr = Toggle.elAriaRoles[i];
        value = this.element.getAttribute(attr);

        if (value != '' && value)
          this.element.setAttribute(attr, (value === 'true') ? 'false' : 'true');

        // If there are other toggles that control the same element
        this.others.forEach((other) => {
          if (other !== this.element && other.getAttribute(attr))
            other.setAttribute(attr, (value === 'true') ? 'false' : 'true');
        });
      }

      /**
       * Toggling complete hook
       */

      if (this.settings.after)
        this.settings.after(this);

      return this;
    }
  }

  /** @type  {String}  The main selector to add the toggling function to */
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

  /** @type  {Array}  Key attribute for storing toggles in the window */
  Toggle.callback = ['TogglesCallback'];

  /** @type  {Array}  Default events to to watch for toggling. Each must have a handler in the class and elements to look for in Toggle.elements */
  Toggle.events = ['click', 'change'];

  /** @type  {Array}  Elements to delegate to each event handler */
  Toggle.elements = {
    CLICK: ['A', 'BUTTON'],
    CHANGE: ['SELECT', 'INPUT', 'TEXTAREA']
  };

  /**
   * @class  Dialog
   *
   * Usage
   *
   * Element Attributes. Either <a> or <button>
   *
   * @attr  data-js="dialog"         Instantiates the toggling method
   * @attr  aria-controls=""         Targets the id of the dialog
   * @attr  aria-expanded="false"    Declares target closed/open when toggled
   * @attr  data-dialog="open"       Designates the primary opening element of the dialog
   * @attr  data-dialog="close"      Designates the primary closing element of the dialog
   * @attr  data-dialog-lock="true"  Wether to lock screen scrolling when dialog is open
   *
   * Target Attributes. Any <element>
   *
   * @attr  id=""               Matches aria-controls attr of Element
   * @attr  class="hidden"      Hidden class
   * @attr  aria-hidden="true"  Declares target open/closed when toggled
   */
  class Dialog {
    /**
     * @constructor  Instantiates dialog and toggle method
     *
     * @return  {Object}  The instantiated dialog with properties
     */
    constructor() {
      this.selector = Dialog.selector;

      this.selectors = Dialog.selectors;

      this.classes = Dialog.classes;

      this.dataAttrs = Dialog.dataAttrs;

      this.toggle = new Toggle({
        selector: this.selector,
        after: (toggle) => {
          let active = toggle.target.classList.contains(Toggle.activeClass);

          // Lock the body from scrolling if lock attribute is present
          if (active && toggle.element.dataset[this.dataAttrs.LOCK] === 'true') {
            // Scroll to the top of the page
            window.scroll(0, 0);

            // Prevent scrolling on the body
            document.querySelector('body').style.overflow = 'hidden';

            // When the last focusable item in the list looses focus loop to the first
            toggle.focusable.item(toggle.focusable.length - 1)
              .addEventListener('blur', () => {
                toggle.focusable.item(0).focus();
              });
          } else {
            // Remove if all other dialog body locks are inactive
            let locks = document.querySelectorAll([
                this.selector,
                this.selectors.locks,
                `.${Toggle.activeClass}`
              ].join(''));

            if (locks.length === 0) {
              document.querySelector('body').style.overflow = '';
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
  Dialog.selector = '[data-js*=\"dialog\"]';

  /** @type  {Object}  Additional selectors used by the script */
  Dialog.selectors = {
    CLOSE: '[data-dialog*="close"]',
    OPEN: '[data-dialog*="open"]',
    LOCKS: '[data-dialog-lock="true"]'
  };

  /** @type  {Object}  Data attribute namespaces */
  Dialog.dataAttrs = {
    LOCK: 'dialogLock'
  };

  /**
   * Sets the reading direction of the document based on URL Query Parameter
   * or toggle click. Stores the user's preference in local storage.
   */
  class Direction {
    /**
     * @constructor
     *
     * @return  {Class}  Instance of Direction
     */
    constructor() {
      /**
       * Settings
       */

      this.storage = Direction.storage;

      this.selectors = Direction.selectors;

      /**
       * Set the initial desired direction
       */

      let params = new URLSearchParams(window.location.search);

      let dir = (params.get('dir')) ?
        params.get('dir') : localStorage.getItem(this.storage.DIR);

      if (dir) this.set(dir);

      /**
       * Add event listeners for toggling
       */

      document.querySelector('body').addEventListener('click', event => {
        if (!event.target.matches(this.selectors.TOGGLE))
          return;

        this.click();
      });

      return this;
    }

    /**
     * The click event handler for the toggle
     *
     * @return  {Class}  Instance of Direction
     */
    click() {
      let current = document.documentElement.getAttribute('dir');

      let direction = (current === 'rtl') ? 'ltr' : 'rtl';

      this.set(direction);

      return this;
    }

    /**
     * Sets the attribute on the root element and in local storage.
     *
     * @param   {String}  direction  The desired direction; 'ltr' or 'rtl'
     *
     * @return  {Class}              Instance of Direction
     */
    set(direction) {
      document.documentElement.setAttribute('dir', direction);

      localStorage.setItem(this.storage.DIR, direction);

      return this;
    }
  }

  /**
   * Local storage keys
   *
   * @var {Object}
   */
  Direction.storage = {
    DIR: '--nyco-direction'
  };

  /**
   * Selector strings for the class
   *
   * @var {Object}
   */
  Direction.selectors = {
    TOGGLE: '[data-js="direction"]'
  };

  /**
   * Copy to Clipboard Helper
   */
  class Copy {
    /**
     * Add event listeners
     *
     * @constructor
     */
    constructor() {
      // Set attributes
      this.selector = Copy.selector;

      this.aria = Copy.aria;

      this.notifyTimeout = Copy.notifyTimeout;

      // Select the entire text when it's focused on
      document.querySelectorAll(Copy.selectors.TARGETS).forEach(item => {
        item.addEventListener('focus', () => this.select(item));
        item.addEventListener('click', () => this.select(item));
      });

      // The main click event for the class
      document.querySelector('body').addEventListener('click', event => {
        if (!event.target.matches(this.selector))
          return;

        this.element = event.target;

        this.element.setAttribute(this.aria, false);

        this.target = this.element.dataset.copy;

        if (this.copy(this.target)) {
          this.element.setAttribute(this.aria, true);

          clearTimeout(this.element['timeout']);

          this.element['timeout'] = setTimeout(() => {
            this.element.setAttribute(this.aria, false);
          }, this.notifyTimeout);
        }
      });

      return this;
    }

    /**
     * The click event handler
     *
     * @param   {String}  target  Content of target data attribute
     *
     * @return  {Boolean}         Wether copy was successful or not
     */
    copy(target) {
      let selector = Copy.selectors.TARGETS.replace(']', `="${target}"]`);

      let input = document.querySelector(selector);

      this.select(input);

      if (navigator.clipboard && navigator.clipboard.writeText)
        navigator.clipboard.writeText(input.value);
      else if (document.execCommand)
        document.execCommand('copy');
      else
        return false;

      return true;
    }

    /**
     * Handler for the text selection method
     *
     * @param   {Object}  input  The input with content to select
     */
    select(input) {
      input.select();

      input.setSelectionRange(0, 99999);
    }
  }

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
   * Utilities for Form components
   * @class
   */
  class Forms {
    /**
     * The Form constructor
     * @param  {Object} form The form DOM element
     */
    constructor(form = false) {
      this.FORM = form;

      this.strings = Forms.strings;

      this.submit = Forms.submit;

      this.classes = Forms.classes;

      this.markup = Forms.markup;

      this.selectors = Forms.selectors;

      this.attrs = Forms.attrs;

      this.FORM.setAttribute('novalidate', true);

      return this;
    }

    /**
     * Map toggled checkbox values to an input.
     * @param  {Object} event The parent click event.
     * @return {Element}      The target element.
     */
    joinValues(event) {
      if (!event.target.matches('input[type="checkbox"]'))
        return;

      if (!event.target.closest('[data-js-join-values]'))
        return;

      let el = event.target.closest('[data-js-join-values]');
      let target = document.querySelector(el.dataset.jsJoinValues);

      target.value = Array.from(
          el.querySelectorAll('input[type="checkbox"]')
        )
        .filter((e) => (e.value && e.checked))
        .map((e) => e.value)
        .join(', ');

      return target;
    }

    /**
     * A simple form validation class that uses native form validation. It will
     * add appropriate form feedback for each input that is invalid and native
     * localized browser messaging.
     *
     * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
     * See https://caniuse.com/#feat=form-validation for support
     *
     * @param  {Event}         event The form submission event
     * @return {Class/Boolean}       The form class or false if invalid
     */
    valid(event) {
      let validity = event.target.checkValidity();
      let elements = event.target.querySelectorAll(this.selectors.REQUIRED);

      for (let i = 0; i < elements.length; i++) {
        // Remove old messaging if it exists
        let el = elements[i];

        this.reset(el);

        // If this input valid, skip messaging
        if (el.validity.valid) continue;

        this.highlight(el);
      }

      return (validity) ? this : validity;
    }

    /**
     * Adds focus and blur events to inputs with required attributes
     * @param   {object}  form  Passing a form is possible, otherwise it will use
     *                          the form passed to the constructor.
     * @return  {class}         The form class
     */
    watch(form = false) {
      this.FORM = (form) ? form : this.FORM;

      let elements = this.FORM.querySelectorAll(this.selectors.REQUIRED);

      /** Watch Individual Inputs */
      for (let i = 0; i < elements.length; i++) {
        // Remove old messaging if it exists
        let el = elements[i];

        el.addEventListener('focus', () => {
          this.reset(el);
        });

        el.addEventListener('blur', () => {
          if (!el.validity.valid)
            this.highlight(el);
        });
      }

      /** Submit Event */
      this.FORM.addEventListener('submit', (event) => {
        event.preventDefault();

        if (this.valid(event) === false)
          return false;

        this.submit(event);
      });

      return this;
    }

    /**
     * Removes the validity message and classes from the message.
     * @param   {object}  el  The input element
     * @return  {class}       The form class
     */
    reset(el) {
      let container = (this.selectors.ERROR_MESSAGE_PARENT)
        ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

      let message = container.querySelector('.' + this.classes.ERROR_MESSAGE);

      // Remove old messaging if it exists
      container.classList.remove(this.classes.ERROR_CONTAINER);
      if (message) message.remove();

      // Remove error class from the form
      container.closest('form').classList.remove(this.classes.ERROR_CONTAINER);

      // Remove dynamic attributes from the input
      el.removeAttribute(this.attrs.ERROR_INPUT[0]);
      el.removeAttribute(this.attrs.ERROR_LABEL);

      return this;
    }

    /**
     * Displays a validity message to the user. It will first use any localized
     * string passed to the class for required fields missing input. If the
     * input is filled in but doesn't match the required pattern, it will use
     * a localized string set for the specific input type. If one isn't provided
     * it will use the default browser provided message.
     * @param   {object}  el  The invalid input element
     * @return  {class}       The form class
     */
    highlight(el) {
      let container = (this.selectors.ERROR_MESSAGE_PARENT)
        ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

      // Create the new error message.
      let message = document.createElement(this.markup.ERROR_MESSAGE);
      let id = `${el.getAttribute('id')}-${this.classes.ERROR_MESSAGE}`;

      // Get the error message from localized strings (if set).
      if (el.validity.valueMissing && this.strings.VALID_REQUIRED)
        message.innerHTML = this.strings.VALID_REQUIRED;
      else if (!el.validity.valid &&
        this.strings[`VALID_${el.type.toUpperCase()}_INVALID`]) {
        let stringKey = `VALID_${el.type.toUpperCase()}_INVALID`;
        message.innerHTML = this.strings[stringKey];
      } else
        message.innerHTML = el.validationMessage;

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
    }
  }

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
   * The Icon module
   * @class
   */
  class Icons {
    /**
     * @constructor
     * @param  {String} path The path of the icon file
     * @return {object} The class
     */
    constructor(path) {
      path = (path) ? path : Icons.path;

      fetch(path)
        .then((response) => {
          if (response.ok)
            return response.text();
          else
            // eslint-disable-next-line no-console
            console.dir(response);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.dir(error);
        })
        .then((data) => {
          const sprite = document.createElement('div');
          sprite.innerHTML = data;
          sprite.setAttribute('aria-hidden', true);
          sprite.setAttribute('style', 'display: none;');
          document.body.appendChild(sprite);
        });

      return this;
    }
  }

  /** @type {String} The path of the icon file */
  Icons.path = 'svg/icons.svg';

  var e=/^(?:submit|button|image|reset|file)$/i,t=/^(?:input|select|textarea|keygen)/i,n=/(\[[^\[\]]*\])/g;function a(e,t,a){if(t.match(n))!function e(t,n,a){if(0===n.length)return a;var r=n.shift(),i=r.match(/^\[(.+?)\]$/);if("[]"===r)return t=t||[],Array.isArray(t)?t.push(e(null,n,a)):(t._values=t._values||[],t._values.push(e(null,n,a))),t;if(i){var l=i[1],u=+l;isNaN(u)?(t=t||{})[l]=e(t[l],n,a):(t=t||[])[u]=e(t[u],n,a);}else t[r]=e(t[r],n,a);return t}(e,function(e){var t=[],a=new RegExp(n),r=/^([^\[\]]*)/.exec(e);for(r[1]&&t.push(r[1]);null!==(r=a.exec(e));)t.push(r[1]);return t}(t),a);else {var r=e[t];r?(Array.isArray(r)||(e[t]=[r]),e[t].push(a)):e[t]=a;}return e}function r(e,t,n){return n=(n=String(n)).replace(/(\r)?\n/g,"\r\n"),n=(n=encodeURIComponent(n)).replace(/%20/g,"+"),e+(e?"&":"")+encodeURIComponent(t)+"="+n}function serialize(n,i){"object"!=typeof i?i={hash:!!i}:void 0===i.hash&&(i.hash=!0);for(var l=i.hash?{}:"",u=i.serializer||(i.hash?a:r),s=n&&n.elements?n.elements:[],c=Object.create(null),o=0;o<s.length;++o){var h=s[o];if((i.disabled||!h.disabled)&&h.name&&t.test(h.nodeName)&&!e.test(h.type)){var p=h.name,f=h.value;if("checkbox"!==h.type&&"radio"!==h.type||h.checked||(f=void 0),i.empty){if("checkbox"!==h.type||h.checked||(f=!1),"radio"===h.type&&(c[h.name]||h.checked?h.checked&&(c[h.name]=!0):c[h.name]=!1),null==f&&"radio"==h.type)continue}else if(!f)continue;if("select-multiple"!==h.type)l=u(l,p,f);else {f=[];for(var v=h.options,m=!1,d=0;d<v.length;++d){var y=v[d];y.selected&&(y.value||i.empty&&!y.value)&&(m=!0,l=i.hash&&"[]"!==p.slice(p.length-2)?u(l,p+"[]",y.value):u(l,p,y.value));}!m&&i.empty&&(l=u(l,p,""));}}}if(i.empty)for(var p in c)c[p]||(l=u(l,p,""));return l}

  /**
   * @class  The Newsletter module
   */
  class Newsletter {
    /**
     * @constructor
     *
     * @param   {Object}  element  The Newsletter DOM Object
     *
     * @return  {Class}            The instantiated Newsletter object
     */
    constructor(element) {
      this._el = element;

      this.keys = Newsletter.keys;

      this.endpoints = Newsletter.endpoints;

      this.selectors = Newsletter.selectors;

      this.selector = Newsletter.selector;

      this.stringKeys = Newsletter.stringKeys;

      this.strings = Newsletter.strings;

      this.templates = Newsletter.templates;

      this.classes = Newsletter.classes;

      this.callback = [
        Newsletter.callback,
        Math.random().toString().replace('0.', '')
      ].join('');

      // This sets the script callback function to a global function that
      // can be accessed by the the requested script.
      window[this.callback] = (data) => {
        this._callback(data);
      };

      this.form = new Forms(this._el.querySelector('form'));

      this.form.strings = this.strings;

      this.form.submit = (event) => {
        event.preventDefault();

        this._submit(event)
          .then(this._onload)
          .catch(this._onerror);
      };

      this.form.watch();

      return this;
    }

    /**
     * The form submission method. Requests a script with a callback function
     * to be executed on our page. The callback function will be passed the
     * response as a JSON object (function parameter).
     *
     * @param   {Event}    event  The form submission event
     *
     * @return  {Promise}         A promise containing the new script call
     */
    _submit(event) {
      event.preventDefault();

      // Serialize the data
      this._data = serialize(event.target, {hash: true});

      // Switch the action to post-json. This creates an endpoint for mailchimp
      // that acts as a script that can be loaded onto our page.
      let action = event.target.action.replace(
        `${this.endpoints.MAIN}?`, `${this.endpoints.MAIN_JSON}?`
      );

      // Add our params to the action
      action = action + serialize(event.target, {serializer: (...params) => {
        let prev = (typeof params[0] === 'string') ? params[0] : '';

        return `${prev}&${params[1]}=${params[2]}`;
      }});

      // Append the callback reference. Mailchimp will wrap the JSON response in
      // our callback method. Once we load the script the callback will execute.
      action = `${action}&c=window.${this.callback}`;

      // Create a promise that appends the script response of the post-json method
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = encodeURI(action);
      });
    }

    /**
     * The script onload resolution
     *
     * @param   {Event}  event  The script on load event
     *
     * @return  {Class}         The Newsletter class
     */
    _onload(event) {
      event.path[0].remove();

      return this;
    }

    /**
     * The script on error resolution
     *
     * @param   {Object}  error  The script on error load event
     *
     * @return  {Class}          The Newsletter class
     */
    _onerror(error) {
      // eslint-disable-next-line no-console
      console.dir(error);

      return this;
    }

    /**
     * The callback function for the MailChimp Script call
     *
     * @param   {Object}  data  The success/error message from MailChimp
     *
     * @return  {Class}        The Newsletter class
     */
    _callback(data) {
      if (this[`_${data[this._key('MC_RESULT')]}`]) {
        this[`_${data[this._key('MC_RESULT')]}`](data.msg);
      } else {
        // eslint-disable-next-line no-console
        console.dir(data);
      }

      return this;
    }

    /**
     * Submission error handler
     *
     * @param   {string}  msg  The error message
     *
     * @return  {Class}        The Newsletter class
     */
    _error(msg) {
      this._elementsReset();
      this._messaging('WARNING', msg);

      return this;
    }

    /**
     * Submission success handler
     *
     * @param   {string}  msg  The success message
     *
     * @return  {Class}        The Newsletter class
     */
    _success(msg) {
      this._elementsReset();
      this._messaging('SUCCESS', msg);

      return this;
    }

    /**
     * Present the response message to the user
     *
     * @param   {String}  type  The message type
     * @param   {String}  msg   The message
     *
     * @return  {Class}         Newsletter
     */
    _messaging(type, msg = 'no message') {
      let strings = Object.keys(this.stringKeys);
      let handled = false;

      let alertBox = this._el.querySelector(this.selectors[type]);

      let alertBoxMsg = alertBox.querySelector(
        this.selectors.ALERT_TEXT
      );

      // Get the localized string, these should be written to the DOM already.
      // The utility contains a global method for retrieving them.
      let stringKeys = strings.filter(s => msg.includes(this.stringKeys[s]));
      msg = (stringKeys.length) ? this.strings[stringKeys[0]] : msg;
      handled = (stringKeys.length) ? true : false;

      // Replace string templates with values from either our form data or
      // the Newsletter strings object.
      for (let x = 0; x < this.templates.length; x++) {
        let template = this.templates[x];
        let key = template.replace('{{ ', '').replace(' }}', '');
        let value = this._data[key] || this.strings[key];
        let reg = new RegExp(template, 'gi');

        msg = msg.replace(reg, (value) ? value : '');
      }

      if (handled) {
        alertBoxMsg.innerHTML = msg;
      } else if (type === 'ERROR') {
        alertBoxMsg.innerHTML = this.strings.ERR_PLEASE_TRY_LATER;
      }

      if (alertBox) this._elementShow(alertBox, alertBoxMsg);

      return this;
    }

    /**
     * The main toggling method
     *
     * @return  {Class}  Newsletter
     */
    _elementsReset() {
      let targets = this._el.querySelectorAll(this.selectors.ALERTS);

      for (let i = 0; i < targets.length; i++)
        if (!targets[i].classList.contains(this.classes.HIDDEN)) {
          targets[i].classList.add(this.classes.HIDDEN);

          this.classes.ANIMATE.split(' ').forEach((item) =>
            targets[i].classList.remove(item)
          );

          // Screen Readers
          targets[i].setAttribute('aria-hidden', 'true');
          targets[i].querySelector(this.selectors.ALERT_TEXT)
            .setAttribute('aria-live', 'off');
        }

      return this;
    }

    /**
     * The main toggling method
     *
     * @param   {object}  target   Message container
     * @param   {object}  content  Content that changes dynamically that should
     *                             be announced to screen readers.
     *
     * @return  {Class}            Newsletter
     */
    _elementShow(target, content) {
      target.classList.toggle(this.classes.HIDDEN);

      this.classes.ANIMATE.split(' ').forEach((item) =>
        target.classList.toggle(item)
      );

      // Screen Readers
      target.setAttribute('aria-hidden', 'true');

      if (content) {
        content.setAttribute('aria-live', 'polite');
      }

      return this;
    }

    /**
     * A proxy function for retrieving the proper key
     *
     * @param   {string}  key  The reference for the stored keys.
     *
     * @return  {string}       The desired key.
     */
    _key(key) {
      return this.keys[key];
    }
  }

  /** @type  {Object}  API data keys */
  Newsletter.keys = {
    MC_RESULT: 'result',
    MC_MSG: 'msg'
  };

  /** @type  {Object}  API endpoints */
  Newsletter.endpoints = {
    MAIN: '/post',
    MAIN_JSON: '/post-json'
  };

  /** @type  {String}  The Mailchimp callback reference. */
  Newsletter.callback = 'NewsletterCallback';

  /** @type  {Object}  DOM selectors for the instance's concerns */
  Newsletter.selectors = {
    ELEMENT: '[data-js="newsletter"]',
    ALERTS: '[data-js*="alert"]',
    WARNING: '[data-js="alert-warning"]',
    SUCCESS: '[data-js="alert-success"]',
    ALERT_TEXT: '[data-js-alert="text"]'
  };

  /** @type  {String}  The main DOM selector for the instance */
  Newsletter.selector = Newsletter.selectors.ELEMENT;

  /** @type  {Object}  String references for the instance */
  Newsletter.stringKeys = {
    SUCCESS_CONFIRM_EMAIL: 'Almost finished...',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'too many',
    ERR_ALREADY_SUBSCRIBED: 'is already subscribed',
    ERR_INVALID_EMAIL: 'looks fake or invalid'
  };

  /** @type  {Object}  Available strings */
  Newsletter.strings = {
    VALID_REQUIRED: 'This field is required.',
    VALID_EMAIL_REQUIRED: 'Email is required.',
    VALID_EMAIL_INVALID: 'Please enter a valid email.',
    VALID_CHECKBOX_BOROUGH: 'Please select a borough.',
    ERR_PLEASE_TRY_LATER: 'There was an error with your submission. ' +
                          'Please try again later.',
    SUCCESS_CONFIRM_EMAIL: 'Almost finished... We need to confirm your email ' +
                           'address. To complete the subscription process, ' +
                           'please click the link in the email we just sent you.',
    ERR_PLEASE_ENTER_VALUE: 'Please enter a value',
    ERR_TOO_MANY_RECENT: 'Recipient "{{ EMAIL }}" has too ' +
                         'many recent signup requests',
    ERR_ALREADY_SUBSCRIBED: '{{ EMAIL }} is already subscribed ' +
                            'to list {{ LIST_NAME }}.',
    ERR_INVALID_EMAIL: 'This email address looks fake or invalid. ' +
                       'Please enter a real email address.',
    LIST_NAME: 'Newsletter'
  };

  /** @type  {Array}  Placeholders that will be replaced in message strings */
  Newsletter.templates = [
    '{{ EMAIL }}',
    '{{ LIST_NAME }}'
  ];

  Newsletter.classes = {
    ANIMATE: 'animated fadeInUp',
    HIDDEN: 'hidden'
  };

  /**
   * Cycles through a predefined object of theme classnames and toggles them on
   * the document element based on a click event. Uses local storage to save and
   * refer to a user's preference based on the last theme selected.
   */
  class Themes {
    /**
     * @constructor
     *
     * @param   {Object}  s  The settings object, may include 'storage',
     *                       'selectors', or 'theme' attributes
     *
     * @return  {Class}      The constructed instance of Themes.
     */
    constructor(s = {}) {
      /**
       * Settings
       */

      this.storage = (s.hasOwnProperty('storage')) ?
        Object.assign(Themes.storage, s.storage) : Themes.storage;

      this.selectors = (s.hasOwnProperty('selectors')) ?
        Object.assign(Themes.selectors, s.selectors) : Themes.selectors;

      this.themes = (s.hasOwnProperty('themes')) ? s.themes : Themes.themes;

      this.after = (s.hasOwnProperty('after')) ? s.after : Themes.after;

      this.before = (s.hasOwnProperty('before')) ? s.before : Themes.before;

      /**
       * Get initial user preference
       */

      this.preference = localStorage.getItem(this.storage.THEME);

      if (this.preference)
        this.set(JSON.parse(this.preference));

      /**
       * Add event listeners
       */

      document.querySelector('body').addEventListener('click', event => {
        if (!event.target.matches(this.selectors.TOGGLE))
          return;

        this.target = event.target;

        this.before(this);

        this.click(event);
      });

      return this;
    }

    /**
     * The click handler for theme cycling.
     *
     * @param   {Object}  event  The original click event that invoked the method
     *
     * @return  {Class}          The Themes instance
     */
    click(event) {
      // Get available theme classnames
      let cycle = this.themes.map(t => t.classname);

      // Check to see if the document has any of the theme class settings already
      let intersection = cycle.filter(item => {
        return [...document.documentElement.classList].includes(item)
      });

      // Find the starting index
      let start = (intersection.length === 0) ? 0 : cycle.indexOf(intersection[0]);
      let theme = (typeof cycle[start + 1] === 'undefined') ? cycle[0] : cycle[start + 1];

      // Toggle elements
      this.remove(this.themes.find(t => t.classname === cycle[start]))
        .set(this.themes.find(t => t.classname === theme));

      return this;
    }

    /**
     * The remove method for the theme. Resets all element classes and local storage.
     *
     * @param   {Object}  theme  The theme to remove
     *
     * @return  {Class}          The Themes instance
     */
    remove(theme) {
      document.documentElement.classList.remove(theme.classname);

      document.querySelectorAll(this.selectors.TOGGLE)
        .forEach(element => {
          element.classList.remove(`${theme.classname}${this.selectors.ACTIVE}`);
        });

      localStorage.removeItem(this.storage.THEME);

      return this;
    }

    /**
     * The setter method for theme. Adds element classes and sets local storage.
     *
     * @param   {Object}  theme  The theme object including classname and label
     *
     * @return  {Class}          The Themes instance
     */
    set(theme) {
      this.theme = theme;

      document.documentElement.classList.add(this.theme.classname);

      document.querySelectorAll(this.selectors.TOGGLE)
        .forEach(element => {
          element.classList.add(`${this.theme.classname}${this.selectors.ACTIVE}`);
        });

      document.querySelectorAll(this.selectors.LABEL)
        .forEach(element => {
          element.textContent = this.theme.label;
        });

      localStorage.setItem(this.storage.THEME, JSON.stringify(theme));

      this.after(this);

      return this;
    }
  }
  /**
   * The storage keys used by the script for local storage. The default is
   * `--nyco-theme` for the theme preference.
   *
   * @var {Object}
   */
  Themes.storage = {
    THEME: '--nyco-theme'
  };

  /**
   * The selectors for various elements queried by the utility. Refer to the
   * source for defaults.
   *
   * @var {Object}
   */
  Themes.selectors = {
    TOGGLE: '[data-js="themes"]',
    LABEL: '[data-js-themes="label"]',
    ACTIVE: ':active'
  };

  /**
   * The predefined theme Objects to cycle through, each with a corresponding
   * human-readable text label and classname. The default includes two themes;
   * `default` labelled "Light" theme and `dark` labelled "Dark".
   *
   * @var {Array}
   */
  Themes.themes = [
    {
      label: 'Light',
      classname: 'default'
    },
    {
      label: 'Dark',
      classname: 'dark'
    }
  ];

  /**
   * Before hook
   *
   * @return  {Function}  Triggers before the click event.
   */
  Themes.before = () => {};

  /**
   * After hook
   *
   * @return  {Function}  Triggers after the click event.
   */
  Themes.after = () => {};

  /**
   * Tracking bus for Google analytics and Webtrends.
   */
  class Track {
    constructor(s) {
      const body = document.querySelector('body');

      s = (!s) ? {} : s;

      this._settings = {
        selector: (s.selector) ? s.selector : Track.selector,
      };

      this.desinations = Track.destinations;

      body.addEventListener('click', (event) => {
        if (!event.target.matches(this._settings.selector))
          return;

        let key = event.target.dataset.trackKey;
        let data = JSON.parse(event.target.dataset.trackData);

        this.track(key, data);
      });

      return this;
    }

    /**
     * Tracking function wrapper
     *
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     *
     * @return {Object}            The final data object
     */
    track(key, data) {
      // Set the path name based on the location
      const d = data.map(el => {
          if (el.hasOwnProperty(Track.key))
            el[Track.key] = `${window.location.pathname}/${el[Track.key]}`;
          return el;
        });

      let wt = this.webtrends(key, d);
      let ga = this.gtag(key, d);

      /* eslint-disable no-console */
      console.dir({'Track': [wt, ga]});
      /* eslint-enable no-console */

      return d;
    };

    /**
     * Data bus for tracking views in Webtrends and Google Analytics
     *
     * @param  {String}      app   The name of the Single Page Application to track
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     */
    view(app, key, data) {
      let wt = this.webtrends(key, data);
      let ga = this.gtagView(app, key);

      /* eslint-disable no-console */
      console.dir({'Track': [wt, ga]});
      /* eslint-enable no-console */
    };

    /**
     * Push Events to Webtrends
     *
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     */
    webtrends(key, data) {
      if (
        typeof Webtrends === 'undefined' ||
        typeof data === 'undefined' ||
        !this.desinations.includes('webtrends')
      )
        return false;

      let event = [{
        'WT.ti': key
      }];

      if (data[0] && data[0].hasOwnProperty(Track.key))
        event.push({
          'DCS.dcsuri': data[0][Track.key]
        });
      else
        Object.assign(event, data);

      // Format data for Webtrends
      let wtd = {argsa: event.flatMap(e => {
        return Object.keys(e).flatMap(k => [k, e[k]]);
      })};

      // If 'action' is used as the key (for gtag.js), switch it to Webtrends
      let action = data.argsa.indexOf('action');

      if (action) data.argsa[action] = 'DCS.dcsuri';

      // Webtrends doesn't send the page view for MultiTrack, add path to url
      let dcsuri = data.argsa.indexOf('DCS.dcsuri');

      if (dcsuri)
        data.argsa[dcsuri + 1] = window.location.pathname + data.argsa[dcsuri + 1];

      /* eslint-disable no-undef */
      if (typeof Webtrends !== 'undefined')
        Webtrends.multiTrack(wtd);
      /* eslint-disable no-undef */

      return ['Webtrends', wtd];
    };

    /**
     * Push Click Events to Google Analytics
     *
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     */
    gtag(key, data) {
      if (
        typeof gtag === 'undefined' ||
        typeof data === 'undefined' ||
        !this.desinations.includes('gtag')
      )
        return false;

      let uri = data.find((element) => element.hasOwnProperty(Track.key));

      let event = {
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
     * @param  {String}  app  The name of the application
     * @param  {String}  key  The key or event of the data
     */
    gtagView(app, key) {
      if (
        typeof gtag === 'undefined' ||
        typeof data === 'undefined' ||
        !this.desinations.includes('gtag')
      )
        return false;

      let view = {
        app_name: app,
        screen_name: key
      };

      /* eslint-disable no-undef */
      gtag('event', 'screen_view', view);
      /* eslint-enable no-undef */

      return ['gtag', Track.key, 'screen_view', view];
    };
  }

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
   * A wrapper around the navigator.share() API
   */
  class WebShare {
    /**
     * @constructor
     */
    constructor(s = {}) {
      this.selector = (s.selector) ? s.selector : WebShare.selector;

      this.callback = (s.callback) ? s.callback : WebShare.callback;

      this.fallback = (s.fallback) ? s.fallback : WebShare.fallback;

      if (navigator.share) {
        // Remove fallback aria toggling attributes
        document.querySelectorAll(this.selector).forEach(item => {
          item.removeAttribute('aria-controls');
          item.removeAttribute('aria-expanded');
        });

        // Add event listener for the share click
        document.querySelector('body').addEventListener('click', event => {
          if (!event.target.matches(this.selector))
            return;

          this.element = event.target;

          this.data = JSON.parse(this.element.dataset.webShare);

          this.share(this.data);
        });
      } else
        this.fallback(); // Execute the fallback

      return this;
    }

    /**
     * Web Share API handler
     *
     * @param   {Object}  data  An object containing title, url, and text.
     *
     * @return  {Promise}       The response of the .share() method.
     */
    share(data = {}) {
      return navigator.share(data)
        .then(res => {
          this.callback(data);
        }).catch(err => {
          console.dir(err);
        });
    }
  }

  /** The html selector for the component */
  WebShare.selector = '[data-js*="web-share"]';

  /** Placeholder callback for a successful send */
  WebShare.callback = () => {
    console.dir('Success!');
  };

  /** Placeholder for the WebShare fallback */
  WebShare.fallback = () => {
    console.dir('Fallback!');
  };

  /**
   * @class  Set the the css variable '--100vh' to the size of the Window's inner height.
   */
  class WindowVh {
    /**
     * @constructor  Set event listeners
     */
    constructor(s = {}) {
      this.property = (s.property) ? s.property : WindowVh.property;

      window.addEventListener('load', () => {this.set();});

      window.addEventListener('resize', () => {this.set();});

      return this;
    }

    /**
     * Sets the css variable property
     */
    set() {
      document.documentElement.style
        .setProperty(this.property, `${window.innerHeight}px`);
    }
  }

  /** @param  {String}  property  The css variable string to set */
  WindowVh.property = '--100vh';

  /**
   * The Accordion module
   * @class
   */
  class Accordion {
    /**
     * @constructor
     * @return {object} The class
     */
    constructor() {
      this._toggle = new Toggle({
        selector: Accordion.selector
      });

      return this;
    }
  }

  /**
   * The dom selector for the module
   * @type {String}
   */
  Accordion.selector = '[data-js*="accordion"]';

  /**
   * A wrapper around Intersection Observer class
   */
  class Observe {
    constructor(s) {
      this.options = (s.options) ? Object.assign(Observe.options, s.options) : Observe.options;

      this.trigger = (s.trigger) ? s.trigger : Observe.trigger;

      // Instantiate the Intersection Observer
      this.observer = new IntersectionObserver((entries, observer) => {
        this.callback(entries, observer);
      }, this.options);

      // Select all of the items to observe
      this.items = s.element.querySelectorAll(`[data-js-observe-item="${s.element.dataset.jsObserveItems}"]`);

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];

        this.observer.observe(item);
      }
    }

    callback(entries, observer) {
      let prevEntry = entries[0];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        this.trigger(entry, prevEntry, observer);

        prevEntry = entry;
      }
    }
  }

  Observe.options = {
    root: null,
    rootMargin: '0px',
    threshold: [0.15]
  };

  Observe.trigger = entry => {
    console.dir(entry);
    console.dir('Observed! Create a entry trigger function and pass it to the instantiated Observe settings object.');
  };

  Observe.selector = '[data-js*="observe"]';

  class ActiveNavigation {
    /**
     * @constructor
     *
     * @return {Object}            The instantiated pattern
     */
    constructor() {
      /**
       * Method for toggling the jump navigation item, used by the click event
       * handler and the intersection observer event handler.
       *
       * @var NodeElement
       */
       const jumpClassToggle = item => {
        for (let i = 0; i < item.parentNode.children.length; i++) {
          const sibling = item.parentNode.children[i];

          if ('activeNavigationItem' in sibling.dataset) {
            let classActive = sibling.dataset.activeNavigationItem.split(' ');
            let classInactive = sibling.dataset.inactiveNavigationItem.split(' ');

            if (sibling.classList.contains(...classActive)) {
              sibling.classList.remove(...classActive);
              sibling.classList.add(...classInactive);
            }
          }
        }

        item.classList.remove(...item.dataset.inactiveNavigationItem.split(' '));
        item.classList.add(...item.dataset.activeNavigationItem.split(' '));
      };

      /**
       * Click event handler for jump navigation items
       *
       * @var NodeElement
       */
      (element => {
        if (element) {
          let activeNavigation = element.querySelectorAll('a[data-active-navigation-item]');

          for (let i = 0; i < activeNavigation.length; i++) {
            const a = activeNavigation[i];

            a.addEventListener('click', event => {
              setTimeout(() => {
                jumpClassToggle(event.target);
              }, 200);
            });
          }
        }
      })(document.querySelector('[data-js*="active-navigation"]'));

      /**
       * Intersection Observer event handler for jump navigation items
       *
       * @var NodeElementList
       */
      (elements => {
        elements.forEach(element => {
          new Observe({
            element: element,
            trigger: (entry) => {
              if (!entry.isIntersecting) return;

              let jumpItem = document.querySelector(`a[href="#${entry.target.id}"]`);

              if (!jumpItem) return;

              jumpItem.closest('[data-js*="active-navigation-scroll"]').scrollTo({
                left: jumpItem.offsetLeft,
                top: 0,
                behavior: 'smooth'
              });

              jumpClassToggle(jumpItem);
            }
          });
        });
      })(document.querySelectorAll(Observe.selector));
    }
  }

  /** @type  String  Main DOM selector */
  ActiveNavigation.selector = '[data-js*=\"active-navigation\"]';

  /**
   * The Mobile Nav module
   *
   * @class
   */
  class Menu {
    /**
     * @constructor
     *
     * @return  {object}  The class
     */
    constructor() {
      this.selector = Menu.selector;

      this.selectors = Menu.selectors;

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
  Menu.selector = '[data-js*="menu"]';

  /** @type  {Object}  Additional selectors used by the script */
  Menu.selectors = {
    CLOSE: '[data-js-menu*="close"]',
    OPEN: '[data-js-menu*="open"]'
  };

  /**
   * The Search module
   *
   * @class
   */
  class Search {
    /**
     * @constructor
     *
     * @return {object} The class
     */
    constructor() {
      this._toggle = new Toggle({
        selector: Search.selector,
        after: (toggle) => {
          let el = document.querySelector(Search.selector);
          let input = document.querySelector(Search.selectors.input);

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
  Search.selector = '[data-js*="search"]';

  Search.selectors = {
    input: '[data-js*="search__input"]'
  };

  // import ... from '../objects/...';

  /** import modules here as they are written. */

  /**
   * @class  Main pattern module
   */
  class main {
    /**
     * @constructor  Modules to be executed on main pattern instantiation here
     */
    constructor() {
      new WindowVh();
    }

    /**
     * An API for the Accordion Component
     *
     * @return  {Object}  Instance of Accordion
     */
    accordion() {
      return new Accordion();
    }

    /**
     * An API for the Active Navigation component
     *
     * @return  {Object}  Instance of ActiveNavigation
     */
    activeNavigation() {
      return new ActiveNavigation();
    }

    /**
     * An API for the Copy Utility
     *
     * @return  {Object}  Instance of Copy
     */
    copy() {
      return new Copy();
    }

    /**
     * An API for the Dialog Component
     *
     * @return  {Object}  Instance of Dialog
     */
    dialog() {
      return new Dialog();
    }

    /**
     * An API for the Direction Utility
     *
     * @return  {Object}  Instance of Direction
     */
    direction() {
      return new Direction();
    }

    /**
     * An API for the Icons Utility
     *
     * @param   {String}  path  The path of the icon file
     *
     * @return  {Object}        Instance of Icons
     */
    icons(path = 'svg/icons.svg') {
      return new Icons(path);
    }

    /**
     * An API for the Menu
     *
     * @return  {Object}  Instance of Menu
     */
    menu() {
      return new Menu();
    }

    /**
     * An API for the Newsletter Object
     *
     * @return  {Object}  Instance of Newsletter
     */
    newsletter(endpoint = '') {
      let element = document.querySelector(Newsletter.selector);

      if (element) {
        let newsletter = new Newsletter(element);

        newsletter.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';

        window[newsletter.callback] = data => {
          data.response = true;

          data.email = element.querySelector('input[name="EMAIL"]').value;

          window.location = `${endpoint}?` + Object.keys(data)
            .map(k => `${k}=${encodeURI(data[k])}`).join('&');
        };

        return newsletter;
      }
    }

    /**
     * An API for the Newsletter Object
     *
     * @return  {Object}  Instance of Newsletter
     */
    newsletterForm(element = document.querySelector('[data-js="newsletter-form"]')) {
      let params = new URLSearchParams(window.location.search);
      let response = params.get('response');
      let newsletter = null;

      if (element) {
        newsletter = new Newsletter(element);
        newsletter.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
      }

      if (response && newsletter) {
        let email = params.get('email');
        let input = element.querySelector('input[name="EMAIL"]');

        input.value = email;

        newsletter._data = {
          'result': params.get('result'),
          'msg': params.get('msg'),
          'EMAIL': email
        };

        newsletter._callback(newsletter._data);
      }

      return newsletter;
    }

    /**
     * An API for the Search
     *
     * @return  {Object}  Instance of Search
     */
    search() {
      return new Search();
    }

    /**
     * Set CSS properties of various element heights for calculating the true
     * window bottom value in CSS.
     */
    setObjectHeights() {
      const elements = [
        {
          'selector': '[data-js="navigation"]',
          'property': '--wnyc-dimensions-navigation-height'
        },
        {
          'selector': '[data-js="feedback"]',
          'property': '--wnyc-dimensions-feedback-height'
        }
      ];

      let setObjectHeights = (e) => {
        let element = document.querySelector(e['selector']);

        document.documentElement.style.setProperty(e['property'], `${element.clientHeight}px`);
      };

      for (let i = 0; i < elements.length; i++) {
        if (document.querySelector(elements[i]['selector'])) {
          window.addEventListener('load', () => setObjectHeights(elements[i]));
          window.addEventListener('resize', () => setObjectHeights(elements[i]));
        } else {
          document.documentElement.style.setProperty(elements[i]['property'], '0px');
        }
      }
    }

    /**
     * An API for the Themes Utility
     *
     * @return  {Object}  Instance of Themes
     */
    themes() {
      return new Themes({
        themes: [
          {
            label: 'Light Theme',
            classname: 'default',
            icon: 'feather-sun'
          },
          {
            label: 'Dark Theme',
            classname: 'light',
            icon: 'feather-moon'
          }
        ],
        after: thms => document.querySelectorAll(thms.selectors.TOGGLE)
          .forEach(element => {
            element.querySelector('[data-js-themes="icon"]')
              .setAttribute('href', `#${thms.theme.icon}`);
          })
      });
    }

    /**
     * An API for the Toggle Utility
     *
     * @param   {Object}  settings  Settings for the Toggle Class
     *
     * @return  {Object}            Instance of Toggle
     */
    toggle(settings = false) {
      return (settings) ? new Toggle(settings) : new Toggle();
    }

    /**
     * An API for the Track Object
     *
     * @return  {Object}  Instance of Track
     */
    track() {
      return new Track();
    }

    /**
     * An API for Web Share
     *
     * @return  {Object}  Instance of WebShare
     */
    webShare() {
      return new WebShare({
        fallback: () => {
          new Toggle({
            selector: WebShare.selector
          });
        }
      });
    }

    /**
     * API for validating a form.
     *
     * @param  {String}    selector  A custom selector for a form
     * @param  {Function}  submit    A custom event handler for a form
     */
    validate(selector = '[data-js="validate"]', submit = false) {
      if (document.querySelector(selector)) {
        let form = new Forms(document.querySelector(selector));

        form.submit = (submit) ? submit : (event) => {
          event.target.submit();
        };

        form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';

        form.watch();
      }
    }

    /**
     * Validates a form and builds a URL search query on the action based on data.
     *
     * @param  {String}  selector  A custom selector for a form
     */
    validateAndQuery(selector = '[data-js="validate-and-query"]') {
      let element = document.querySelector(selector);

      if (element) {
        let form = new Forms(element);

        form.submit = event => {
          let data = serialize(event.target, {hash: true});

          window.location = `${event.target.action}?` + Object.keys(data)
            .map(k => `${k}=${encodeURI(data[k])}`).join('&');
        };

        form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';

        form.watch();
      }
    }
  }

  return main;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9kaWFsb2cvZGlhbG9nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9kaXJlY3Rpb24vZGlyZWN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9jb3B5L2NvcHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9pY29ucy9pY29ucy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9mb3ItY2VyaWFsL2Rpc3QvaW5kZXgubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RoZW1lcy90aGVtZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RyYWNrL3RyYWNrLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy93ZWItc2hhcmUvd2ViLXNoYXJlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy93aW5kb3ctdmgvd2luZG93LXZoLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvb2JzZXJ2ZS9vYnNlcnZlLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWN0aXZlLW5hdmlnYXRpb24vYWN0aXZlLW5hdmlnYXRpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm4tbWVudS9zcmMvbWVudS5qcyIsIi4uLy4uL3NyYy9vYmplY3RzL3NlYXJjaC9zZWFyY2guanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3MuIFRoaXMgd2lsbCB0b2dnbGUgdGhlIGNsYXNzICdhY3RpdmUnIGFuZCAnaGlkZGVuJ1xuICogb24gdGFyZ2V0IGVsZW1lbnRzLCBkZXRlcm1pbmVkIGJ5IGEgY2xpY2sgZXZlbnQgb24gYSBzZWxlY3RlZCBsaW5rIG9yXG4gKiBlbGVtZW50LiBUaGlzIHdpbGwgYWxzbyB0b2dnbGUgdGhlIGFyaWEtaGlkZGVuIGF0dHJpYnV0ZSBmb3IgdGFyZ2V0ZWRcbiAqIGVsZW1lbnRzIHRvIHN1cHBvcnQgc2NyZWVuIHJlYWRlcnMuIFRhcmdldCBzZXR0aW5ncyBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0eVxuICogY2FuIGJlIGNvbnRyb2xsZWQgdGhyb3VnaCBkYXRhIGF0dHJpYnV0ZXMuXG4gKlxuICogVGhpcyB1c2VzIHRoZSAubWF0Y2hlcygpIG1ldGhvZCB3aGljaCB3aWxsIHJlcXVpcmUgYSBwb2x5ZmlsbCBmb3IgSUVcbiAqIGh0dHBzOi8vcG9seWZpbGwuaW8vdjIvZG9jcy9mZWF0dXJlcy8jRWxlbWVudF9wcm90b3R5cGVfbWF0Y2hlc1xuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIHMgIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHRvIHN0b3JlIGV4aXN0aW5nIHRvZ2dsZSBsaXN0ZW5lcnMgKGlmIGl0IGRvZXNuJ3QgZXhpc3QpXG4gICAgaWYgKCF3aW5kb3cuaGFzT3duUHJvcGVydHkoVG9nZ2xlLmNhbGxiYWNrKSlcbiAgICAgIHdpbmRvd1tUb2dnbGUuY2FsbGJhY2tdID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlLFxuICAgICAgdmFsaWQ6IChzLnZhbGlkKSA/IHMudmFsaWQgOiBmYWxzZSxcbiAgICAgIGZvY3VzYWJsZTogKHMuaGFzT3duUHJvcGVydHkoJ2ZvY3VzYWJsZScpKSA/IHMuZm9jdXNhYmxlIDogdHJ1ZSxcbiAgICAgIGp1bXA6IChzLmhhc093blByb3BlcnR5KCdqdW1wJykpID8gcy5qdW1wIDogdHJ1ZVxuICAgIH07XG5cbiAgICAvLyBTdG9yZSB0aGUgZWxlbWVudCBmb3IgcG90ZW50aWFsIHVzZSBpbiBjYWxsYmFja3NcbiAgICB0aGlzLmVsZW1lbnQgPSAocy5lbGVtZW50KSA/IHMuZWxlbWVudCA6IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGVyZSBpc24ndCBhbiBleGlzdGluZyBpbnN0YW50aWF0ZWQgdG9nZ2xlLCBhZGQgdGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAgaWYgKCF3aW5kb3dbVG9nZ2xlLmNhbGxiYWNrXS5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSkge1xuICAgICAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRvZ2dsZS5ldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgdGdnbGVFdmVudCA9IFRvZ2dsZS5ldmVudHNbaV07XG5cbiAgICAgICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIodGdnbGVFdmVudCwgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG5cbiAgICAgICAgICAgIGxldCB0eXBlID0gZXZlbnQudHlwZS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHRoaXNbZXZlbnQudHlwZV0gJiZcbiAgICAgICAgICAgICAgVG9nZ2xlLmVsZW1lbnRzW3R5cGVdICYmXG4gICAgICAgICAgICAgIFRvZ2dsZS5lbGVtZW50c1t0eXBlXS5pbmNsdWRlcyhldmVudC50YXJnZXQudGFnTmFtZSlcbiAgICAgICAgICAgICkgdGhpc1tldmVudC50eXBlXShldmVudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZWNvcmQgdGhhdCBhIHRvZ2dsZSB1c2luZyB0aGlzIHNlbGVjdG9yIGhhcyBiZWVuIGluc3RhbnRpYXRlZC5cbiAgICAvLyBUaGlzIHByZXZlbnRzIGRvdWJsZSB0b2dnbGluZy5cbiAgICB3aW5kb3dbVG9nZ2xlLmNhbGxiYWNrXVt0aGlzLnNldHRpbmdzLnNlbGVjdG9yXSA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGljayBldmVudCBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgIFRoZSBvcmlnaW5hbCBjbGljayBldmVudFxuICAgKi9cbiAgY2xpY2soZXZlbnQpIHtcbiAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogSW5wdXQvc2VsZWN0L3RleHRhcmVhIGNoYW5nZSBldmVudCBoYW5kbGVyLiBDaGVja3MgdG8gc2VlIGlmIHRoZVxuICAgKiBldmVudC50YXJnZXQgaXMgdmFsaWQgdGhlbiB0b2dnbGVzIGFjY29yZGluZ2x5LlxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gIGV2ZW50ICBUaGUgb3JpZ2luYWwgaW5wdXQgY2hhbmdlIGV2ZW50XG4gICAqL1xuICBjaGFuZ2UoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWQgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuXG4gICAgaWYgKHZhbGlkICYmICF0aGlzLmlzQWN0aXZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTsgLy8gc2hvd1xuICAgIH0gZWxzZSBpZiAoIXZhbGlkICYmIHRoaXMuaXNBY3RpdmUoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy50b2dnbGUoZXZlbnQpOyAvLyBoaWRlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSBpZiB0aGUgdG9nZ2xlIGlzIGFjdGl2ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBlbGVtZW50ICBUaGUgdG9nZ2xlIGVsZW1lbnQgKHRyaWdnZXIpXG4gICAqL1xuICBpc0FjdGl2ZShlbGVtZW50KSB7XG4gICAgbGV0IGFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpIHtcbiAgICAgIGFjdGl2ZSA9IGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpXG4gICAgfVxuXG4gICAgLy8gaWYgKCkge1xuICAgICAgLy8gVG9nZ2xlLmVsZW1lbnRBcmlhUm9sZXNcbiAgICAgIC8vIFRPRE86IEFkZCBjYXRjaCB0byBzZWUgaWYgZWxlbWVudCBhcmlhIHJvbGVzIGFyZSB0b2dnbGVkXG4gICAgLy8gfVxuXG4gICAgLy8gaWYgKCkge1xuICAgICAgLy8gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1xuICAgICAgLy8gVE9ETzogQWRkIGNhdGNoIHRvIHNlZSBpZiB0YXJnZXQgYXJpYSByb2xlcyBhcmUgdG9nZ2xlZFxuICAgIC8vIH1cblxuICAgIHJldHVybiBhY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0YXJnZXQgb2YgdGhlIHRvZ2dsZSBlbGVtZW50ICh0cmlnZ2VyKVxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBlbCAgVGhlIHRvZ2dsZSBlbGVtZW50ICh0cmlnZ2VyKVxuICAgKi9cbiAgZ2V0VGFyZ2V0KGVsZW1lbnQpIHtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG5cbiAgICAvKiogQW5jaG9yIExpbmtzICovXG4gICAgdGFyZ2V0ID0gKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgOiB0YXJnZXQ7XG5cbiAgICAvKiogVG9nZ2xlIENvbnRyb2xzICovXG4gICAgdGFyZ2V0ID0gKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YCkgOiB0YXJnZXQ7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0b2dnbGUgZXZlbnQgcHJveHkgZm9yIGdldHRpbmcgYW5kIHNldHRpbmcgdGhlIGVsZW1lbnQvcyBhbmQgdGFyZ2V0XG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgVGhlIFRvZ2dsZSBpbnN0YW5jZVxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHRhcmdldCA9IGZhbHNlO1xuICAgIGxldCBmb2N1c2FibGUgPSBbXTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0YXJnZXQgPSB0aGlzLmdldFRhcmdldChlbGVtZW50KTtcblxuICAgIC8qKiBGb2N1c2FibGUgQ2hpbGRyZW4gKi9cbiAgICBmb2N1c2FibGUgPSAodGFyZ2V0KSA/XG4gICAgICB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChUb2dnbGUuZWxGb2N1c2FibGUuam9pbignLCAnKSkgOiBmb2N1c2FibGU7XG5cbiAgICAvKiogTWFpbiBGdW5jdGlvbmFsaXR5ICovXG4gICAgaWYgKCF0YXJnZXQpIHJldHVybiB0aGlzO1xuICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbGVtZW50LCB0YXJnZXQsIGZvY3VzYWJsZSk7XG5cbiAgICAvKiogVW5kbyAqL1xuICAgIGlmIChlbGVtZW50LmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWxlbWVudC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWxlbWVudCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG90aGVyIHRvZ2dsZXMgdGhhdCBtaWdodCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gICAgZWxlbWVudCAgVGhlIHRvZ2dsaW5nIGVsZW1lbnRcbiAgICpcbiAgICogQHJldHVybiAge05vZGVMaXN0fSAgICAgICAgICAgTGlzdCBvZiBvdGhlciB0b2dnbGluZyBlbGVtZW50c1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGNvbnRyb2wgdGhlIHRhcmdldFxuICAgKi9cbiAgZ2V0T3RoZXJzKGVsZW1lbnQpIHtcbiAgICBsZXQgc2VsZWN0b3IgPSBmYWxzZTtcblxuICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpKSB7XG4gICAgICBzZWxlY3RvciA9IGBbaHJlZj1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKX1cIl1gO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkge1xuICAgICAgc2VsZWN0b3IgPSBgW2FyaWEtY29udHJvbHM9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9XCJdYDtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNlbGVjdG9yKSA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDogW107XG4gIH1cblxuICAvKipcbiAgICogSGlkZSB0aGUgVG9nZ2xlIFRhcmdldCdzIGZvY3VzYWJsZSBjaGlsZHJlbiBmcm9tIGZvY3VzLlxuICAgKiBJZiBhbiBlbGVtZW50IGhhcyB0aGUgZGF0YS1hdHRyaWJ1dGUgYGRhdGEtdG9nZ2xlLXRhYmluZGV4YFxuICAgKiBpdCB3aWxsIHVzZSB0aGF0IGFzIHRoZSBkZWZhdWx0IHRhYiBpbmRleCBvZiB0aGUgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtICAge05vZGVMaXN0fSAgZWxlbWVudHMgIExpc3Qgb2YgZm9jdXNhYmxlIGVsZW1lbnRzXG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICAgICAgICBUaGUgVG9nZ2xlIEluc3RhbmNlXG4gICAqL1xuICB0b2dnbGVGb2N1c2FibGUoZWxlbWVudHMpIHtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgbGV0IHRhYmluZGV4ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG5cbiAgICAgIGlmICh0YWJpbmRleCA9PT0gJy0xJykge1xuICAgICAgICBsZXQgZGF0YURlZmF1bHQgPSBlbGVtZW50XG4gICAgICAgICAgLmdldEF0dHJpYnV0ZShgZGF0YS0ke1RvZ2dsZS5uYW1lc3BhY2V9LXRhYmluZGV4YCk7XG5cbiAgICAgICAgaWYgKGRhdGFEZWZhdWx0KSB7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgZGF0YURlZmF1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEp1bXBzIHRvIEVsZW1lbnQgdmlzaWJseSBhbmQgc2hpZnRzIGZvY3VzXG4gICAqIHRvIHRoZSBlbGVtZW50IGJ5IHNldHRpbmcgdGhlIHRhYmluZGV4XG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBlbGVtZW50ICBUaGUgVG9nZ2xpbmcgRWxlbWVudFxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgdGFyZ2V0ICAgVGhlIFRhcmdldCBFbGVtZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICAgICBUaGUgVG9nZ2xlIGluc3RhbmNlXG4gICAqL1xuICBqdW1wVG8oZWxlbWVudCwgdGFyZ2V0KSB7XG4gICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUuIFRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAvLyB0aGUgaGFzaCB3aGVuIHRoZSB0YXJnZXQgaXMgdG9nZ2xlZCBjbG9zZWRcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIC8vIEZvY3VzIGlmIGFjdGl2ZVxuICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZCBmb3IgYXR0cmlidXRlc1xuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgIGVsZW1lbnQgICAgVGhlIFRvZ2dsZSBlbGVtZW50XG4gICAqIEBwYXJhbSAge09iamVjdH0gICAgdGFyZ2V0ICAgICBUaGUgVGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHBhcmFtICB7Tm9kZUxpc3R9ICBmb2N1c2FibGUgIEFueSBmb2N1c2FibGUgY2hpbGRyZW4gaW4gdGhlIHRhcmdldFxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgVGhlIFRvZ2dsZSBpbnN0YW5jZVxuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbGVtZW50LCB0YXJnZXQsIGZvY3VzYWJsZSA9IFtdKSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBlbGVtZW50cyBmb3IgcG90ZW50aWFsIHVzZSBpbiBjYWxsYmFja3NcbiAgICAgKi9cblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5vdGhlcnMgPSB0aGlzLmdldE90aGVycyhlbGVtZW50KTtcbiAgICB0aGlzLmZvY3VzYWJsZSA9IGZvY3VzYWJsZTtcblxuICAgIC8qKlxuICAgICAqIFZhbGlkaXR5IG1ldGhvZCBwcm9wZXJ0eSB0aGF0IHdpbGwgY2FuY2VsIHRoZSB0b2dnbGUgaWYgaXQgcmV0dXJucyBmYWxzZVxuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MudmFsaWQgJiYgIXRoaXMuc2V0dGluZ3MudmFsaWQodGhpcykpXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5iZWZvcmUpXG4gICAgICB0aGlzLnNldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgdGhpcy50YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIHRvZ2dsZXMgdGhhdCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgIHRoaXMub3RoZXJzLmZvckVhY2gob3RoZXIgPT4ge1xuICAgICAgICBpZiAob3RoZXIgIT09IHRoaXMuZWxlbWVudClcbiAgICAgICAgICBvdGhlci5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuaW5hY3RpdmVDbGFzcylcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG5cbiAgICAvKipcbiAgICAgKiBUYXJnZXQgRWxlbWVudCBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cblxuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGhpcy50YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRoaXMudGFyZ2V0LnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgdGhlIHRhcmdldCdzIGZvY3VzYWJsZSBjaGlsZHJlbiB0YWJpbmRleFxuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuZm9jdXNhYmxlKVxuICAgICAgdGhpcy50b2dnbGVGb2N1c2FibGUodGhpcy5mb2N1c2FibGUpO1xuXG4gICAgLyoqXG4gICAgICogSnVtcCB0byBUYXJnZXQgRWxlbWVudCBpZiBUb2dnbGUgRWxlbWVudCBpcyBhbiBhbmNob3IgbGlua1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuanVtcCAmJiB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJykpXG4gICAgICB0aGlzLmp1bXBUbyh0aGlzLmVsZW1lbnQsIHRoaXMudGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IChpbmNsdWRpbmcgbXVsdGkgdG9nZ2xlcykgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICB0aGlzLm90aGVycy5mb3JFYWNoKChvdGhlcikgPT4ge1xuICAgICAgICBpZiAob3RoZXIgIT09IHRoaXMuZWxlbWVudCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9va1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWZ0ZXIpXG4gICAgICB0aGlzLnNldHRpbmdzLmFmdGVyKHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRhcmdldCBlbGVtZW50ICovXG5Ub2dnbGUudGFyZ2V0QXJpYVJvbGVzID0gWydhcmlhLWhpZGRlbiddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEZvY3VzYWJsZSBlbGVtZW50cyB0byBoaWRlIHdpdGhpbiB0aGUgaGlkZGVuIHRhcmdldCBlbGVtZW50ICovXG5Ub2dnbGUuZWxGb2N1c2FibGUgPSBbXG4gICdhJywgJ2J1dHRvbicsICdpbnB1dCcsICdzZWxlY3QnLCAndGV4dGFyZWEnLCAnb2JqZWN0JywgJ2VtYmVkJywgJ2Zvcm0nLFxuICAnZmllbGRzZXQnLCAnbGVnZW5kJywgJ2xhYmVsJywgJ2FyZWEnLCAnYXVkaW8nLCAndmlkZW8nLCAnaWZyYW1lJywgJ3N2ZycsXG4gICdkZXRhaWxzJywgJ3RhYmxlJywgJ1t0YWJpbmRleF0nLCAnW2NvbnRlbnRlZGl0YWJsZV0nLCAnW3VzZW1hcF0nXG5dO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEtleSBhdHRyaWJ1dGUgZm9yIHN0b3JpbmcgdG9nZ2xlcyBpbiB0aGUgd2luZG93ICovXG5Ub2dnbGUuY2FsbGJhY2sgPSBbJ1RvZ2dsZXNDYWxsYmFjayddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIERlZmF1bHQgZXZlbnRzIHRvIHRvIHdhdGNoIGZvciB0b2dnbGluZy4gRWFjaCBtdXN0IGhhdmUgYSBoYW5kbGVyIGluIHRoZSBjbGFzcyBhbmQgZWxlbWVudHMgdG8gbG9vayBmb3IgaW4gVG9nZ2xlLmVsZW1lbnRzICovXG5Ub2dnbGUuZXZlbnRzID0gWydjbGljaycsICdjaGFuZ2UnXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBFbGVtZW50cyB0byBkZWxlZ2F0ZSB0byBlYWNoIGV2ZW50IGhhbmRsZXIgKi9cblRvZ2dsZS5lbGVtZW50cyA9IHtcbiAgQ0xJQ0s6IFsnQScsICdCVVRUT04nXSxcbiAgQ0hBTkdFOiBbJ1NFTEVDVCcsICdJTlBVVCcsICdURVhUQVJFQSddXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIEBjbGFzcyAgRGlhbG9nXG4gKlxuICogVXNhZ2VcbiAqXG4gKiBFbGVtZW50IEF0dHJpYnV0ZXMuIEVpdGhlciA8YT4gb3IgPGJ1dHRvbj5cbiAqXG4gKiBAYXR0ciAgZGF0YS1qcz1cImRpYWxvZ1wiICAgICAgICAgSW5zdGFudGlhdGVzIHRoZSB0b2dnbGluZyBtZXRob2RcbiAqIEBhdHRyICBhcmlhLWNvbnRyb2xzPVwiXCIgICAgICAgICBUYXJnZXRzIHRoZSBpZCBvZiB0aGUgZGlhbG9nXG4gKiBAYXR0ciAgYXJpYS1leHBhbmRlZD1cImZhbHNlXCIgICAgRGVjbGFyZXMgdGFyZ2V0IGNsb3NlZC9vcGVuIHdoZW4gdG9nZ2xlZFxuICogQGF0dHIgIGRhdGEtZGlhbG9nPVwib3BlblwiICAgICAgIERlc2lnbmF0ZXMgdGhlIHByaW1hcnkgb3BlbmluZyBlbGVtZW50IG9mIHRoZSBkaWFsb2dcbiAqIEBhdHRyICBkYXRhLWRpYWxvZz1cImNsb3NlXCIgICAgICBEZXNpZ25hdGVzIHRoZSBwcmltYXJ5IGNsb3NpbmcgZWxlbWVudCBvZiB0aGUgZGlhbG9nXG4gKiBAYXR0ciAgZGF0YS1kaWFsb2ctbG9jaz1cInRydWVcIiAgV2V0aGVyIHRvIGxvY2sgc2NyZWVuIHNjcm9sbGluZyB3aGVuIGRpYWxvZyBpcyBvcGVuXG4gKlxuICogVGFyZ2V0IEF0dHJpYnV0ZXMuIEFueSA8ZWxlbWVudD5cbiAqXG4gKiBAYXR0ciAgaWQ9XCJcIiAgICAgICAgICAgICAgIE1hdGNoZXMgYXJpYS1jb250cm9scyBhdHRyIG9mIEVsZW1lbnRcbiAqIEBhdHRyICBjbGFzcz1cImhpZGRlblwiICAgICAgSGlkZGVuIGNsYXNzXG4gKiBAYXR0ciAgYXJpYS1oaWRkZW49XCJ0cnVlXCIgIERlY2xhcmVzIHRhcmdldCBvcGVuL2Nsb3NlZCB3aGVuIHRvZ2dsZWRcbiAqL1xuY2xhc3MgRGlhbG9nIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvciAgSW5zdGFudGlhdGVzIGRpYWxvZyBhbmQgdG9nZ2xlIG1ldGhvZFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgVGhlIGluc3RhbnRpYXRlZCBkaWFsb2cgd2l0aCBwcm9wZXJ0aWVzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gRGlhbG9nLnNlbGVjdG9yO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBEaWFsb2cuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRGlhbG9nLmNsYXNzZXM7XG5cbiAgICB0aGlzLmRhdGFBdHRycyA9IERpYWxvZy5kYXRhQXR0cnM7XG5cbiAgICB0aGlzLnRvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3IsXG4gICAgICBhZnRlcjogKHRvZ2dsZSkgPT4ge1xuICAgICAgICBsZXQgYWN0aXZlID0gdG9nZ2xlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmFjdGl2ZUNsYXNzKTtcblxuICAgICAgICAvLyBMb2NrIHRoZSBib2R5IGZyb20gc2Nyb2xsaW5nIGlmIGxvY2sgYXR0cmlidXRlIGlzIHByZXNlbnRcbiAgICAgICAgaWYgKGFjdGl2ZSAmJiB0b2dnbGUuZWxlbWVudC5kYXRhc2V0W3RoaXMuZGF0YUF0dHJzLkxPQ0tdID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAvLyBTY3JvbGwgdG8gdGhlIHRvcCBvZiB0aGUgcGFnZVxuICAgICAgICAgIHdpbmRvdy5zY3JvbGwoMCwgMCk7XG5cbiAgICAgICAgICAvLyBQcmV2ZW50IHNjcm9sbGluZyBvbiB0aGUgYm9keVxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICAgICAgLy8gV2hlbiB0aGUgbGFzdCBmb2N1c2FibGUgaXRlbSBpbiB0aGUgbGlzdCBsb29zZXMgZm9jdXMgbG9vcCB0byB0aGUgZmlyc3RcbiAgICAgICAgICB0b2dnbGUuZm9jdXNhYmxlLml0ZW0odG9nZ2xlLmZvY3VzYWJsZS5sZW5ndGggLSAxKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRvZ2dsZS5mb2N1c2FibGUuaXRlbSgwKS5mb2N1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIGlmIGFsbCBvdGhlciBkaWFsb2cgYm9keSBsb2NrcyBhcmUgaW5hY3RpdmVcbiAgICAgICAgICBsZXQgbG9ja3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFtcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvcixcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMubG9ja3MsXG4gICAgICAgICAgICAgIGAuJHtUb2dnbGUuYWN0aXZlQ2xhc3N9YFxuICAgICAgICAgICAgXS5qb2luKCcnKSk7XG5cbiAgICAgICAgICBpZiAobG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb2N1cyBvbiB0aGUgY2xvc2Ugb3Igb3BlbiBidXR0b24gaWYgcHJlc2VudFxuICAgICAgICBsZXQgaWQgPSBgW2FyaWEtY29udHJvbHM9XCIke3RvZ2dsZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdpZCcpfVwiXWA7XG4gICAgICAgIGxldCBjbG9zZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuQ0xPU0UgKyBpZCk7XG4gICAgICAgIGxldCBvcGVuID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5PUEVOICsgaWQpO1xuXG4gICAgICAgIGlmIChhY3RpdmUgJiYgY2xvc2UpIHtcbiAgICAgICAgICBjbG9zZS5mb2N1cygpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wZW4pIHtcbiAgICAgICAgICBvcGVuLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIE1haW4gRE9NIHNlbGVjdG9yICovXG5EaWFsb2cuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVxcXCJkaWFsb2dcXFwiXSc7XG5cbi8qKiBAdHlwZSAge09iamVjdH0gIEFkZGl0aW9uYWwgc2VsZWN0b3JzIHVzZWQgYnkgdGhlIHNjcmlwdCAqL1xuRGlhbG9nLnNlbGVjdG9ycyA9IHtcbiAgQ0xPU0U6ICdbZGF0YS1kaWFsb2cqPVwiY2xvc2VcIl0nLFxuICBPUEVOOiAnW2RhdGEtZGlhbG9nKj1cIm9wZW5cIl0nLFxuICBMT0NLUzogJ1tkYXRhLWRpYWxvZy1sb2NrPVwidHJ1ZVwiXSdcbn07XG5cbi8qKiBAdHlwZSAge09iamVjdH0gIERhdGEgYXR0cmlidXRlIG5hbWVzcGFjZXMgKi9cbkRpYWxvZy5kYXRhQXR0cnMgPSB7XG4gIExPQ0s6ICdkaWFsb2dMb2NrJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRGlhbG9nOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTZXRzIHRoZSByZWFkaW5nIGRpcmVjdGlvbiBvZiB0aGUgZG9jdW1lbnQgYmFzZWQgb24gVVJMIFF1ZXJ5IFBhcmFtZXRlclxuICogb3IgdG9nZ2xlIGNsaWNrLiBTdG9yZXMgdGhlIHVzZXIncyBwcmVmZXJlbmNlIGluIGxvY2FsIHN0b3JhZ2UuXG4gKi9cbmNsYXNzIERpcmVjdGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgSW5zdGFuY2Ugb2YgRGlyZWN0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKipcbiAgICAgKiBTZXR0aW5nc1xuICAgICAqL1xuXG4gICAgdGhpcy5zdG9yYWdlID0gRGlyZWN0aW9uLnN0b3JhZ2U7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IERpcmVjdGlvbi5zZWxlY3RvcnM7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGluaXRpYWwgZGVzaXJlZCBkaXJlY3Rpb25cbiAgICAgKi9cblxuICAgIGxldCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgbGV0IGRpciA9IChwYXJhbXMuZ2V0KCdkaXInKSkgP1xuICAgICAgcGFyYW1zLmdldCgnZGlyJykgOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnN0b3JhZ2UuRElSKTtcblxuICAgIGlmIChkaXIpIHRoaXMuc2V0KGRpcik7XG5cbiAgICAvKipcbiAgICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciB0b2dnbGluZ1xuICAgICAqL1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9ycy5UT0dHTEUpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuY2xpY2soKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjbGljayBldmVudCBoYW5kbGVyIGZvciB0aGUgdG9nZ2xlXG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gIEluc3RhbmNlIG9mIERpcmVjdGlvblxuICAgKi9cbiAgY2xpY2soKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXInKTtcblxuICAgIGxldCBkaXJlY3Rpb24gPSAoY3VycmVudCA9PT0gJ3J0bCcpID8gJ2x0cicgOiAncnRsJztcblxuICAgIHRoaXMuc2V0KGRpcmVjdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhdHRyaWJ1dGUgb24gdGhlIHJvb3QgZWxlbWVudCBhbmQgaW4gbG9jYWwgc3RvcmFnZS5cbiAgICpcbiAgICogQHBhcmFtICAge1N0cmluZ30gIGRpcmVjdGlvbiAgVGhlIGRlc2lyZWQgZGlyZWN0aW9uOyAnbHRyJyBvciAncnRsJ1xuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICAgICAgICAgICAgICBJbnN0YW5jZSBvZiBEaXJlY3Rpb25cbiAgICovXG4gIHNldChkaXJlY3Rpb24pIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkaXInLCBkaXJlY3Rpb24pO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlLkRJUiwgZGlyZWN0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogTG9jYWwgc3RvcmFnZSBrZXlzXG4gKlxuICogQHZhciB7T2JqZWN0fVxuICovXG5EaXJlY3Rpb24uc3RvcmFnZSA9IHtcbiAgRElSOiAnLS1ueWNvLWRpcmVjdGlvbidcbn07XG5cbi8qKlxuICogU2VsZWN0b3Igc3RyaW5ncyBmb3IgdGhlIGNsYXNzXG4gKlxuICogQHZhciB7T2JqZWN0fVxuICovXG5EaXJlY3Rpb24uc2VsZWN0b3JzID0ge1xuICBUT0dHTEU6ICdbZGF0YS1qcz1cImRpcmVjdGlvblwiXSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERpcmVjdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb3B5IHRvIENsaXBib2FyZCBIZWxwZXJcbiAqL1xuY2xhc3MgQ29weSB7XG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnNlbGVjdG9yID0gQ29weS5zZWxlY3RvcjtcblxuICAgIHRoaXMuYXJpYSA9IENvcHkuYXJpYTtcblxuICAgIHRoaXMubm90aWZ5VGltZW91dCA9IENvcHkubm90aWZ5VGltZW91dDtcblxuICAgIC8vIFNlbGVjdCB0aGUgZW50aXJlIHRleHQgd2hlbiBpdCdzIGZvY3VzZWQgb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKENvcHkuc2VsZWN0b3JzLlRBUkdFVFMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gdGhpcy5zZWxlY3QoaXRlbSkpO1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2VsZWN0KGl0ZW0pKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBtYWluIGNsaWNrIGV2ZW50IGZvciB0aGUgY2xhc3NcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmFyaWEsIGZhbHNlKTtcblxuICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmVsZW1lbnQuZGF0YXNldC5jb3B5O1xuXG4gICAgICBpZiAodGhpcy5jb3B5KHRoaXMudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMuYXJpYSwgdHJ1ZSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZWxlbWVudFsndGltZW91dCddKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRbJ3RpbWVvdXQnXSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5hcmlhLCBmYWxzZSk7XG4gICAgICAgIH0sIHRoaXMubm90aWZ5VGltZW91dCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgdGFyZ2V0ICBDb250ZW50IG9mIHRhcmdldCBkYXRhIGF0dHJpYnV0ZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gICAgICAgICBXZXRoZXIgY29weSB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICovXG4gIGNvcHkodGFyZ2V0KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gQ29weS5zZWxlY3RvcnMuVEFSR0VUUy5yZXBsYWNlKCddJywgYD1cIiR7dGFyZ2V0fVwiXWApO1xuXG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICB0aGlzLnNlbGVjdChpbnB1dCk7XG5cbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dClcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGlucHV0LnZhbHVlKTtcbiAgICBlbHNlIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZClcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgdGhlIHRleHQgc2VsZWN0aW9uIG1ldGhvZFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgaW5wdXQgIFRoZSBpbnB1dCB3aXRoIGNvbnRlbnQgdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3QoaW5wdXQpIHtcbiAgICBpbnB1dC5zZWxlY3QoKTtcblxuICAgIGlucHV0LnNldFNlbGVjdGlvblJhbmdlKDAsIDk5OTk5KTtcbiAgfVxufVxuXG4vKiogVGhlIG1haW4gZWxlbWVudCBzZWxlY3RvciAqL1xuQ29weS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJjb3B5XCJdJztcblxuLyoqIENsYXNzIHNlbGVjdG9ycyAqL1xuQ29weS5zZWxlY3RvcnMgPSB7XG4gIFRBUkdFVFM6ICdbZGF0YS1jb3B5LXRhcmdldF0nXG59O1xuXG4vKiogQnV0dG9uIGFyaWEgcm9sZSB0byB0b2dnbGUgKi9cbkNvcHkuYXJpYSA9ICdhcmlhLXByZXNzZWQnO1xuXG4vKiogVGltZW91dCBmb3IgdGhlIFwiQ29waWVkIVwiIG5vdGlmaWNhdGlvbiAqL1xuQ29weS5ub3RpZnlUaW1lb3V0ID0gMTUwMDtcblxuZXhwb3J0IGRlZmF1bHQgQ29weTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIEZvcm0gY29tcG9uZW50c1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZvcm1zIHtcbiAgLyoqXG4gICAqIFRoZSBGb3JtIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZm9ybSBUaGUgZm9ybSBET00gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gZm9ybTtcblxuICAgIHRoaXMuc3RyaW5ncyA9IEZvcm1zLnN0cmluZ3M7XG5cbiAgICB0aGlzLnN1Ym1pdCA9IEZvcm1zLnN1Ym1pdDtcblxuICAgIHRoaXMuY2xhc3NlcyA9IEZvcm1zLmNsYXNzZXM7XG5cbiAgICB0aGlzLm1hcmt1cCA9IEZvcm1zLm1hcmt1cDtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gRm9ybXMuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5hdHRycyA9IEZvcm1zLmF0dHJzO1xuXG4gICAgdGhpcy5GT1JNLnNldEF0dHJpYnV0ZSgnbm92YWxpZGF0ZScsIHRydWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICAgKi9cbiAgam9pblZhbHVlcyhldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gICAgdGFyZ2V0LnZhbHVlID0gQXJyYXkuZnJvbShcbiAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICAgIClcbiAgICAgIC5maWx0ZXIoKGUpID0+IChlLnZhbHVlICYmIGUuY2hlY2tlZCkpXG4gICAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICAgKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICAgKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gICAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzL0Jvb2xlYW59ICAgICAgIFRoZSBmb3JtIGNsYXNzIG9yIGZhbHNlIGlmIGludmFsaWRcbiAgICovXG4gIHZhbGlkKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICB0aGlzLnJlc2V0KGVsKTtcblxuICAgICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbGlkaXR5KSA/IHRoaXMgOiB2YWxpZGl0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGZvY3VzIGFuZCBibHVyIGV2ZW50cyB0byBpbnB1dHMgd2l0aCByZXF1aXJlZCBhdHRyaWJ1dGVzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBmb3JtICBQYXNzaW5nIGEgZm9ybSBpcyBwb3NzaWJsZSwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHdhdGNoKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IChmb3JtKSA/IGZvcm0gOiB0aGlzLkZPUk07XG5cbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICAvKiogV2F0Y2ggSW5kaXZpZHVhbCBJbnB1dHMgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgdGhpcy5yZXNldChlbCk7XG4gICAgICB9KTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogU3VibWl0IEV2ZW50ICovXG4gICAgdGhpcy5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKHRoaXMudmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnN1Ym1pdChldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2YWxpZGl0eSBtZXNzYWdlIGFuZCBjbGFzc2VzIGZyb20gdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgcmVzZXQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gUmVtb3ZlIGVycm9yIGNsYXNzIGZyb20gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICAvLyBSZW1vdmUgZHluYW1pYyBhdHRyaWJ1dGVzIGZyb20gdGhlIGlucHV0XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0pO1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgdmFsaWRpdHkgbWVzc2FnZSB0byB0aGUgdXNlci4gSXQgd2lsbCBmaXJzdCB1c2UgYW55IGxvY2FsaXplZFxuICAgKiBzdHJpbmcgcGFzc2VkIHRvIHRoZSBjbGFzcyBmb3IgcmVxdWlyZWQgZmllbGRzIG1pc3NpbmcgaW5wdXQuIElmIHRoZVxuICAgKiBpbnB1dCBpcyBmaWxsZWQgaW4gYnV0IGRvZXNuJ3QgbWF0Y2ggdGhlIHJlcXVpcmVkIHBhdHRlcm4sIGl0IHdpbGwgdXNlXG4gICAqIGEgbG9jYWxpemVkIHN0cmluZyBzZXQgZm9yIHRoZSBzcGVjaWZpYyBpbnB1dCB0eXBlLiBJZiBvbmUgaXNuJ3QgcHJvdmlkZWRcbiAgICogaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBwcm92aWRlZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnZhbGlkIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgaGlnaGxpZ2h0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5tYXJrdXAuRVJST1JfTUVTU0FHRSk7XG4gICAgbGV0IGlkID0gYCR7ZWwuZ2V0QXR0cmlidXRlKCdpZCcpfS0ke3RoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFfWA7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncyAoaWYgc2V0KS5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nICYmIHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZCAmJlxuICAgICAgdGhpcy5zdHJpbmdzW2BWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBdKSB7XG4gICAgICBsZXQgc3RyaW5nS2V5ID0gYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYDtcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW3N0cmluZ0tleV07XG4gICAgfSBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgLy8gU2V0IGFyaWEgYXR0cmlidXRlcyBhbmQgY3NzIGNsYXNzZXMgdG8gdGhlIG1lc3NhZ2VcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzBdLFxuICAgICAgdGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzFdKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZSB0byB0aGUgZG9tLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyB0byB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIEFkZCBkeW5hbWljIGF0dHJpYnV0ZXMgdG8gdGhlIGlucHV0XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0sIHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMV0pO1xuICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMLCBpZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEEgZGljdGlvbmFpcnkgb2Ygc3RyaW5ncyBpbiB0aGUgZm9ybWF0LlxuICoge1xuICogICAnVkFMSURfUkVRVUlSRUQnOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gKiAgICdWQUxJRF97eyBUWVBFIH19X0lOVkFMSUQnOiAnSW52YWxpZCdcbiAqIH1cbiAqL1xuRm9ybXMuc3RyaW5ncyA9IHt9O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBzdWJtaXQgZnVuY3Rpb24gKi9cbkZvcm1zLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKiBDbGFzc2VzIGZvciB2YXJpb3VzIGNvbnRhaW5lcnMgKi9cbkZvcm1zLmNsYXNzZXMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2Vycm9yLW1lc3NhZ2UnLCAvLyBlcnJvciBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2VcbiAgJ0VSUk9SX0NPTlRBSU5FUic6ICdlcnJvcicsIC8vIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZSBwYXJlbnRcbiAgJ0VSUk9SX0ZPUk0nOiAnZXJyb3InXG59O1xuXG4vKiogSFRNTCB0YWdzIGFuZCBtYXJrdXAgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLm1hcmt1cCA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZGl2Jyxcbn07XG5cbi8qKiBET00gU2VsZWN0b3JzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5zZWxlY3RvcnMgPSB7XG4gICdSRVFVSVJFRCc6ICdbcmVxdWlyZWQ9XCJ0cnVlXCJdJywgLy8gU2VsZWN0b3IgZm9yIHJlcXVpcmVkIGlucHV0IGVsZW1lbnRzXG4gICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IGZhbHNlXG59O1xuXG4vKiogQXR0cmlidXRlcyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuYXR0cnMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogWydhcmlhLWxpdmUnLCAncG9saXRlJ10sIC8vIEF0dHJpYnV0ZSBmb3IgdmFsaWQgZXJyb3IgbWVzc2FnZVxuICAnRVJST1JfSU5QVVQnOiBbJ2FyaWEtaW52YWxpZCcsICd0cnVlJ10sXG4gICdFUlJPUl9MQUJFTCc6ICdhcmlhLWRlc2NyaWJlZGJ5J1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9ybXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIEljb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgSWNvbnMge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXRoKSB7XG4gICAgcGF0aCA9IChwYXRoKSA/IHBhdGggOiBJY29ucy5wYXRoO1xuXG4gICAgZmV0Y2gocGF0aClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgICBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lOycpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwcml0ZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlICovXG5JY29ucy5wYXRoID0gJ3N2Zy9pY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsInZhciBlPS9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaSx0PS9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGtleWdlbikvaSxuPS8oXFxbW15cXFtcXF1dKlxcXSkvZztmdW5jdGlvbiBhKGUsdCxhKXtpZih0Lm1hdGNoKG4pKSFmdW5jdGlvbiBlKHQsbixhKXtpZigwPT09bi5sZW5ndGgpcmV0dXJuIGE7dmFyIHI9bi5zaGlmdCgpLGk9ci5tYXRjaCgvXlxcWyguKz8pXFxdJC8pO2lmKFwiW11cIj09PXIpcmV0dXJuIHQ9dHx8W10sQXJyYXkuaXNBcnJheSh0KT90LnB1c2goZShudWxsLG4sYSkpOih0Ll92YWx1ZXM9dC5fdmFsdWVzfHxbXSx0Ll92YWx1ZXMucHVzaChlKG51bGwsbixhKSkpLHQ7aWYoaSl7dmFyIGw9aVsxXSx1PStsO2lzTmFOKHUpPyh0PXR8fHt9KVtsXT1lKHRbbF0sbixhKToodD10fHxbXSlbdV09ZSh0W3VdLG4sYSl9ZWxzZSB0W3JdPWUodFtyXSxuLGEpO3JldHVybiB0fShlLGZ1bmN0aW9uKGUpe3ZhciB0PVtdLGE9bmV3IFJlZ0V4cChuKSxyPS9eKFteXFxbXFxdXSopLy5leGVjKGUpO2ZvcihyWzFdJiZ0LnB1c2goclsxXSk7bnVsbCE9PShyPWEuZXhlYyhlKSk7KXQucHVzaChyWzFdKTtyZXR1cm4gdH0odCksYSk7ZWxzZXt2YXIgcj1lW3RdO3I/KEFycmF5LmlzQXJyYXkocil8fChlW3RdPVtyXSksZVt0XS5wdXNoKGEpKTplW3RdPWF9cmV0dXJuIGV9ZnVuY3Rpb24gcihlLHQsbil7cmV0dXJuIG49KG49U3RyaW5nKG4pKS5yZXBsYWNlKC8oXFxyKT9cXG4vZyxcIlxcclxcblwiKSxuPShuPWVuY29kZVVSSUNvbXBvbmVudChuKSkucmVwbGFjZSgvJTIwL2csXCIrXCIpLGUrKGU/XCImXCI6XCJcIikrZW5jb2RlVVJJQ29tcG9uZW50KHQpK1wiPVwiK259ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obixpKXtcIm9iamVjdFwiIT10eXBlb2YgaT9pPXtoYXNoOiEhaX06dm9pZCAwPT09aS5oYXNoJiYoaS5oYXNoPSEwKTtmb3IodmFyIGw9aS5oYXNoP3t9OlwiXCIsdT1pLnNlcmlhbGl6ZXJ8fChpLmhhc2g/YTpyKSxzPW4mJm4uZWxlbWVudHM/bi5lbGVtZW50czpbXSxjPU9iamVjdC5jcmVhdGUobnVsbCksbz0wO288cy5sZW5ndGg7KytvKXt2YXIgaD1zW29dO2lmKChpLmRpc2FibGVkfHwhaC5kaXNhYmxlZCkmJmgubmFtZSYmdC50ZXN0KGgubm9kZU5hbWUpJiYhZS50ZXN0KGgudHlwZSkpe3ZhciBwPWgubmFtZSxmPWgudmFsdWU7aWYoXCJjaGVja2JveFwiIT09aC50eXBlJiZcInJhZGlvXCIhPT1oLnR5cGV8fGguY2hlY2tlZHx8KGY9dm9pZCAwKSxpLmVtcHR5KXtpZihcImNoZWNrYm94XCIhPT1oLnR5cGV8fGguY2hlY2tlZHx8KGY9ITEpLFwicmFkaW9cIj09PWgudHlwZSYmKGNbaC5uYW1lXXx8aC5jaGVja2VkP2guY2hlY2tlZCYmKGNbaC5uYW1lXT0hMCk6Y1toLm5hbWVdPSExKSxudWxsPT1mJiZcInJhZGlvXCI9PWgudHlwZSljb250aW51ZX1lbHNlIGlmKCFmKWNvbnRpbnVlO2lmKFwic2VsZWN0LW11bHRpcGxlXCIhPT1oLnR5cGUpbD11KGwscCxmKTtlbHNle2Y9W107Zm9yKHZhciB2PWgub3B0aW9ucyxtPSExLGQ9MDtkPHYubGVuZ3RoOysrZCl7dmFyIHk9dltkXTt5LnNlbGVjdGVkJiYoeS52YWx1ZXx8aS5lbXB0eSYmIXkudmFsdWUpJiYobT0hMCxsPWkuaGFzaCYmXCJbXVwiIT09cC5zbGljZShwLmxlbmd0aC0yKT91KGwscCtcIltdXCIseS52YWx1ZSk6dShsLHAseS52YWx1ZSkpfSFtJiZpLmVtcHR5JiYobD11KGwscCxcIlwiKSl9fX1pZihpLmVtcHR5KWZvcih2YXIgcCBpbiBjKWNbcF18fChsPXUobCxwLFwiXCIpKTtyZXR1cm4gbH1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgc2VyaWFsaXplIGZyb20gJ2Zvci1jZXJpYWwnO1xuXG4vKipcbiAqIEBjbGFzcyAgVGhlIE5ld3NsZXR0ZXIgbW9kdWxlXG4gKi9cbmNsYXNzIE5ld3NsZXR0ZXIge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBlbGVtZW50ICBUaGUgTmV3c2xldHRlciBET00gT2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gICAgICAgICAgICBUaGUgaW5zdGFudGlhdGVkIE5ld3NsZXR0ZXIgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdGhpcy5fZWwgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5rZXlzID0gTmV3c2xldHRlci5rZXlzO1xuXG4gICAgdGhpcy5lbmRwb2ludHMgPSBOZXdzbGV0dGVyLmVuZHBvaW50cztcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gTmV3c2xldHRlci5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLnNlbGVjdG9yID0gTmV3c2xldHRlci5zZWxlY3RvcjtcblxuICAgIHRoaXMuc3RyaW5nS2V5cyA9IE5ld3NsZXR0ZXIuc3RyaW5nS2V5cztcblxuICAgIHRoaXMuc3RyaW5ncyA9IE5ld3NsZXR0ZXIuc3RyaW5ncztcblxuICAgIHRoaXMudGVtcGxhdGVzID0gTmV3c2xldHRlci50ZW1wbGF0ZXM7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBOZXdzbGV0dGVyLmNsYXNzZXM7XG5cbiAgICB0aGlzLmNhbGxiYWNrID0gW1xuICAgICAgTmV3c2xldHRlci5jYWxsYmFjayxcbiAgICAgIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5yZXBsYWNlKCcwLicsICcnKVxuICAgIF0uam9pbignJyk7XG5cbiAgICAvLyBUaGlzIHNldHMgdGhlIHNjcmlwdCBjYWxsYmFjayBmdW5jdGlvbiB0byBhIGdsb2JhbCBmdW5jdGlvbiB0aGF0XG4gICAgLy8gY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSB0aGUgcmVxdWVzdGVkIHNjcmlwdC5cbiAgICB3aW5kb3dbdGhpcy5jYWxsYmFja10gPSAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5fY2FsbGJhY2soZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMuZm9ybSA9IG5ldyBGb3Jtcyh0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKCdmb3JtJykpO1xuXG4gICAgdGhpcy5mb3JtLnN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG5cbiAgICB0aGlzLmZvcm0uc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB0aGlzLl9zdWJtaXQoZXZlbnQpXG4gICAgICAgIC50aGVuKHRoaXMuX29ubG9hZClcbiAgICAgICAgLmNhdGNoKHRoaXMuX29uZXJyb3IpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvcm0ud2F0Y2goKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIHN1Ym1pc3Npb24gbWV0aG9kLiBSZXF1ZXN0cyBhIHNjcmlwdCB3aXRoIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogdG8gYmUgZXhlY3V0ZWQgb24gb3VyIHBhZ2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICogcmVzcG9uc2UgYXMgYSBKU09OIG9iamVjdCAoZnVuY3Rpb24gcGFyYW1ldGVyKS5cbiAgICpcbiAgICogQHBhcmFtICAge0V2ZW50fSAgICBldmVudCAgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7UHJvbWlzZX0gICAgICAgICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmV3IHNjcmlwdCBjYWxsXG4gICAqL1xuICBfc3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFNlcmlhbGl6ZSB0aGUgZGF0YVxuICAgIHRoaXMuX2RhdGEgPSBzZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7aGFzaDogdHJ1ZX0pO1xuXG4gICAgLy8gU3dpdGNoIHRoZSBhY3Rpb24gdG8gcG9zdC1qc29uLiBUaGlzIGNyZWF0ZXMgYW4gZW5kcG9pbnQgZm9yIG1haWxjaGltcFxuICAgIC8vIHRoYXQgYWN0cyBhcyBhIHNjcmlwdCB0aGF0IGNhbiBiZSBsb2FkZWQgb250byBvdXIgcGFnZS5cbiAgICBsZXQgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmFjdGlvbi5yZXBsYWNlKFxuICAgICAgYCR7dGhpcy5lbmRwb2ludHMuTUFJTn0/YCwgYCR7dGhpcy5lbmRwb2ludHMuTUFJTl9KU09OfT9gXG4gICAgKTtcblxuICAgIC8vIEFkZCBvdXIgcGFyYW1zIHRvIHRoZSBhY3Rpb25cbiAgICBhY3Rpb24gPSBhY3Rpb24gKyBzZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7c2VyaWFsaXplcjogKC4uLnBhcmFtcykgPT4ge1xuICAgICAgbGV0IHByZXYgPSAodHlwZW9mIHBhcmFtc1swXSA9PT0gJ3N0cmluZycpID8gcGFyYW1zWzBdIDogJyc7XG5cbiAgICAgIHJldHVybiBgJHtwcmV2fSYke3BhcmFtc1sxXX09JHtwYXJhbXNbMl19YDtcbiAgICB9fSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNhbGxiYWNrIHJlZmVyZW5jZS4gTWFpbGNoaW1wIHdpbGwgd3JhcCB0aGUgSlNPTiByZXNwb25zZSBpblxuICAgIC8vIG91ciBjYWxsYmFjayBtZXRob2QuIE9uY2Ugd2UgbG9hZCB0aGUgc2NyaXB0IHRoZSBjYWxsYmFjayB3aWxsIGV4ZWN1dGUuXG4gICAgYWN0aW9uID0gYCR7YWN0aW9ufSZjPXdpbmRvdy4ke3RoaXMuY2FsbGJhY2t9YDtcblxuICAgIC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCBhcHBlbmRzIHRoZSBzY3JpcHQgcmVzcG9uc2Ugb2YgdGhlIHBvc3QtanNvbiBtZXRob2RcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgIHNjcmlwdC5vbmxvYWQgPSByZXNvbHZlO1xuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgICAgc2NyaXB0LnNyYyA9IGVuY29kZVVSSShhY3Rpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzY3JpcHQgb25sb2FkIHJlc29sdXRpb25cbiAgICpcbiAgICogQHBhcmFtICAge0V2ZW50fSAgZXZlbnQgIFRoZSBzY3JpcHQgb24gbG9hZCBldmVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmxvYWQoZXZlbnQpIHtcbiAgICBldmVudC5wYXRoWzBdLnJlbW92ZSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbiBlcnJvciByZXNvbHV0aW9uXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBlcnJvciAgVGhlIHNjcmlwdCBvbiBlcnJvciBsb2FkIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gICAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9vbmVycm9yKGVycm9yKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS5kaXIoZXJyb3IpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgTWFpbENoaW1wIFNjcmlwdCBjYWxsXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBkYXRhICBUaGUgc3VjY2Vzcy9lcnJvciBtZXNzYWdlIGZyb20gTWFpbENoaW1wXG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gICAgICAgIFRoZSBOZXdzbGV0dGVyIGNsYXNzXG4gICAqL1xuICBfY2FsbGJhY2soZGF0YSkge1xuICAgIGlmICh0aGlzW2BfJHtkYXRhW3RoaXMuX2tleSgnTUNfUkVTVUxUJyldfWBdKSB7XG4gICAgICB0aGlzW2BfJHtkYXRhW3RoaXMuX2tleSgnTUNfUkVTVUxUJyldfWBdKGRhdGEubXNnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXNzaW9uIGVycm9yIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICAge3N0cmluZ30gIG1zZyAgVGhlIGVycm9yIG1lc3NhZ2VcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9lcnJvcihtc2cpIHtcbiAgICB0aGlzLl9lbGVtZW50c1Jlc2V0KCk7XG4gICAgdGhpcy5fbWVzc2FnaW5nKCdXQVJOSU5HJywgbXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gc3VjY2VzcyBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBtc2cgIFRoZSBzdWNjZXNzIG1lc3NhZ2VcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9zdWNjZXNzKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1NVQ0NFU1MnLCBtc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUHJlc2VudCB0aGUgcmVzcG9uc2UgbWVzc2FnZSB0byB0aGUgdXNlclxuICAgKlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgdHlwZSAgVGhlIG1lc3NhZ2UgdHlwZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgbXNnICAgVGhlIG1lc3NhZ2VcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9tZXNzYWdpbmcodHlwZSwgbXNnID0gJ25vIG1lc3NhZ2UnKSB7XG4gICAgbGV0IHN0cmluZ3MgPSBPYmplY3Qua2V5cyh0aGlzLnN0cmluZ0tleXMpO1xuICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICBsZXQgYWxlcnRCb3ggPSB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzW3R5cGVdKTtcblxuICAgIGxldCBhbGVydEJveE1zZyA9IGFsZXJ0Qm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICB0aGlzLnNlbGVjdG9ycy5BTEVSVF9URVhUXG4gICAgKTtcblxuICAgIC8vIEdldCB0aGUgbG9jYWxpemVkIHN0cmluZywgdGhlc2Ugc2hvdWxkIGJlIHdyaXR0ZW4gdG8gdGhlIERPTSBhbHJlYWR5LlxuICAgIC8vIFRoZSB1dGlsaXR5IGNvbnRhaW5zIGEgZ2xvYmFsIG1ldGhvZCBmb3IgcmV0cmlldmluZyB0aGVtLlxuICAgIGxldCBzdHJpbmdLZXlzID0gc3RyaW5ncy5maWx0ZXIocyA9PiBtc2cuaW5jbHVkZXModGhpcy5zdHJpbmdLZXlzW3NdKSk7XG4gICAgbXNnID0gKHN0cmluZ0tleXMubGVuZ3RoKSA/IHRoaXMuc3RyaW5nc1tzdHJpbmdLZXlzWzBdXSA6IG1zZztcbiAgICBoYW5kbGVkID0gKHN0cmluZ0tleXMubGVuZ3RoKSA/IHRydWUgOiBmYWxzZTtcblxuICAgIC8vIFJlcGxhY2Ugc3RyaW5nIHRlbXBsYXRlcyB3aXRoIHZhbHVlcyBmcm9tIGVpdGhlciBvdXIgZm9ybSBkYXRhIG9yXG4gICAgLy8gdGhlIE5ld3NsZXR0ZXIgc3RyaW5ncyBvYmplY3QuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLnRlbXBsYXRlcy5sZW5ndGg7IHgrKykge1xuICAgICAgbGV0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZXNbeF07XG4gICAgICBsZXQga2V5ID0gdGVtcGxhdGUucmVwbGFjZSgne3sgJywgJycpLnJlcGxhY2UoJyB9fScsICcnKTtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX2RhdGFba2V5XSB8fCB0aGlzLnN0cmluZ3Nba2V5XTtcbiAgICAgIGxldCByZWcgPSBuZXcgUmVnRXhwKHRlbXBsYXRlLCAnZ2knKTtcblxuICAgICAgbXNnID0gbXNnLnJlcGxhY2UocmVnLCAodmFsdWUpID8gdmFsdWUgOiAnJyk7XG4gICAgfVxuXG4gICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IG1zZztcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdFUlJPUicpIHtcbiAgICAgIGFsZXJ0Qm94TXNnLmlubmVySFRNTCA9IHRoaXMuc3RyaW5ncy5FUlJfUExFQVNFX1RSWV9MQVRFUjtcbiAgICB9XG5cbiAgICBpZiAoYWxlcnRCb3gpIHRoaXMuX2VsZW1lbnRTaG93KGFsZXJ0Qm94LCBhbGVydEJveE1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRzUmVzZXQoKSB7XG4gICAgbGV0IHRhcmdldHMgPSB0aGlzLl9lbC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLkFMRVJUUyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspXG4gICAgICBpZiAoIXRhcmdldHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuY2xhc3Nlcy5ISURERU4pKSB7XG4gICAgICAgIHRhcmdldHNbaV0uY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuSElEREVOKTtcblxuICAgICAgICB0aGlzLmNsYXNzZXMuQU5JTUFURS5zcGxpdCgnICcpLmZvckVhY2goKGl0ZW0pID0+XG4gICAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGl0ZW0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICAgICAgdGFyZ2V0c1tpXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGFyZ2V0c1tpXS5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLkFMRVJUX1RFWFQpXG4gICAgICAgICAgLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ29mZicpO1xuICAgICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kXG4gICAqXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICB0YXJnZXQgICBNZXNzYWdlIGNvbnRhaW5lclxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgY29udGVudCAgQ29udGVudCB0aGF0IGNoYW5nZXMgZHluYW1pY2FsbHkgdGhhdCBzaG91bGRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGFubm91bmNlZCB0byBzY3JlZW4gcmVhZGVycy5cbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgICAgIE5ld3NsZXR0ZXJcbiAgICovXG4gIF9lbGVtZW50U2hvdyh0YXJnZXQsIGNvbnRlbnQpIHtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmNsYXNzZXMuSElEREVOKTtcblxuICAgIHRoaXMuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKGl0ZW0pXG4gICAgKTtcblxuICAgIC8vIFNjcmVlbiBSZWFkZXJzXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgcHJvcGVyIGtleVxuICAgKlxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAga2V5ICBUaGUgcmVmZXJlbmNlIGZvciB0aGUgc3RvcmVkIGtleXMuXG4gICAqXG4gICAqIEByZXR1cm4gIHtzdHJpbmd9ICAgICAgIFRoZSBkZXNpcmVkIGtleS5cbiAgICovXG4gIF9rZXkoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMua2V5c1trZXldO1xuICB9XG59XG5cbi8qKiBAdHlwZSAge09iamVjdH0gIEFQSSBkYXRhIGtleXMgKi9cbk5ld3NsZXR0ZXIua2V5cyA9IHtcbiAgTUNfUkVTVUxUOiAncmVzdWx0JyxcbiAgTUNfTVNHOiAnbXNnJ1xufTtcblxuLyoqIEB0eXBlICB7T2JqZWN0fSAgQVBJIGVuZHBvaW50cyAqL1xuTmV3c2xldHRlci5lbmRwb2ludHMgPSB7XG4gIE1BSU46ICcvcG9zdCcsXG4gIE1BSU5fSlNPTjogJy9wb3N0LWpzb24nXG59O1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgTWFpbGNoaW1wIGNhbGxiYWNrIHJlZmVyZW5jZS4gKi9cbk5ld3NsZXR0ZXIuY2FsbGJhY2sgPSAnTmV3c2xldHRlckNhbGxiYWNrJztcblxuLyoqIEB0eXBlICB7T2JqZWN0fSAgRE9NIHNlbGVjdG9ycyBmb3IgdGhlIGluc3RhbmNlJ3MgY29uY2VybnMgKi9cbk5ld3NsZXR0ZXIuc2VsZWN0b3JzID0ge1xuICBFTEVNRU5UOiAnW2RhdGEtanM9XCJuZXdzbGV0dGVyXCJdJyxcbiAgQUxFUlRTOiAnW2RhdGEtanMqPVwiYWxlcnRcIl0nLFxuICBXQVJOSU5HOiAnW2RhdGEtanM9XCJhbGVydC13YXJuaW5nXCJdJyxcbiAgU1VDQ0VTUzogJ1tkYXRhLWpzPVwiYWxlcnQtc3VjY2Vzc1wiXScsXG4gIEFMRVJUX1RFWFQ6ICdbZGF0YS1qcy1hbGVydD1cInRleHRcIl0nXG59O1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgbWFpbiBET00gc2VsZWN0b3IgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zZWxlY3RvciA9IE5ld3NsZXR0ZXIuc2VsZWN0b3JzLkVMRU1FTlQ7XG5cbi8qKiBAdHlwZSAge09iamVjdH0gIFN0cmluZyByZWZlcmVuY2VzIGZvciB0aGUgaW5zdGFuY2UgKi9cbk5ld3NsZXR0ZXIuc3RyaW5nS2V5cyA9IHtcbiAgU1VDQ0VTU19DT05GSVJNX0VNQUlMOiAnQWxtb3N0IGZpbmlzaGVkLi4uJyxcbiAgRVJSX1BMRUFTRV9FTlRFUl9WQUxVRTogJ1BsZWFzZSBlbnRlciBhIHZhbHVlJyxcbiAgRVJSX1RPT19NQU5ZX1JFQ0VOVDogJ3RvbyBtYW55JyxcbiAgRVJSX0FMUkVBRFlfU1VCU0NSSUJFRDogJ2lzIGFscmVhZHkgc3Vic2NyaWJlZCcsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnbG9va3MgZmFrZSBvciBpbnZhbGlkJ1xufTtcblxuLyoqIEB0eXBlICB7T2JqZWN0fSAgQXZhaWxhYmxlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIuc3RyaW5ncyA9IHtcbiAgVkFMSURfUkVRVUlSRUQ6ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkLicsXG4gIFZBTElEX0VNQUlMX1JFUVVJUkVEOiAnRW1haWwgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfSU5WQUxJRDogJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLicsXG4gIFZBTElEX0NIRUNLQk9YX0JPUk9VR0g6ICdQbGVhc2Ugc2VsZWN0IGEgYm9yb3VnaC4nLFxuICBFUlJfUExFQVNFX1RSWV9MQVRFUjogJ1RoZXJlIHdhcyBhbiBlcnJvciB3aXRoIHlvdXIgc3VibWlzc2lvbi4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nLFxuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4gV2UgbmVlZCB0byBjb25maXJtIHlvdXIgZW1haWwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZHJlc3MuIFRvIGNvbXBsZXRlIHRoZSBzdWJzY3JpcHRpb24gcHJvY2VzcywgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3BsZWFzZSBjbGljayB0aGUgbGluayBpbiB0aGUgZW1haWwgd2UganVzdCBzZW50IHlvdS4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAnUmVjaXBpZW50IFwie3sgRU1BSUwgfX1cIiBoYXMgdG9vICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAnbWFueSByZWNlbnQgc2lnbnVwIHJlcXVlc3RzJyxcbiAgRVJSX0FMUkVBRFlfU1VCU0NSSUJFRDogJ3t7IEVNQUlMIH19IGlzIGFscmVhZHkgc3Vic2NyaWJlZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RvIGxpc3Qge3sgTElTVF9OQU1FIH19LicsXG4gIEVSUl9JTlZBTElEX0VNQUlMOiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGVudGVyIGEgcmVhbCBlbWFpbCBhZGRyZXNzLicsXG4gIExJU1RfTkFNRTogJ05ld3NsZXR0ZXInXG59O1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIFBsYWNlaG9sZGVycyB0aGF0IHdpbGwgYmUgcmVwbGFjZWQgaW4gbWVzc2FnZSBzdHJpbmdzICovXG5OZXdzbGV0dGVyLnRlbXBsYXRlcyA9IFtcbiAgJ3t7IEVNQUlMIH19JyxcbiAgJ3t7IExJU1RfTkFNRSB9fSdcbl07XG5cbk5ld3NsZXR0ZXIuY2xhc3NlcyA9IHtcbiAgQU5JTUFURTogJ2FuaW1hdGVkIGZhZGVJblVwJyxcbiAgSElEREVOOiAnaGlkZGVuJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTmV3c2xldHRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDeWNsZXMgdGhyb3VnaCBhIHByZWRlZmluZWQgb2JqZWN0IG9mIHRoZW1lIGNsYXNzbmFtZXMgYW5kIHRvZ2dsZXMgdGhlbSBvblxuICogdGhlIGRvY3VtZW50IGVsZW1lbnQgYmFzZWQgb24gYSBjbGljayBldmVudC4gVXNlcyBsb2NhbCBzdG9yYWdlIHRvIHNhdmUgYW5kXG4gKiByZWZlciB0byBhIHVzZXIncyBwcmVmZXJlbmNlIGJhc2VkIG9uIHRoZSBsYXN0IHRoZW1lIHNlbGVjdGVkLlxuICovXG5jbGFzcyBUaGVtZXMge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBzICBUaGUgc2V0dGluZ3Mgb2JqZWN0LCBtYXkgaW5jbHVkZSAnc3RvcmFnZScsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAnc2VsZWN0b3JzJywgb3IgJ3RoZW1lJyBhdHRyaWJ1dGVzXG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gICAgICBUaGUgY29uc3RydWN0ZWQgaW5zdGFuY2Ugb2YgVGhlbWVzLlxuICAgKi9cbiAgY29uc3RydWN0b3IocyA9IHt9KSB7XG4gICAgLyoqXG4gICAgICogU2V0dGluZ3NcbiAgICAgKi9cblxuICAgIHRoaXMuc3RvcmFnZSA9IChzLmhhc093blByb3BlcnR5KCdzdG9yYWdlJykpID9cbiAgICAgIE9iamVjdC5hc3NpZ24oVGhlbWVzLnN0b3JhZ2UsIHMuc3RvcmFnZSkgOiBUaGVtZXMuc3RvcmFnZTtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gKHMuaGFzT3duUHJvcGVydHkoJ3NlbGVjdG9ycycpKSA/XG4gICAgICBPYmplY3QuYXNzaWduKFRoZW1lcy5zZWxlY3RvcnMsIHMuc2VsZWN0b3JzKSA6IFRoZW1lcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLnRoZW1lcyA9IChzLmhhc093blByb3BlcnR5KCd0aGVtZXMnKSkgPyBzLnRoZW1lcyA6IFRoZW1lcy50aGVtZXM7XG5cbiAgICB0aGlzLmFmdGVyID0gKHMuaGFzT3duUHJvcGVydHkoJ2FmdGVyJykpID8gcy5hZnRlciA6IFRoZW1lcy5hZnRlcjtcblxuICAgIHRoaXMuYmVmb3JlID0gKHMuaGFzT3duUHJvcGVydHkoJ2JlZm9yZScpKSA/IHMuYmVmb3JlIDogVGhlbWVzLmJlZm9yZTtcblxuICAgIC8qKlxuICAgICAqIEdldCBpbml0aWFsIHVzZXIgcHJlZmVyZW5jZVxuICAgICAqL1xuXG4gICAgdGhpcy5wcmVmZXJlbmNlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5zdG9yYWdlLlRIRU1FKTtcblxuICAgIGlmICh0aGlzLnByZWZlcmVuY2UpXG4gICAgICB0aGlzLnNldChKU09OLnBhcnNlKHRoaXMucHJlZmVyZW5jZSkpO1xuXG4gICAgLyoqXG4gICAgICogQWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqL1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNlbGVjdG9ycy5UT0dHTEUpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMudGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICB0aGlzLmJlZm9yZSh0aGlzKTtcblxuICAgICAgdGhpcy5jbGljayhldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2xpY2sgaGFuZGxlciBmb3IgdGhlbWUgY3ljbGluZy5cbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGV2ZW50ICBUaGUgb3JpZ2luYWwgY2xpY2sgZXZlbnQgdGhhdCBpbnZva2VkIHRoZSBtZXRob2RcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgICBUaGUgVGhlbWVzIGluc3RhbmNlXG4gICAqL1xuICBjbGljayhldmVudCkge1xuICAgIC8vIEdldCBhdmFpbGFibGUgdGhlbWUgY2xhc3NuYW1lc1xuICAgIGxldCBjeWNsZSA9IHRoaXMudGhlbWVzLm1hcCh0ID0+IHQuY2xhc3NuYW1lKTtcblxuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZG9jdW1lbnQgaGFzIGFueSBvZiB0aGUgdGhlbWUgY2xhc3Mgc2V0dGluZ3MgYWxyZWFkeVxuICAgIGxldCBpbnRlcnNlY3Rpb24gPSBjeWNsZS5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICByZXR1cm4gWy4uLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3RdLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSk7XG5cbiAgICAvLyBGaW5kIHRoZSBzdGFydGluZyBpbmRleFxuICAgIGxldCBzdGFydCA9IChpbnRlcnNlY3Rpb24ubGVuZ3RoID09PSAwKSA/IDAgOiBjeWNsZS5pbmRleE9mKGludGVyc2VjdGlvblswXSk7XG4gICAgbGV0IHRoZW1lID0gKHR5cGVvZiBjeWNsZVtzdGFydCArIDFdID09PSAndW5kZWZpbmVkJykgPyBjeWNsZVswXSA6IGN5Y2xlW3N0YXJ0ICsgMV07XG5cbiAgICAvLyBUb2dnbGUgZWxlbWVudHNcbiAgICB0aGlzLnJlbW92ZSh0aGlzLnRoZW1lcy5maW5kKHQgPT4gdC5jbGFzc25hbWUgPT09IGN5Y2xlW3N0YXJ0XSkpXG4gICAgICAuc2V0KHRoaXMudGhlbWVzLmZpbmQodCA9PiB0LmNsYXNzbmFtZSA9PT0gdGhlbWUpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByZW1vdmUgbWV0aG9kIGZvciB0aGUgdGhlbWUuIFJlc2V0cyBhbGwgZWxlbWVudCBjbGFzc2VzIGFuZCBsb2NhbCBzdG9yYWdlLlxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgdGhlbWUgIFRoZSB0aGVtZSB0byByZW1vdmVcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgICBUaGUgVGhlbWVzIGluc3RhbmNlXG4gICAqL1xuICByZW1vdmUodGhlbWUpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh0aGVtZS5jbGFzc25hbWUpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5UT0dHTEUpXG4gICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGAke3RoZW1lLmNsYXNzbmFtZX0ke3RoaXMuc2VsZWN0b3JzLkFDVElWRX1gKTtcbiAgICAgIH0pO1xuXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5zdG9yYWdlLlRIRU1FKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZXR0ZXIgbWV0aG9kIGZvciB0aGVtZS4gQWRkcyBlbGVtZW50IGNsYXNzZXMgYW5kIHNldHMgbG9jYWwgc3RvcmFnZS5cbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIHRoZW1lICBUaGUgdGhlbWUgb2JqZWN0IGluY2x1ZGluZyBjbGFzc25hbWUgYW5kIGxhYmVsXG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gICAgICAgICAgVGhlIFRoZW1lcyBpbnN0YW5jZVxuICAgKi9cbiAgc2V0KHRoZW1lKSB7XG4gICAgdGhpcy50aGVtZSA9IHRoZW1lO1xuXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy50aGVtZS5jbGFzc25hbWUpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5UT0dHTEUpXG4gICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGAke3RoaXMudGhlbWUuY2xhc3NuYW1lfSR7dGhpcy5zZWxlY3RvcnMuQUNUSVZFfWApO1xuICAgICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLkxBQkVMKVxuICAgICAgLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLnRoZW1lLmxhYmVsO1xuICAgICAgfSk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2UuVEhFTUUsIEpTT04uc3RyaW5naWZ5KHRoZW1lKSk7XG5cbiAgICB0aGlzLmFmdGVyKHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbi8qKlxuICogVGhlIHN0b3JhZ2Uga2V5cyB1c2VkIGJ5IHRoZSBzY3JpcHQgZm9yIGxvY2FsIHN0b3JhZ2UuIFRoZSBkZWZhdWx0IGlzXG4gKiBgLS1ueWNvLXRoZW1lYCBmb3IgdGhlIHRoZW1lIHByZWZlcmVuY2UuXG4gKlxuICogQHZhciB7T2JqZWN0fVxuICovXG5UaGVtZXMuc3RvcmFnZSA9IHtcbiAgVEhFTUU6ICctLW55Y28tdGhlbWUnXG59O1xuXG4vKipcbiAqIFRoZSBzZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgcXVlcmllZCBieSB0aGUgdXRpbGl0eS4gUmVmZXIgdG8gdGhlXG4gKiBzb3VyY2UgZm9yIGRlZmF1bHRzLlxuICpcbiAqIEB2YXIge09iamVjdH1cbiAqL1xuVGhlbWVzLnNlbGVjdG9ycyA9IHtcbiAgVE9HR0xFOiAnW2RhdGEtanM9XCJ0aGVtZXNcIl0nLFxuICBMQUJFTDogJ1tkYXRhLWpzLXRoZW1lcz1cImxhYmVsXCJdJyxcbiAgQUNUSVZFOiAnOmFjdGl2ZSdcbn07XG5cbi8qKlxuICogVGhlIHByZWRlZmluZWQgdGhlbWUgT2JqZWN0cyB0byBjeWNsZSB0aHJvdWdoLCBlYWNoIHdpdGggYSBjb3JyZXNwb25kaW5nXG4gKiBodW1hbi1yZWFkYWJsZSB0ZXh0IGxhYmVsIGFuZCBjbGFzc25hbWUuIFRoZSBkZWZhdWx0IGluY2x1ZGVzIHR3byB0aGVtZXM7XG4gKiBgZGVmYXVsdGAgbGFiZWxsZWQgXCJMaWdodFwiIHRoZW1lIGFuZCBgZGFya2AgbGFiZWxsZWQgXCJEYXJrXCIuXG4gKlxuICogQHZhciB7QXJyYXl9XG4gKi9cblRoZW1lcy50aGVtZXMgPSBbXG4gIHtcbiAgICBsYWJlbDogJ0xpZ2h0JyxcbiAgICBjbGFzc25hbWU6ICdkZWZhdWx0J1xuICB9LFxuICB7XG4gICAgbGFiZWw6ICdEYXJrJyxcbiAgICBjbGFzc25hbWU6ICdkYXJrJ1xuICB9XG5dO1xuXG4vKipcbiAqIEJlZm9yZSBob29rXG4gKlxuICogQHJldHVybiAge0Z1bmN0aW9ufSAgVHJpZ2dlcnMgYmVmb3JlIHRoZSBjbGljayBldmVudC5cbiAqL1xuVGhlbWVzLmJlZm9yZSA9ICgpID0+IHt9O1xuXG4vKipcbiAqIEFmdGVyIGhvb2tcbiAqXG4gKiBAcmV0dXJuICB7RnVuY3Rpb259ICBUcmlnZ2VycyBhZnRlciB0aGUgY2xpY2sgZXZlbnQuXG4gKi9cblRoZW1lcy5hZnRlciA9ICgpID0+IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBUaGVtZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVHJhY2tpbmcgYnVzIGZvciBHb29nbGUgYW5hbHl0aWNzIGFuZCBXZWJ0cmVuZHMuXG4gKi9cbmNsYXNzIFRyYWNrIHtcbiAgY29uc3RydWN0b3Iocykge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUcmFjay5zZWxlY3RvcixcbiAgICB9O1xuXG4gICAgdGhpcy5kZXNpbmF0aW9ucyA9IFRyYWNrLmRlc3RpbmF0aW9ucztcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGxldCBrZXkgPSBldmVudC50YXJnZXQuZGF0YXNldC50cmFja0tleTtcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShldmVudC50YXJnZXQuZGF0YXNldC50cmFja0RhdGEpO1xuXG4gICAgICB0aGlzLnRyYWNrKGtleSwgZGF0YSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFja2luZyBmdW5jdGlvbiB3cmFwcGVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgVGhlIGZpbmFsIGRhdGEgb2JqZWN0XG4gICAqL1xuICB0cmFjayhrZXksIGRhdGEpIHtcbiAgICAvLyBTZXQgdGhlIHBhdGggbmFtZSBiYXNlZCBvbiB0aGUgbG9jYXRpb25cbiAgICBjb25zdCBkID0gZGF0YS5tYXAoZWwgPT4ge1xuICAgICAgICBpZiAoZWwuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSlcbiAgICAgICAgICBlbFtUcmFjay5rZXldID0gYCR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfS8ke2VsW1RyYWNrLmtleV19YFxuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9KTtcblxuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZCk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnKGtleSwgZCk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cblxuICAgIHJldHVybiBkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEYXRhIGJ1cyBmb3IgdHJhY2tpbmcgdmlld3MgaW4gV2VidHJlbmRzIGFuZCBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBhcHAgICBUaGUgbmFtZSBvZiB0aGUgU2luZ2xlIFBhZ2UgQXBwbGljYXRpb24gdG8gdHJhY2tcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICB2aWV3KGFwcCwga2V5LCBkYXRhKSB7XG4gICAgbGV0IHd0ID0gdGhpcy53ZWJ0cmVuZHMoa2V5LCBkYXRhKTtcbiAgICBsZXQgZ2EgPSB0aGlzLmd0YWdWaWV3KGFwcCwga2V5KTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHsnVHJhY2snOiBbd3QsIGdhXX0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIEV2ZW50cyB0byBXZWJ0cmVuZHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICB3ZWJ0cmVuZHMoa2V5LCBkYXRhKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIFdlYnRyZW5kcyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ3dlYnRyZW5kcycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGV2ZW50ID0gW3tcbiAgICAgICdXVC50aSc6IGtleVxuICAgIH1dO1xuXG4gICAgaWYgKGRhdGFbMF0gJiYgZGF0YVswXS5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKVxuICAgICAgZXZlbnQucHVzaCh7XG4gICAgICAgICdEQ1MuZGNzdXJpJzogZGF0YVswXVtUcmFjay5rZXldXG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICBPYmplY3QuYXNzaWduKGV2ZW50LCBkYXRhKTtcblxuICAgIC8vIEZvcm1hdCBkYXRhIGZvciBXZWJ0cmVuZHNcbiAgICBsZXQgd3RkID0ge2FyZ3NhOiBldmVudC5mbGF0TWFwKGUgPT4ge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGUpLmZsYXRNYXAoayA9PiBbaywgZVtrXV0pO1xuICAgIH0pfTtcblxuICAgIC8vIElmICdhY3Rpb24nIGlzIHVzZWQgYXMgdGhlIGtleSAoZm9yIGd0YWcuanMpLCBzd2l0Y2ggaXQgdG8gV2VidHJlbmRzXG4gICAgbGV0IGFjdGlvbiA9IGRhdGEuYXJnc2EuaW5kZXhPZignYWN0aW9uJyk7XG5cbiAgICBpZiAoYWN0aW9uKSBkYXRhLmFyZ3NhW2FjdGlvbl0gPSAnRENTLmRjc3VyaSc7XG5cbiAgICAvLyBXZWJ0cmVuZHMgZG9lc24ndCBzZW5kIHRoZSBwYWdlIHZpZXcgZm9yIE11bHRpVHJhY2ssIGFkZCBwYXRoIHRvIHVybFxuICAgIGxldCBkY3N1cmkgPSBkYXRhLmFyZ3NhLmluZGV4T2YoJ0RDUy5kY3N1cmknKTtcblxuICAgIGlmIChkY3N1cmkpXG4gICAgICBkYXRhLmFyZ3NhW2Rjc3VyaSArIDFdID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgaWYgKHR5cGVvZiBXZWJ0cmVuZHMgIT09ICd1bmRlZmluZWQnKVxuICAgICAgV2VidHJlbmRzLm11bHRpVHJhY2sod3RkKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnV2VidHJlbmRzJywgd3RkXTtcbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBDbGljayBFdmVudHMgdG8gR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIGd0YWcoa2V5LCBkYXRhKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGd0YWcgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCdndGFnJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgdXJpID0gZGF0YS5maW5kKChlbGVtZW50KSA9PiBlbGVtZW50Lmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpO1xuXG4gICAgbGV0IGV2ZW50ID0ge1xuICAgICAgJ2V2ZW50X2NhdGVnb3J5Jzoga2V5XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZ3RhZyhUcmFjay5rZXksIHVyaVtUcmFjay5rZXldLCBldmVudCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnZ3RhZycsIFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50XTtcbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBTY3JlZW4gVmlldyBFdmVudHMgdG8gR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBhcHAgIFRoZSBuYW1lIG9mIHRoZSBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBrZXkgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICovXG4gIGd0YWdWaWV3KGFwcCwga2V5KSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGd0YWcgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCdndGFnJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgdmlldyA9IHtcbiAgICAgIGFwcF9uYW1lOiBhcHAsXG4gICAgICBzY3JlZW5fbmFtZToga2V5XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZ3RhZygnZXZlbnQnLCAnc2NyZWVuX3ZpZXcnLCB2aWV3KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCAnc2NyZWVuX3ZpZXcnLCB2aWV3XTtcbiAgfTtcbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdHJhY2tpbmcgZnVuY3Rpb24gdG8gKi9cblRyYWNrLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRyYWNrXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIGV2ZW50IHRyYWNraW5nIGtleSB0byBtYXAgdG8gV2VidHJlbmRzIERDUy51cmkgKi9cblRyYWNrLmtleSA9ICdldmVudCc7XG5cbi8qKiBAdHlwZSB7QXJyYXl9IFdoYXQgZGVzdGluYXRpb25zIHRvIHB1c2ggZGF0YSB0byAqL1xuVHJhY2suZGVzdGluYXRpb25zID0gW1xuICAnd2VidHJlbmRzJyxcbiAgJ2d0YWcnXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFjazsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgbmF2aWdhdG9yLnNoYXJlKCkgQVBJXG4gKi9cbmNsYXNzIFdlYlNoYXJlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IocyA9IHt9KSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBXZWJTaGFyZS5zZWxlY3RvcjtcblxuICAgIHRoaXMuY2FsbGJhY2sgPSAocy5jYWxsYmFjaykgPyBzLmNhbGxiYWNrIDogV2ViU2hhcmUuY2FsbGJhY2s7XG5cbiAgICB0aGlzLmZhbGxiYWNrID0gKHMuZmFsbGJhY2spID8gcy5mYWxsYmFjayA6IFdlYlNoYXJlLmZhbGxiYWNrO1xuXG4gICAgaWYgKG5hdmlnYXRvci5zaGFyZSkge1xuICAgICAgLy8gUmVtb3ZlIGZhbGxiYWNrIGFyaWEgdG9nZ2xpbmcgYXR0cmlidXRlc1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBpdGVtLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpO1xuICAgICAgICBpdGVtLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lciBmb3IgdGhlIHNoYXJlIGNsaWNrXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZWxlY3RvcikpXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgICB0aGlzLmRhdGEgPSBKU09OLnBhcnNlKHRoaXMuZWxlbWVudC5kYXRhc2V0LndlYlNoYXJlKTtcblxuICAgICAgICB0aGlzLnNoYXJlKHRoaXMuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2VcbiAgICAgIHRoaXMuZmFsbGJhY2soKTsgLy8gRXhlY3V0ZSB0aGUgZmFsbGJhY2tcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlYiBTaGFyZSBBUEkgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZGF0YSAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGl0bGUsIHVybCwgYW5kIHRleHQuXG4gICAqXG4gICAqIEByZXR1cm4gIHtQcm9taXNlfSAgICAgICBUaGUgcmVzcG9uc2Ugb2YgdGhlIC5zaGFyZSgpIG1ldGhvZC5cbiAgICovXG4gIHNoYXJlKGRhdGEgPSB7fSkge1xuICAgIHJldHVybiBuYXZpZ2F0b3Iuc2hhcmUoZGF0YSlcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soZGF0YSk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICBjb25zb2xlLmRpcihlcnIpO1xuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqIFRoZSBodG1sIHNlbGVjdG9yIGZvciB0aGUgY29tcG9uZW50ICovXG5XZWJTaGFyZS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ3ZWItc2hhcmVcIl0nO1xuXG4vKiogUGxhY2Vob2xkZXIgY2FsbGJhY2sgZm9yIGEgc3VjY2Vzc2Z1bCBzZW5kICovXG5XZWJTaGFyZS5jYWxsYmFjayA9ICgpID0+IHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgY29uc29sZS5kaXIoJ1N1Y2Nlc3MhJyk7XG59O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBXZWJTaGFyZSBmYWxsYmFjayAqL1xuV2ViU2hhcmUuZmFsbGJhY2sgPSAoKSA9PiB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgIGNvbnNvbGUuZGlyKCdGYWxsYmFjayEnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViU2hhcmU7XG4iLCIvKipcbiAqIEBjbGFzcyAgU2V0IHRoZSB0aGUgY3NzIHZhcmlhYmxlICctLTEwMHZoJyB0byB0aGUgc2l6ZSBvZiB0aGUgV2luZG93J3MgaW5uZXIgaGVpZ2h0LlxuICovXG5jbGFzcyBXaW5kb3dWaCB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3IgIFNldCBldmVudCBsaXN0ZW5lcnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMgPSB7fSkge1xuICAgIHRoaXMucHJvcGVydHkgPSAocy5wcm9wZXJ0eSkgPyBzLnByb3BlcnR5IDogV2luZG93VmgucHJvcGVydHk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHt0aGlzLnNldCgpfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge3RoaXMuc2V0KCl9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNzcyB2YXJpYWJsZSBwcm9wZXJ0eVxuICAgKi9cbiAgc2V0KCkge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZVxuICAgICAgLnNldFByb3BlcnR5KHRoaXMucHJvcGVydHksIGAke3dpbmRvdy5pbm5lckhlaWdodH1weGApO1xuICB9XG59XG5cbi8qKiBAcGFyYW0gIHtTdHJpbmd9ICBwcm9wZXJ0eSAgVGhlIGNzcyB2YXJpYWJsZSBzdHJpbmcgdG8gc2V0ICovXG5XaW5kb3dWaC5wcm9wZXJ0eSA9ICctLTEwMHZoJztcblxuZXhwb3J0IGRlZmF1bHQgV2luZG93Vmg7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJhY2NvcmRpb25cIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCBJbnRlcnNlY3Rpb24gT2JzZXJ2ZXIgY2xhc3NcbiAqL1xuY2xhc3MgT2JzZXJ2ZSB7XG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSAocy5vcHRpb25zKSA/IE9iamVjdC5hc3NpZ24oT2JzZXJ2ZS5vcHRpb25zLCBzLm9wdGlvbnMpIDogT2JzZXJ2ZS5vcHRpb25zO1xuXG4gICAgdGhpcy50cmlnZ2VyID0gKHMudHJpZ2dlcikgPyBzLnRyaWdnZXIgOiBPYnNlcnZlLnRyaWdnZXI7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSB0aGUgSW50ZXJzZWN0aW9uIE9ic2VydmVyXG4gICAgdGhpcy5vYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcywgb2JzZXJ2ZXIpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2soZW50cmllcywgb2JzZXJ2ZXIpO1xuICAgIH0sIHRoaXMub3B0aW9ucyk7XG5cbiAgICAvLyBTZWxlY3QgYWxsIG9mIHRoZSBpdGVtcyB0byBvYnNlcnZlXG4gICAgdGhpcy5pdGVtcyA9IHMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1qcy1vYnNlcnZlLWl0ZW09XCIke3MuZWxlbWVudC5kYXRhc2V0LmpzT2JzZXJ2ZUl0ZW1zfVwiXWApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1tpXTtcblxuICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKGl0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbGxiYWNrKGVudHJpZXMsIG9ic2VydmVyKSB7XG4gICAgbGV0IHByZXZFbnRyeSA9IGVudHJpZXNbMF07XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gZW50cmllc1tpXTtcblxuICAgICAgdGhpcy50cmlnZ2VyKGVudHJ5LCBwcmV2RW50cnksIG9ic2VydmVyKTtcblxuICAgICAgcHJldkVudHJ5ID0gZW50cnk7XG4gICAgfVxuICB9XG59XG5cbk9ic2VydmUub3B0aW9ucyA9IHtcbiAgcm9vdDogbnVsbCxcbiAgcm9vdE1hcmdpbjogJzBweCcsXG4gIHRocmVzaG9sZDogWzAuMTVdXG59O1xuXG5PYnNlcnZlLnRyaWdnZXIgPSBlbnRyeSA9PiB7XG4gIGNvbnNvbGUuZGlyKGVudHJ5KTtcbiAgY29uc29sZS5kaXIoJ09ic2VydmVkISBDcmVhdGUgYSBlbnRyeSB0cmlnZ2VyIGZ1bmN0aW9uIGFuZCBwYXNzIGl0IHRvIHRoZSBpbnN0YW50aWF0ZWQgT2JzZXJ2ZSBzZXR0aW5ncyBvYmplY3QuJyk7XG59O1xuXG5PYnNlcnZlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cIm9ic2VydmVcIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBPYnNlcnZlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgT2JzZXJ2ZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvb2JzZXJ2ZS9vYnNlcnZlJztcblxuY2xhc3MgQWN0aXZlTmF2aWdhdGlvbiB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgcGF0dGVyblxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqXG4gICAgICogTWV0aG9kIGZvciB0b2dnbGluZyB0aGUganVtcCBuYXZpZ2F0aW9uIGl0ZW0sIHVzZWQgYnkgdGhlIGNsaWNrIGV2ZW50XG4gICAgICogaGFuZGxlciBhbmQgdGhlIGludGVyc2VjdGlvbiBvYnNlcnZlciBldmVudCBoYW5kbGVyLlxuICAgICAqXG4gICAgICogQHZhciBOb2RlRWxlbWVudFxuICAgICAqL1xuICAgICBjb25zdCBqdW1wQ2xhc3NUb2dnbGUgPSBpdGVtID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbS5wYXJlbnROb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHNpYmxpbmcgPSBpdGVtLnBhcmVudE5vZGUuY2hpbGRyZW5baV07XG5cbiAgICAgICAgaWYgKCdhY3RpdmVOYXZpZ2F0aW9uSXRlbScgaW4gc2libGluZy5kYXRhc2V0KSB7XG4gICAgICAgICAgbGV0IGNsYXNzQWN0aXZlID0gc2libGluZy5kYXRhc2V0LmFjdGl2ZU5hdmlnYXRpb25JdGVtLnNwbGl0KCcgJyk7XG4gICAgICAgICAgbGV0IGNsYXNzSW5hY3RpdmUgPSBzaWJsaW5nLmRhdGFzZXQuaW5hY3RpdmVOYXZpZ2F0aW9uSXRlbS5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgaWYgKHNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKC4uLmNsYXNzQWN0aXZlKSkge1xuICAgICAgICAgICAgc2libGluZy5jbGFzc0xpc3QucmVtb3ZlKC4uLmNsYXNzQWN0aXZlKTtcbiAgICAgICAgICAgIHNpYmxpbmcuY2xhc3NMaXN0LmFkZCguLi5jbGFzc0luYWN0aXZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKC4uLml0ZW0uZGF0YXNldC5pbmFjdGl2ZU5hdmlnYXRpb25JdGVtLnNwbGl0KCcgJykpO1xuICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKC4uLml0ZW0uZGF0YXNldC5hY3RpdmVOYXZpZ2F0aW9uSXRlbS5zcGxpdCgnICcpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xpY2sgZXZlbnQgaGFuZGxlciBmb3IganVtcCBuYXZpZ2F0aW9uIGl0ZW1zXG4gICAgICpcbiAgICAgKiBAdmFyIE5vZGVFbGVtZW50XG4gICAgICovXG4gICAgKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGFjdGl2ZU5hdmlnYXRpb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FbZGF0YS1hY3RpdmUtbmF2aWdhdGlvbi1pdGVtXScpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aXZlTmF2aWdhdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGEgPSBhY3RpdmVOYXZpZ2F0aW9uW2ldO1xuXG4gICAgICAgICAgYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBqdW1wQ2xhc3NUb2dnbGUoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1qcyo9XCJhY3RpdmUtbmF2aWdhdGlvblwiXScpKTtcblxuICAgIC8qKlxuICAgICAqIEludGVyc2VjdGlvbiBPYnNlcnZlciBldmVudCBoYW5kbGVyIGZvciBqdW1wIG5hdmlnYXRpb24gaXRlbXNcbiAgICAgKlxuICAgICAqIEB2YXIgTm9kZUVsZW1lbnRMaXN0XG4gICAgICovXG4gICAgKGVsZW1lbnRzID0+IHtcbiAgICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIG5ldyBPYnNlcnZlKHtcbiAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgIHRyaWdnZXI6IChlbnRyeSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFlbnRyeS5pc0ludGVyc2VjdGluZykgcmV0dXJuO1xuXG4gICAgICAgICAgICBsZXQganVtcEl0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBhW2hyZWY9XCIjJHtlbnRyeS50YXJnZXQuaWR9XCJdYCk7XG5cbiAgICAgICAgICAgIGlmICghanVtcEl0ZW0pIHJldHVybjtcblxuICAgICAgICAgICAganVtcEl0ZW0uY2xvc2VzdCgnW2RhdGEtanMqPVwiYWN0aXZlLW5hdmlnYXRpb24tc2Nyb2xsXCJdJykuc2Nyb2xsVG8oe1xuICAgICAgICAgICAgICBsZWZ0OiBqdW1wSXRlbS5vZmZzZXRMZWZ0LFxuICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGp1bXBDbGFzc1RvZ2dsZShqdW1wSXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoT2JzZXJ2ZS5zZWxlY3RvcikpO1xuICB9XG59XG5cbi8qKiBAdHlwZSAgU3RyaW5nICBNYWluIERPTSBzZWxlY3RvciAqL1xuQWN0aXZlTmF2aWdhdGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XFxcImFjdGl2ZS1uYXZpZ2F0aW9uXFxcIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBBY3RpdmVOYXZpZ2F0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgTW9iaWxlIE5hdiBtb2R1bGVcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgTWVudSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHJldHVybiAge29iamVjdH0gIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IE1lbnUuc2VsZWN0b3I7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IE1lbnUuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy50b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiB0aGlzLnNlbGVjdG9yLFxuICAgICAgYWZ0ZXI6IHRvZ2dsZSA9PiB7XG4gICAgICAgIC8vIFNoaWZ0IGZvY3VzIGZyb20gdGhlIG9wZW4gdG8gdGhlIGNsb3NlIGJ1dHRvbiBpbiB0aGUgTW9iaWxlIE1lbnUgd2hlbiB0b2dnbGVkXG4gICAgICAgIGlmICh0b2dnbGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhUb2dnbGUuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgdG9nZ2xlLnRhcmdldC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLkNMT1NFKS5mb2N1cygpO1xuXG4gICAgICAgICAgLy8gV2hlbiB0aGUgbGFzdCBmb2N1c2FibGUgaXRlbSBpbiB0aGUgbGlzdCBsb29zZXMgZm9jdXMgbG9vcCB0byB0aGUgZmlyc3RcbiAgICAgICAgICB0b2dnbGUuZm9jdXNhYmxlLml0ZW0odG9nZ2xlLmZvY3VzYWJsZS5sZW5ndGggLSAxKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRvZ2dsZS5mb2N1c2FibGUuaXRlbSgwKS5mb2N1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5PUEVOKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlICovXG5NZW51LnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cIm1lbnVcIl0nO1xuXG4vKiogQHR5cGUgIHtPYmplY3R9ICBBZGRpdGlvbmFsIHNlbGVjdG9ycyB1c2VkIGJ5IHRoZSBzY3JpcHQgKi9cbk1lbnUuc2VsZWN0b3JzID0ge1xuICBDTE9TRTogJ1tkYXRhLWpzLW1lbnUqPVwiY2xvc2VcIl0nLFxuICBPUEVOOiAnW2RhdGEtanMtbWVudSo9XCJvcGVuXCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTWVudTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdG9nZ2xlL3RvZ2dsZSc7XG5cbi8qKlxuICogVGhlIFNlYXJjaCBtb2R1bGVcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgU2VhcmNoIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogU2VhcmNoLnNlbGVjdG9yLFxuICAgICAgYWZ0ZXI6ICh0b2dnbGUpID0+IHtcbiAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWFyY2guc2VsZWN0b3IpO1xuICAgICAgICBsZXQgaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNlYXJjaC5zZWxlY3RvcnMuaW5wdXQpO1xuXG4gICAgICAgIGlmIChlbC5jbGFzc05hbWUuaW5jbHVkZXMoJ2FjdGl2ZScpICYmIGlucHV0KSB7XG4gICAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZG9tIHNlbGVjdG9yIGZvciB0aGUgbW9kdWxlXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5TZWFyY2guc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwic2VhcmNoXCJdJztcblxuU2VhcmNoLnNlbGVjdG9ycyA9IHtcbiAgaW5wdXQ6ICdbZGF0YS1qcyo9XCJzZWFyY2hfX2lucHV0XCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBEaWFsb2cgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2RpYWxvZy9kaWFsb2cnO1xuaW1wb3J0IERpcmVjdGlvbiBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZGlyZWN0aW9uL2RpcmVjdGlvbic7XG5pbXBvcnQgQ29weSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvY29weS9jb3B5JztcbmltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IEljb25zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9pY29ucy9pY29ucyc7XG5pbXBvcnQgTmV3c2xldHRlciBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvbmV3c2xldHRlci9uZXdzbGV0dGVyJztcbmltcG9ydCBUaGVtZXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RoZW1lcy90aGVtZXMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgVHJhY2sgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RyYWNrL3RyYWNrJztcbmltcG9ydCBXZWJTaGFyZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvd2ViLXNoYXJlL3dlYi1zaGFyZSc7XG5pbXBvcnQgV2luZG93VmggZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3dpbmRvdy12aC93aW5kb3ctdmgnO1xuXG5pbXBvcnQgc2VyaWFsaXplIGZyb20gJ2Zvci1jZXJpYWwnO1xuXG4vLyBFbGVtZW50c1xuLy8gaW1wb3J0IC4uLiBmcm9tICcuLi9lbGVtZW50cy8uLi4nO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgQWN0aXZlTmF2aWdhdGlvbiBmcm9tICcuLi9jb21wb25lbnRzL2FjdGl2ZS1uYXZpZ2F0aW9uL2FjdGl2ZS1uYXZpZ2F0aW9uJztcbi8vIGltcG9ydCAuLi4gZnJvbSAnLi4vY29tcG9uZW50cy8uLi4nO1xuXG4vLyBPYmplY3RzXG5pbXBvcnQgTWVudSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybi1tZW51L3NyYy9tZW51JztcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi4vb2JqZWN0cy9zZWFyY2gvc2VhcmNoJztcbi8vIGltcG9ydCAuLi4gZnJvbSAnLi4vb2JqZWN0cy8uLi4nO1xuXG4vKiogaW1wb3J0IG1vZHVsZXMgaGVyZSBhcyB0aGV5IGFyZSB3cml0dGVuLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAgTWFpbiBwYXR0ZXJuIG1vZHVsZVxuICovXG5jbGFzcyBtYWluIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvciAgTW9kdWxlcyB0byBiZSBleGVjdXRlZCBvbiBtYWluIHBhdHRlcm4gaW5zdGFudGlhdGlvbiBoZXJlXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBuZXcgV2luZG93VmgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBBY2NvcmRpb24gQ29tcG9uZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBBY2NvcmRpb25cbiAgICovXG4gIGFjY29yZGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEFjY29yZGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjdGl2ZSBOYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgQWN0aXZlTmF2aWdhdGlvblxuICAgKi9cbiAgYWN0aXZlTmF2aWdhdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZU5hdmlnYXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBDb3B5IFV0aWxpdHlcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIENvcHlcbiAgICovXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb3B5KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRGlhbG9nIENvbXBvbmVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgRGlhbG9nXG4gICAqL1xuICBkaWFsb2coKSB7XG4gICAgcmV0dXJuIG5ldyBEaWFsb2coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBEaXJlY3Rpb24gVXRpbGl0eVxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgRGlyZWN0aW9uXG4gICAqL1xuICBkaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3Rpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBVdGlsaXR5XG4gICAqXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBwYXRoICBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICBJbnN0YW5jZSBvZiBJY29uc1xuICAgKi9cbiAgaWNvbnMocGF0aCA9ICdzdmcvaWNvbnMuc3ZnJykge1xuICAgIHJldHVybiBuZXcgSWNvbnMocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTWVudVxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgTWVudVxuICAgKi9cbiAgbWVudSgpIHtcbiAgICByZXR1cm4gbmV3IE1lbnUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBOZXdzbGV0dGVyIE9iamVjdFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgTmV3c2xldHRlclxuICAgKi9cbiAgbmV3c2xldHRlcihlbmRwb2ludCA9ICcnKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE5ld3NsZXR0ZXIuc2VsZWN0b3IpO1xuXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGxldCBuZXdzbGV0dGVyID0gbmV3IE5ld3NsZXR0ZXIoZWxlbWVudCk7XG5cbiAgICAgIG5ld3NsZXR0ZXIuZm9ybS5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQgPSAnLmMtcXVlc3Rpb25fX2NvbnRhaW5lcic7XG5cbiAgICAgIHdpbmRvd1tuZXdzbGV0dGVyLmNhbGxiYWNrXSA9IGRhdGEgPT4ge1xuICAgICAgICBkYXRhLnJlc3BvbnNlID0gdHJ1ZTtcblxuICAgICAgICBkYXRhLmVtYWlsID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiRU1BSUxcIl0nKS52YWx1ZTtcblxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBgJHtlbmRwb2ludH0/YCArIE9iamVjdC5rZXlzKGRhdGEpXG4gICAgICAgICAgLm1hcChrID0+IGAke2t9PSR7ZW5jb2RlVVJJKGRhdGFba10pfWApLmpvaW4oJyYnKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBuZXdzbGV0dGVyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBOZXdzbGV0dGVyIE9iamVjdFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgTmV3c2xldHRlclxuICAgKi9cbiAgbmV3c2xldHRlckZvcm0oZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWpzPVwibmV3c2xldHRlci1mb3JtXCJdJykpIHtcbiAgICBsZXQgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICBsZXQgcmVzcG9uc2UgPSBwYXJhbXMuZ2V0KCdyZXNwb25zZScpO1xuICAgIGxldCBuZXdzbGV0dGVyID0gbnVsbDtcblxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBuZXdzbGV0dGVyID0gbmV3IE5ld3NsZXR0ZXIoZWxlbWVudCk7XG4gICAgICBuZXdzbGV0dGVyLmZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJy5jLXF1ZXN0aW9uX19jb250YWluZXInO1xuICAgIH1cblxuICAgIGlmIChyZXNwb25zZSAmJiBuZXdzbGV0dGVyKSB7XG4gICAgICBsZXQgZW1haWwgPSBwYXJhbXMuZ2V0KCdlbWFpbCcpO1xuICAgICAgbGV0IGlucHV0ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiRU1BSUxcIl0nKTtcblxuICAgICAgaW5wdXQudmFsdWUgPSBlbWFpbDtcblxuICAgICAgbmV3c2xldHRlci5fZGF0YSA9IHtcbiAgICAgICAgJ3Jlc3VsdCc6IHBhcmFtcy5nZXQoJ3Jlc3VsdCcpLFxuICAgICAgICAnbXNnJzogcGFyYW1zLmdldCgnbXNnJyksXG4gICAgICAgICdFTUFJTCc6IGVtYWlsXG4gICAgICB9O1xuXG4gICAgICBuZXdzbGV0dGVyLl9jYWxsYmFjayhuZXdzbGV0dGVyLl9kYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3c2xldHRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBTZWFyY2hcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFNlYXJjaFxuICAgKi9cbiAgc2VhcmNoKCkge1xuICAgIHJldHVybiBuZXcgU2VhcmNoKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IENTUyBwcm9wZXJ0aWVzIG9mIHZhcmlvdXMgZWxlbWVudCBoZWlnaHRzIGZvciBjYWxjdWxhdGluZyB0aGUgdHJ1ZVxuICAgKiB3aW5kb3cgYm90dG9tIHZhbHVlIGluIENTUy5cbiAgICovXG4gIHNldE9iamVjdEhlaWdodHMoKSB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBbXG4gICAgICB7XG4gICAgICAgICdzZWxlY3Rvcic6ICdbZGF0YS1qcz1cIm5hdmlnYXRpb25cIl0nLFxuICAgICAgICAncHJvcGVydHknOiAnLS13bnljLWRpbWVuc2lvbnMtbmF2aWdhdGlvbi1oZWlnaHQnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAnc2VsZWN0b3InOiAnW2RhdGEtanM9XCJmZWVkYmFja1wiXScsXG4gICAgICAgICdwcm9wZXJ0eSc6ICctLXdueWMtZGltZW5zaW9ucy1mZWVkYmFjay1oZWlnaHQnXG4gICAgICB9XG4gICAgXTtcblxuICAgIGxldCBzZXRPYmplY3RIZWlnaHRzID0gKGUpID0+IHtcbiAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlWydzZWxlY3RvciddKTtcblxuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGVbJ3Byb3BlcnR5J10sIGAke2VsZW1lbnQuY2xpZW50SGVpZ2h0fXB4YCk7XG4gICAgfTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnRzW2ldWydzZWxlY3RvciddKSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHNldE9iamVjdEhlaWdodHMoZWxlbWVudHNbaV0pKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHNldE9iamVjdEhlaWdodHMoZWxlbWVudHNbaV0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShlbGVtZW50c1tpXVsncHJvcGVydHknXSwgJzBweCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUaGVtZXMgVXRpbGl0eVxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgVGhlbWVzXG4gICAqL1xuICB0aGVtZXMoKSB7XG4gICAgcmV0dXJuIG5ldyBUaGVtZXMoe1xuICAgICAgdGhlbWVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0xpZ2h0IFRoZW1lJyxcbiAgICAgICAgICBjbGFzc25hbWU6ICdkZWZhdWx0JyxcbiAgICAgICAgICBpY29uOiAnZmVhdGhlci1zdW4nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0RhcmsgVGhlbWUnLFxuICAgICAgICAgIGNsYXNzbmFtZTogJ2xpZ2h0JyxcbiAgICAgICAgICBpY29uOiAnZmVhdGhlci1tb29uJ1xuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgYWZ0ZXI6IHRobXMgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aG1zLnNlbGVjdG9ycy5UT0dHTEUpXG4gICAgICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtanMtdGhlbWVzPVwiaWNvblwiXScpXG4gICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdocmVmJywgYCMke3RobXMudGhlbWUuaWNvbn1gKTtcbiAgICAgICAgfSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUb2dnbGUgVXRpbGl0eVxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgc2V0dGluZ3MgIFNldHRpbmdzIGZvciB0aGUgVG9nZ2xlIENsYXNzXG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICAgICAgSW5zdGFuY2Ugb2YgVG9nZ2xlXG4gICAqL1xuICB0b2dnbGUoc2V0dGluZ3MgPSBmYWxzZSkge1xuICAgIHJldHVybiAoc2V0dGluZ3MpID8gbmV3IFRvZ2dsZShzZXR0aW5ncykgOiBuZXcgVG9nZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVHJhY2sgT2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBUcmFja1xuICAgKi9cbiAgdHJhY2soKSB7XG4gICAgcmV0dXJuIG5ldyBUcmFjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgV2ViIFNoYXJlXG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBXZWJTaGFyZVxuICAgKi9cbiAgd2ViU2hhcmUoKSB7XG4gICAgcmV0dXJuIG5ldyBXZWJTaGFyZSh7XG4gICAgICBmYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBuZXcgVG9nZ2xlKHtcbiAgICAgICAgICBzZWxlY3RvcjogV2ViU2hhcmUuc2VsZWN0b3JcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQVBJIGZvciB2YWxpZGF0aW5nIGEgZm9ybS5cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICBzZWxlY3RvciAgQSBjdXN0b20gc2VsZWN0b3IgZm9yIGEgZm9ybVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gIHN1Ym1pdCAgICBBIGN1c3RvbSBldmVudCBoYW5kbGVyIGZvciBhIGZvcm1cbiAgICovXG4gIHZhbGlkYXRlKHNlbGVjdG9yID0gJ1tkYXRhLWpzPVwidmFsaWRhdGVcIl0nLCBzdWJtaXQgPSBmYWxzZSkge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgbGV0IGZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpO1xuXG4gICAgICBmb3JtLnN1Ym1pdCA9IChzdWJtaXQpID8gc3VibWl0IDogKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5zdWJtaXQoKTtcbiAgICAgIH07XG5cbiAgICAgIGZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJy5jLXF1ZXN0aW9uX19jb250YWluZXInO1xuXG4gICAgICBmb3JtLndhdGNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyBhIGZvcm0gYW5kIGJ1aWxkcyBhIFVSTCBzZWFyY2ggcXVlcnkgb24gdGhlIGFjdGlvbiBiYXNlZCBvbiBkYXRhLlxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBzZWxlY3RvciAgQSBjdXN0b20gc2VsZWN0b3IgZm9yIGEgZm9ybVxuICAgKi9cbiAgdmFsaWRhdGVBbmRRdWVyeShzZWxlY3RvciA9ICdbZGF0YS1qcz1cInZhbGlkYXRlLWFuZC1xdWVyeVwiXScpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGxldCBmb3JtID0gbmV3IEZvcm1zKGVsZW1lbnQpO1xuXG4gICAgICBmb3JtLnN1Ym1pdCA9IGV2ZW50ID0+IHtcbiAgICAgICAgbGV0IGRhdGEgPSBzZXJpYWxpemUoZXZlbnQudGFyZ2V0LCB7aGFzaDogdHJ1ZX0pO1xuXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGAke2V2ZW50LnRhcmdldC5hY3Rpb259P2AgKyBPYmplY3Qua2V5cyhkYXRhKVxuICAgICAgICAgIC5tYXAoayA9PiBgJHtrfT0ke2VuY29kZVVSSShkYXRhW2tdKX1gKS5qb2luKCcmJyk7XG4gICAgICB9O1xuXG4gICAgICBmb3JtLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCA9ICcuYy1xdWVzdGlvbl9fY29udGFpbmVyJztcblxuICAgICAgZm9ybS53YXRjaCgpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztFQUVBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLE1BQU0sTUFBTSxDQUFDO0VBQ2I7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUU7RUFDakI7RUFDQSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDL0MsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuQztFQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0QjtFQUNBLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRztFQUNwQixNQUFNLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUTtFQUMzRCxNQUFNLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUztFQUMvRCxNQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYTtFQUMvRSxNQUFNLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVztFQUN2RSxNQUFNLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLO0VBQzNDLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUs7RUFDeEMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSztFQUN4QyxNQUFNLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJO0VBQ3JFLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUk7RUFDdEQsS0FBSyxDQUFDO0FBQ047RUFDQTtFQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDbkQ7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtFQUN0QixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxLQUFLO0VBQ3hELFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMzQixPQUFPLENBQUMsQ0FBQztFQUNULEtBQUssTUFBTTtFQUNYO0VBQ0EsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtFQUMzRSxRQUFRLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEQ7RUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUN2RCxVQUFVLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUM7RUFDQSxVQUFVLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJO0VBQ3JELFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0VBQzdELGNBQWMsT0FBTztBQUNyQjtFQUNBLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDL0I7RUFDQSxZQUFZLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDaEQ7RUFDQSxZQUFZO0VBQ1osY0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztFQUM5QixjQUFjLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0VBQ25DLGNBQWMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7RUFDbEUsY0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3RDLFdBQVcsQ0FBQyxDQUFDO0VBQ2IsU0FBUztFQUNULE9BQU87RUFDUCxLQUFLO0FBQ0w7RUFDQTtFQUNBO0VBQ0EsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzNEO0VBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQztFQUNoQixHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFO0VBQ2YsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3ZCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRTtFQUNoQixJQUFJLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDN0M7RUFDQSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7RUFDL0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3pCLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0VBQ3RELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN6QixLQUFLO0VBQ0wsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRTtFQUNwQixJQUFJLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN2QjtFQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtFQUNuQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBQztFQUNwRSxLQUFLO0FBQ0w7RUFDQTtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBLElBQUksT0FBTyxNQUFNLENBQUM7RUFDbEIsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRTtFQUNyQixJQUFJLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN2QjtFQUNBO0VBQ0EsSUFBSSxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztFQUMxQyxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUNwRTtFQUNBO0VBQ0EsSUFBSSxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQztFQUNuRCxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDbkY7RUFDQSxJQUFJLE9BQU8sTUFBTSxDQUFDO0VBQ2xCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFO0VBQ2hCLElBQUksSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztFQUMvQixJQUFJLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztFQUN2QixJQUFJLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN2QjtFQUNBLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzNCO0VBQ0EsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyQztFQUNBO0VBQ0EsSUFBSSxTQUFTLEdBQUcsQ0FBQyxNQUFNO0VBQ3ZCLE1BQU0sTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQ3pFO0VBQ0E7RUFDQSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLENBQUM7RUFDN0IsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkQ7RUFDQTtFQUNBLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO0VBQzNELE1BQU0sTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWE7RUFDekMsUUFBUSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN6RCxPQUFPLENBQUM7QUFDUjtFQUNBLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSztFQUNoRCxRQUFRLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMvQixRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0VBQzVDLFFBQVEsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzFDLE9BQU8sQ0FBQyxDQUFDO0VBQ1QsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQztFQUNoQixHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFO0VBQ3JCLElBQUksSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3pCO0VBQ0EsSUFBSSxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7RUFDdEMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUM1RCxLQUFLLE1BQU0sSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxFQUFFO0VBQ3RELE1BQU0sUUFBUSxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUM5RSxLQUFLO0FBQ0w7RUFDQSxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNqRSxHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLGVBQWUsQ0FBQyxRQUFRLEVBQUU7RUFDNUIsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSTtFQUNoQyxNQUFNLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdEQ7RUFDQSxNQUFNLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtFQUM3QixRQUFRLElBQUksV0FBVyxHQUFHLE9BQU87RUFDakMsV0FBVyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzdEO0VBQ0EsUUFBUSxJQUFJLFdBQVcsRUFBRTtFQUN6QixVQUFVLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0VBQ3hELFNBQVMsTUFBTTtFQUNmLFVBQVUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUM5QyxTQUFTO0VBQ1QsT0FBTyxNQUFNO0VBQ2IsUUFBUSxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUMvQyxPQUFPO0VBQ1AsS0FBSyxDQUFDLENBQUM7QUFDUDtFQUNBLElBQUksT0FBTyxJQUFJLENBQUM7RUFDaEIsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTtFQUMxQjtFQUNBO0VBQ0EsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFO0VBQzVCLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6RDtFQUNBO0VBQ0EsSUFBSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7RUFDOUQsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFEO0VBQ0EsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUMzQyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUMxQyxLQUFLLE1BQU07RUFDWCxNQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDekMsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQztFQUNoQixHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsR0FBRyxFQUFFLEVBQUU7RUFDakQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDZCxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNsQixJQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNuQjtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0EsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0VBQ3pCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzFDLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDL0I7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztFQUN6RCxNQUFNLE9BQU8sSUFBSSxDQUFDO0FBQ2xCO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO0VBQzVCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakM7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtFQUNuQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0VBQy9ELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUQ7RUFDQTtFQUNBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJO0VBQ25DLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU87RUFDbEMsVUFBVSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0VBQzVELE9BQU8sQ0FBQyxDQUFDO0VBQ1QsS0FBSztBQUNMO0VBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYTtFQUNuQyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0Q7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBLElBQUksS0FBSyxDQUFD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QTtFQUNBO0VBQ0E7RUFDQSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUU7RUFDZixJQUFJLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7RUFDaEQsSUFBSSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUU7RUFDQSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQzlDO0VBQ0EsTUFBTSxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0I7RUFDQSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckI7RUFDQTtFQUNBLE1BQU0sSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTO0FBQ3RDO0VBQ0EsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3pCLEtBQUs7QUFDTDtFQUNBLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDO0VBQ3hDLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLEVBQUU7RUFDdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzFDO0VBQ0EsSUFBSSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkU7RUFDQTtFQUNBLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FB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LENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFnQixrQkFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7O0VDSzlxRDtFQUNBO0VBQ0E7RUFDQSxNQUFNLFVBQVUsQ0FBQztFQUNqQjtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRTtFQUN2QixJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCO0VBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDaEM7RUFDQSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztBQUMxQztFQUNBLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO0FBQzFDO0VBQ0EsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDeEM7RUFDQSxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztBQUM1QztFQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO0FBQ3RDO0VBQ0EsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7QUFDMUM7RUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUN0QztFQUNBLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRztFQUNwQixNQUFNLFVBQVUsQ0FBQyxRQUFRO0VBQ3pCLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO0VBQ2hELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZjtFQUNBO0VBQ0E7RUFDQSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUs7RUFDdEMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzNCLEtBQUssQ0FBQztBQUNOO0VBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDMUQ7RUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDckM7RUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxLQUFLO0VBQ2xDLE1BQU0sS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzdCO0VBQ0EsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztFQUN6QixTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0VBQzNCLFNBQVMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUM5QixLQUFLLENBQUM7QUFDTjtFQUNBLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QjtFQUNBLElBQUksT0FBTyxJQUFJLENBQUM7RUFDaEIsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFO0VBQ2pCLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzNCO0VBQ0E7RUFDQSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RDtFQUNBO0VBQ0E7RUFDQSxJQUFJLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU87RUFDNUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUMvRCxLQUFLLENBQUM7QUFDTjtFQUNBO0VBQ0EsSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxNQUFNLEtBQUs7RUFDMUUsTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2xFO0VBQ0EsTUFBTSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNqRCxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ1I7RUFDQTtFQUNBO0VBQ0EsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDbkQ7RUFDQTtFQUNBLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQUs7RUFDNUMsTUFBTSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3REO0VBQ0EsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUN4QyxNQUFNLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO0VBQzlCLE1BQU0sTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7RUFDOUIsTUFBTSxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztFQUMxQixNQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3JDLEtBQUssQ0FBQyxDQUFDO0VBQ1AsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUU7RUFDakIsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNCO0VBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQztFQUNoQixHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRTtFQUNsQjtFQUNBLElBQStDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEU7RUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDO0VBQ2hCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFO0VBQ2xCLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNsRCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUN6RCxLQUFLLE1BQU07RUFDWDtFQUNBLE1BQWlELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbkUsS0FBSztBQUNMO0VBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQztFQUNoQixHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRTtFQUNkLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEM7RUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDO0VBQ2hCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFO0VBQ2hCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEM7RUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDO0VBQ2hCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLFlBQVksRUFBRTtFQUN2QyxJQUFJLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQy9DLElBQUksSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3hCO0VBQ0EsSUFBSSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEU7RUFDQSxJQUFJLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhO0VBQzVDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVO0VBQy9CLEtBQUssQ0FBQztBQUNOO0VBQ0E7RUFDQTtFQUNBLElBQUksSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDbEUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxVQUFV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
