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

  var e=/^(?:submit|button|image|reset|file)$/i,t=/^(?:input|select|textarea|keygen)/i,n=/(\[[^\[\]]*\])/g;function a(e,t,a){if(t.match(n)){ !function e(t,n,a){if(0===n.length){ return a; }var r=n.shift(),i=r.match(/^\[(.+?)\]$/);if("[]"===r){ return t=t||[],Array.isArray(t)?t.push(e(null,n,a)):(t._values=t._values||[],t._values.push(e(null,n,a))),t; }if(i){var l=i[1],u=+l;isNaN(u)?(t=t||{})[l]=e(t[l],n,a):(t=t||[])[u]=e(t[u],n,a);}else { t[r]=e(t[r],n,a); }return t}(e,function(e){var t=[],a=new RegExp(n),r=/^([^\[\]]*)/.exec(e);for(r[1]&&t.push(r[1]);null!==(r=a.exec(e));){ t.push(r[1]); }return t}(t),a); }else {var r=e[t];r?(Array.isArray(r)||(e[t]=[r]),e[t].push(a)):e[t]=a;}return e}function r(e,t,n){return n=(n=String(n)).replace(/(\r)?\n/g,"\r\n"),n=(n=encodeURIComponent(n)).replace(/%20/g,"+"),e+(e?"&":"")+encodeURIComponent(t)+"="+n}function serialize(n,i){"object"!=typeof i?i={hash:!!i}:void 0===i.hash&&(i.hash=!0);for(var l=i.hash?{}:"",u=i.serializer||(i.hash?a:r),s=n&&n.elements?n.elements:[],c=Object.create(null),o=0;o<s.length;++o){var h=s[o];if((i.disabled||!h.disabled)&&h.name&&t.test(h.nodeName)&&!e.test(h.type)){var p=h.name,f=h.value;if("checkbox"!==h.type&&"radio"!==h.type||h.checked||(f=void 0),i.empty){if("checkbox"!==h.type||h.checked||(f=!1),"radio"===h.type&&(c[h.name]||h.checked?h.checked&&(c[h.name]=!0):c[h.name]=!1),null==f&&"radio"==h.type){ continue }}else if(!f){ continue; }if("select-multiple"!==h.type){ l=u(l,p,f); }else {f=[];for(var v=h.options,m=!1,d=0;d<v.length;++d){var y=v[d];y.selected&&(y.value||i.empty&&!y.value)&&(m=!0,l=i.hash&&"[]"!==p.slice(p.length-2)?u(l,p+"[]",y.value):u(l,p,y.value));}!m&&i.empty&&(l=u(l,p,""));}}}if(i.empty){ for(var p in c){ c[p]||(l=u(l,p,"")); } }return l}

  /**
   * @class  The Newsletter module
   */
  var Newsletter = function Newsletter(element) {
    var this$1 = this;

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
    window[this.callback] = function (data) {
      this$1._callback(data);
    };

    this.form = new Forms(this._el.querySelector('form'));

    this.form.strings = this.strings;

    this.form.submit = function (event) {
      event.preventDefault();

      this$1._submit(event)
        .then(this$1._onload)
        .catch(this$1._onerror);
    };

    this.form.watch();

    return this;
  };

  /**
   * The form submission method. Requests a script with a callback function
   * to be executed on our page. The callback function will be passed the
   * response as a JSON object (function parameter).
   *
   * @param {Event}  eventThe form submission event
   *
   * @return{Promise}       A promise containing the new script call
   */
  Newsletter.prototype._submit = function _submit (event) {
    event.preventDefault();

    // Serialize the data
    this._data = serialize(event.target, {hash: true});

    // Switch the action to post-json. This creates an endpoint for mailchimp
    // that acts as a script that can be loaded onto our page.
    var action = event.target.action.replace(
      ((this.endpoints.MAIN) + "?"), ((this.endpoints.MAIN_JSON) + "?")
    );

    // Add our params to the action
    action = action + serialize(event.target, {serializer: function () {
        var params = [], len = arguments.length;
        while ( len-- ) params[ len ] = arguments[ len ];

      var prev = (typeof params[0] === 'string') ? params[0] : '';

      return (prev + "&" + (params[1]) + "=" + (params[2]));
    }});

    // Append the callback reference. Mailchimp will wrap the JSON response in
    // our callback method. Once we load the script the callback will execute.
    action = action + "&c=window." + (this.callback);

    // Create a promise that appends the script response of the post-json method
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');

      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = encodeURI(action);
    });
  };

  /**
   * The script onload resolution
   *
   * @param {Event}eventThe script on load event
   *
   * @return{Class}       The Newsletter class
   */
  Newsletter.prototype._onload = function _onload (event) {
    event.path[0].remove();

    return this;
  };

  /**
   * The script on error resolution
   *
   * @param {Object}errorThe script on error load event
   *
   * @return{Class}        The Newsletter class
   */
  Newsletter.prototype._onerror = function _onerror (error) {
    // eslint-disable-next-line no-console
    { console.dir(error); }

    return this;
  };

  /**
   * The callback function for the MailChimp Script call
   *
   * @param {Object}dataThe success/error message from MailChimp
   *
   * @return{Class}      The Newsletter class
   */
  Newsletter.prototype._callback = function _callback (data) {
    if (this[("_" + (data[this._key('MC_RESULT')]))]) {
      this[("_" + (data[this._key('MC_RESULT')]))](data.msg);
    } else {
      // eslint-disable-next-line no-console
      { console.dir(data); }
    }

    return this;
  };

  /**
   * Submission error handler
   *
   * @param {string}msgThe error message
   *
   * @return{Class}      The Newsletter class
   */
  Newsletter.prototype._error = function _error (msg) {
    this._elementsReset();
    this._messaging('WARNING', msg);

    return this;
  };

  /**
   * Submission success handler
   *
   * @param {string}msgThe success message
   *
   * @return{Class}      The Newsletter class
   */
  Newsletter.prototype._success = function _success (msg) {
    this._elementsReset();
    this._messaging('SUCCESS', msg);

    return this;
  };

  /**
   * Present the response message to the user
   *
   * @param {String}typeThe message type
   * @param {String}msg The message
   *
   * @return{Class}       Newsletter
   */
  Newsletter.prototype._messaging = function _messaging (type, msg) {
      var this$1 = this;
      if ( msg === void 0 ) msg = 'no message';

    var strings = Object.keys(this.stringKeys);
    var handled = false;

    var alertBox = this._el.querySelector(this.selectors[type]);

    var alertBoxMsg = alertBox.querySelector(
      this.selectors.ALERT_TEXT
    );

    // Get the localized string, these should be written to the DOM already.
    // The utility contains a global method for retrieving them.
    var stringKeys = strings.filter(function (s) { return msg.includes(this$1.stringKeys[s]); });
    msg = (stringKeys.length) ? this.strings[stringKeys[0]] : msg;
    handled = (stringKeys.length) ? true : false;

    // Replace string templates with values from either our form data or
    // the Newsletter strings object.
    for (var x = 0; x < this.templates.length; x++) {
      var template = this.templates[x];
      var key = template.replace('{{ ', '').replace(' }}', '');
      var value = this._data[key] || this.strings[key];
      var reg = new RegExp(template, 'gi');

      msg = msg.replace(reg, (value) ? value : '');
    }

    if (handled) {
      alertBoxMsg.innerHTML = msg;
    } else if (type === 'ERROR') {
      alertBoxMsg.innerHTML = this.strings.ERR_PLEASE_TRY_LATER;
    }

    if (alertBox) { this._elementShow(alertBox, alertBoxMsg); }

    return this;
  };

  /**
   * The main toggling method
   *
   * @return{Class}Newsletter
   */
  Newsletter.prototype._elementsReset = function _elementsReset () {
      var this$1 = this;

    var targets = this._el.querySelectorAll(this.selectors.ALERTS);

    var loop = function ( i ) {
        if (!targets[i].classList.contains(this$1.classes.HIDDEN)) {
        targets[i].classList.add(this$1.classes.HIDDEN);

        this$1.classes.ANIMATE.split(' ').forEach(function (item) { return targets[i].classList.remove(item); }
        );

        // Screen Readers
        targets[i].setAttribute('aria-hidden', 'true');
        targets[i].querySelector(this$1.selectors.ALERT_TEXT)
          .setAttribute('aria-live', 'off');
      }
      };

      for (var i = 0; i < targets.length; i++)
      loop( i );

    return this;
  };

  /**
   * The main toggling method
   *
   * @param {object}target Message container
   * @param {object}contentContent that changes dynamically that should
   *                           be announced to screen readers.
   *
   * @return{Class}          Newsletter
   */
  Newsletter.prototype._elementShow = function _elementShow (target, content) {
    target.classList.toggle(this.classes.HIDDEN);

    this.classes.ANIMATE.split(' ').forEach(function (item) { return target.classList.toggle(item); }
    );

    // Screen Readers
    target.setAttribute('aria-hidden', 'true');

    if (content) {
      content.setAttribute('aria-live', 'polite');
    }

    return this;
  };

  /**
   * A proxy function for retrieving the proper key
   *
   * @param {string}keyThe reference for the stored keys.
   *
   * @return{string}     The desired key.
   */
  Newsletter.prototype._key = function _key (key) {
    return this.keys[key];
  };

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

  var Dropdown = function Dropdown() {
    this.toggle = new Toggle({
      selector: Dropdown.selector,
      after: function () {
        var body = document.querySelector('body');
        window.scroll(0, 0);
        body.classList.toggle(Dropdown.classes.OVERFLOW);
      }
    });
    return this;
  };
  /** @type  String  Main DOM selector */


  Dropdown.selector = '[data-js*=\"dropdown\"]';
  /** @type  Object  Various classes used by the script */

  Dropdown.classes = {
    OVERFLOW: 'overflow-hidden'
  };

  /**
   * The Mobile Nav module
   *
   * @class
   */

  var MobileMenu = function MobileMenu() {
    var this$1 = this;

    this.selector = MobileMenu.selector;
    this.selectors = MobileMenu.selectors;
    this.toggle = new Toggle({
      selector: this.selector,
      after: function (toggle) {
        if (toggle.target.classList.contains(Toggle.activeClass)) {
          toggle.target.querySelector(this$1.selectors.CLOSE).focus();
        } else {
          document.querySelector(this$1.selectors.OPEN).focus();
        }
      }
    });
    return this;
  };
  /** @type  {String}  The dom selector for the module */


  MobileMenu.selector = '[data-js*="mobile-menu"]';
  /** @type  {Object}  Additional selectors used by the script */

  MobileMenu.selectors = {
    CLOSE: '[data-js-mobile-menu*="close"]',
    OPEN: '[data-js-mobile-menu*="open"]'
  };

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
   *
   * @param {Object}settingsSettings for the Toggle Class
   *
   * @return{Object}          Instance of toggle
   */


  main.prototype.toggle = function toggle (settings) {
      if ( settings === void 0 ) settings = false;

    return settings ? new Toggle(settings) : new Toggle();
  };
  /**
   * API for validating a form.
   *
   * @param{string}  selector
   * @param{function}submit
   */


  main.prototype.valid = function valid (selector, submit) {
      if ( submit === void 0 ) submit = false;

    if (document.querySelector(selector)) {
      var form = new Forms(document.querySelector(selector));
      form.submit = submit ? submit : function (event) {
        event.target.submit();
      };
      form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
      form.watch();
    }
  };
  /**
   * An API for the Accordion Component
   *
   * @return{Object}Instance of Accordion
   */


  main.prototype.accordion = function accordion () {
    return new Accordion();
  };
  /**
   * An API for the Dropdown Component
   *
   * @return{Object}Instance of Dropdown
   */


  main.prototype.dropdown = function dropdown () {
    return new Dropdown();
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
  //* @return {Object} Instance of Filter
  //*/
  // filter() {
  // return new Filter();
  // }
  // /**
  //* An API for the Nearby Stops Component
  //* @return {Object} Instance of NearbyStops
  //*/
  // nearbyStops() {
  // return new NearbyStops();
  // }

  /**
   * An API for the Newsletter Object
   *
   * @return{Object}Instance of Newsletter
   */


  main.prototype.newsletter = function newsletter (endpoint) {
      if ( endpoint === void 0 ) endpoint = '';

    var element = document.querySelector(Newsletter.selector);

    if (element) {
      var newsletter = new Newsletter(element);
      newsletter.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';

      window[newsletter.callback] = function (data) {
        data.response = true;
        data.email = element.querySelector('input[name="EMAIL"]').value;
        window.location = endpoint + "?" + Object.keys(data).map(function (k) { return (k + "=" + (encodeURI(data[k]))); }).join('&');
      };

      return newsletter;
    }
  };
  /**
   * An API for the Newsletter Object
   *
   * @return{Object}Instance of Newsletter
   */


  main.prototype.newsletterForm = function newsletterForm (element) {
      if ( element === void 0 ) element = document.querySelector('[data-js="newsletter-form"]');

    var params = new URLSearchParams(window.location.search);
    var response = params.get('response');
    var newsletter = null;

    if (element) {
      newsletter = new Newsletter(element);
      newsletter.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
    }

    if (response && newsletter) {
      var email = params.get('email');
      var input = element.querySelector('input[name="EMAIL"]');
      input.value = email;
      newsletter._data = {
        'result': params.get('result'),
        'msg': params.get('msg'),
        'EMAIL': email
      };

      newsletter._callback(newsletter._data);
    }

    return newsletter;
  }; // /**
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
   * @return{Object}Instance of MobileMenu
   */


  main.prototype.mobileMenu = function mobileMenu () {
    return new MobileMenu();
  };
  /**
   * An API for the Search Box
   *
   * @return{Object}Instance of Search
   */


  main.prototype.search = function search () {
    return new Search();
  };
  /**
   * An API for Web Share
   *
   * @return{Object}Instance of WebShare
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9jb3B5L2NvcHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9mb3ItY2VyaWFsL2Rpc3QvaW5kZXgubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9uZXdzbGV0dGVyL25ld3NsZXR0ZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RyYWNrL3RyYWNrLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy93ZWItc2hhcmUvd2ViLXNoYXJlLmpzIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIi4uLy4uL3NyYy9jb21wb25lbnRzL2Ryb3Bkb3duL2Ryb3Bkb3duLmpzIiwiLi4vLi4vc3JjL29iamVjdHMvbW9iaWxlLW1lbnUvbW9iaWxlLW1lbnUuanMiLCIuLi8uLi9zcmMvb2JqZWN0cy9zZWFyY2gvc2VhcmNoLmpzIiwiLi4vLi4vc3JjL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBzICBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KCdBQ0NFU1NfVE9HR0xFUycpKVxuICAgICAgd2luZG93LkFDQ0VTU19UT0dHTEVTID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIFN0b3JlIHRoZSBlbGVtZW50IGZvciBwb3RlbnRpYWwgdXNlIGluIGNhbGxiYWNrc1xuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KVxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvdy5BQ0NFU1NfVE9HR0xFUy5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAvLyBTdG9yZSB0aGUgZXZlbnQgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50O1xuXG4gICAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgIC8vIFJlY29yZCB0aGF0IGEgdG9nZ2xlIHVzaW5nIHRoaXMgc2VsZWN0b3IgaGFzIGJlZW4gaW5zdGFudGlhdGVkLiBUaGlzXG4gICAgLy8gcHJldmVudHMgZG91YmxlIHRvZ2dsaW5nLlxuICAgIHdpbmRvdy5BQ0NFU1NfVE9HR0xFU1t0aGlzLnNldHRpbmdzLnNlbGVjdG9yXSA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGNvbnN0YW50cyB0byB0aGUgZGVidWdnZXJcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG4gICAgbGV0IGZvY3VzYWJsZSA9IFtdO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8qKiBBbmNob3IgTGlua3MgKi9cbiAgICB0YXJnZXQgPSAoZWwuaGFzQXR0cmlidXRlKCdocmVmJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZ2V0QXR0cmlidXRlKCdocmVmJykpIDogdGFyZ2V0O1xuXG4gICAgLyoqIFRvZ2dsZSBDb250cm9scyAqL1xuICAgIHRhcmdldCA9IChlbC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YCkgOiB0YXJnZXQ7XG5cbiAgICAvKiogRm9jdXNhYmxlIENoaWxkcmVuICovXG4gICAgZm9jdXNhYmxlID0gKHRhcmdldCkgP1xuICAgICAgdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoVG9nZ2xlLmVsRm9jdXNhYmxlLmpvaW4oJywgJykpIDogZm9jdXNhYmxlO1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCwgZm9jdXNhYmxlKTtcblxuICAgIC8qKiBVbmRvICovXG4gICAgaWYgKGVsLmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWwuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG5cbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsLCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgICBlbCAgICAgICAgIFRoZSBjdXJyZW50IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZVxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgIHRhcmdldCAgICAgVGhlIHRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEBwYXJhbSAge05vZGVMaXN0fSAgZm9jdXNhYmxlICBBbnkgZm9jdXNhYmxlIGNoaWxkcmVuIGluIHRoZSB0YXJnZXRcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICBUaGUgY2xhc3NcbiAgICovXG4gIGVsZW1lbnRUb2dnbGUoZWwsIHRhcmdldCwgZm9jdXNhYmxlID0gW10pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8vIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgbGV0IG90aGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgW2FyaWEtY29udHJvbHM9XCIke2VsLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWApO1xuXG4gICAgLy8gU3RvcmUgZWxlbWVudHMgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgdGhpcy5lbGVtZW50ID0gZWw7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5vdGhlcnMgPSBvdGhlcnM7XG4gICAgdGhpcy5mb2N1c2FibGUgPSBmb2N1c2FibGU7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGluZyBiZWZvcmUgaG9va1xuICAgICAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSkgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgaWYgKG90aGVycykgb3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gZWwpIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZGUgdGhlIFRvZ2dsZSBUYXJnZXQncyBmb2N1c2FibGUgY2hpbGRyZW4gZnJvbSBmb2N1cy5cbiAgICAgKiBJZiBhbiBlbGVtZW50IGhhcyB0aGUgZGF0YS1hdHRyaWJ1dGUgJ2RhdGEtdG9nZ2xlLXRhYmluZGV4JywgdXNlIHRoYXRcbiAgICAgKiBhcyB0aGUgZGVmYXVsdCB0YWIgaW5kZXggb2YgdGhlIGVsZW1lbnQuXG4gICAgICovXG4gICAgZm9jdXNhYmxlLmZvckVhY2goZWwgPT4ge1xuICAgICAgbGV0IHRhYmluZGV4ID0gZWwuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXG4gICAgICBpZiAodGFiaW5kZXggPT09ICctMScpIHtcbiAgICAgICAgbGV0IGRhdGFEZWZhdWx0ID0gZWwuZ2V0QXR0cmlidXRlKGBkYXRhLSR7VG9nZ2xlLm5hbWVzcGFjZX0tdGFiaW5kZXhgKTtcblxuICAgICAgICBpZiAoZGF0YURlZmF1bHQpIHtcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgZGF0YURlZmF1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSnVtcCB0byBUYXJnZXQgRWxlbWVudCAoaWYgVG9nZ2xlIEVsZW1lbnQgaXMgYW4gYW5jaG9yIGxpbmspLlxuICAgICAqL1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUsIHRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIGp1bXAgaXRlbSBpcyB0b2dnbGVkIGNsb3NlZC5cbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAgIC8vIFRhcmdldCBlbGVtZW50IHRvZ2dsZS5cbiAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgICB9IGVsc2VcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICBpZiAob3RoZXJzKSBvdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSBlbCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9vay5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcikgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0b2dnbGluZyBlbGVtZW50ICovXG5Ub2dnbGUuZWxBcmlhUm9sZXMgPSBbJ2FyaWEtcHJlc3NlZCcsICdhcmlhLWV4cGFuZGVkJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRm9jdXNhYmxlIGVsZW1lbnRzIHRvIGhpZGUgd2l0aGluIHRoZSBoaWRkZW4gdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS5lbEZvY3VzYWJsZSA9IFtcbiAgJ2EnLCAnYnV0dG9uJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScsICdvYmplY3QnLCAnZW1iZWQnLCAnZm9ybScsXG4gICdmaWVsZHNldCcsICdsZWdlbmQnLCAnbGFiZWwnLCAnYXJlYScsICdhdWRpbycsICd2aWRlbycsICdpZnJhbWUnLCAnc3ZnJyxcbiAgJ2RldGFpbHMnLCAndGFibGUnLCAnW3RhYmluZGV4XScsICdbY29udGVudGVkaXRhYmxlXScsICdbdXNlbWFwXSdcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb3B5IHRvIENsaXBib2FyZCBIZWxwZXJcbiAqL1xuY2xhc3MgQ29weSB7XG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnNlbGVjdG9yID0gQ29weS5zZWxlY3RvcjtcblxuICAgIHRoaXMuYXJpYSA9IENvcHkuYXJpYTtcblxuICAgIHRoaXMubm90aWZ5VGltZW91dCA9IENvcHkubm90aWZ5VGltZW91dDtcblxuICAgIC8vIFNlbGVjdCB0aGUgZW50aXJlIHRleHQgd2hlbiBpdCdzIGZvY3VzZWQgb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKENvcHkuc2VsZWN0b3JzLlRBUkdFVFMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gdGhpcy5zZWxlY3QoaXRlbSkpO1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2VsZWN0KGl0ZW0pKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBtYWluIGNsaWNrIGV2ZW50IGZvciB0aGUgY2xhc3NcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmFyaWEsIGZhbHNlKTtcblxuICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmVsZW1lbnQuZGF0YXNldC5jb3B5O1xuXG4gICAgICBpZiAodGhpcy5jb3B5KHRoaXMudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMuYXJpYSwgdHJ1ZSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZWxlbWVudFsndGltZW91dCddKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRbJ3RpbWVvdXQnXSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5hcmlhLCBmYWxzZSk7XG4gICAgICAgIH0sIHRoaXMubm90aWZ5VGltZW91dCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgdGFyZ2V0ICBDb250ZW50IG9mIHRhcmdldCBkYXRhIGF0dHJpYnV0ZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gICAgICAgICBXZXRoZXIgY29weSB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICovXG4gIGNvcHkodGFyZ2V0KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gQ29weS5zZWxlY3RvcnMuVEFSR0VUUy5yZXBsYWNlKCddJywgYD1cIiR7dGFyZ2V0fVwiXWApO1xuXG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICB0aGlzLnNlbGVjdChpbnB1dCk7XG5cbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dClcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGlucHV0LnZhbHVlKTtcbiAgICBlbHNlIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZClcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgdGhlIHRleHQgc2VsZWN0aW9uIG1ldGhvZFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgaW5wdXQgIFRoZSBpbnB1dCB3aXRoIGNvbnRlbnQgdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3QoaW5wdXQpIHtcbiAgICBpbnB1dC5zZWxlY3QoKTtcblxuICAgIGlucHV0LnNldFNlbGVjdGlvblJhbmdlKDAsIDk5OTk5KTtcbiAgfVxufVxuXG4vKiogVGhlIG1haW4gZWxlbWVudCBzZWxlY3RvciAqL1xuQ29weS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJjb3B5XCJdJztcblxuLyoqIENsYXNzIHNlbGVjdG9ycyAqL1xuQ29weS5zZWxlY3RvcnMgPSB7XG4gIFRBUkdFVFM6ICdbZGF0YS1jb3B5LXRhcmdldF0nXG59O1xuXG4vKiogQnV0dG9uIGFyaWEgcm9sZSB0byB0b2dnbGUgKi9cbkNvcHkuYXJpYSA9ICdhcmlhLXByZXNzZWQnO1xuXG4vKiogVGltZW91dCBmb3IgdGhlIFwiQ29waWVkIVwiIG5vdGlmaWNhdGlvbiAqL1xuQ29weS5ub3RpZnlUaW1lb3V0ID0gMTUwMDtcblxuZXhwb3J0IGRlZmF1bHQgQ29weTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnc3ZnL2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIFJlbW92ZSBkeW5hbWljIGF0dHJpYnV0ZXMgZnJvbSB0aGUgaW5wdXRcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSk7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcbiAgICBsZXQgaWQgPSBgJHtlbC5nZXRBdHRyaWJ1dGUoJ2lkJyl9LSR7dGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0V9YDtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gQWRkIGR5bmFtaWMgYXR0cmlidXRlcyB0byB0aGUgaW5wdXRcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSwgdGhpcy5hdHRycy5FUlJPUl9JTlBVVFsxXSk7XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwsIGlkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYWlyeSBvZiBzdHJpbmdzIGluIHRoZSBmb3JtYXQuXG4gKiB7XG4gKiAgICdWQUxJRF9SRVFVSVJFRCc6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAqICAgJ1ZBTElEX3t7IFRZUEUgfX1fSU5WQUxJRCc6ICdJbnZhbGlkJ1xuICogfVxuICovXG5Gb3Jtcy5zdHJpbmdzID0ge307XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIHN1Ym1pdCBmdW5jdGlvbiAqL1xuRm9ybXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqIENsYXNzZXMgZm9yIHZhcmlvdXMgY29udGFpbmVycyAqL1xuRm9ybXMuY2xhc3NlcyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZXJyb3ItbWVzc2FnZScsIC8vIGVycm9yIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZVxuICAnRVJST1JfQ09OVEFJTkVSJzogJ2Vycm9yJywgLy8gY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlIHBhcmVudFxuICAnRVJST1JfRk9STSc6ICdlcnJvcidcbn07XG5cbi8qKiBIVE1MIHRhZ3MgYW5kIG1hcmt1cCBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMubWFya3VwID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdkaXYnLFxufTtcblxuLyoqIERPTSBTZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLnNlbGVjdG9ycyA9IHtcbiAgJ1JFUVVJUkVEJzogJ1tyZXF1aXJlZD1cInRydWVcIl0nLCAvLyBTZWxlY3RvciBmb3IgcmVxdWlyZWQgaW5wdXQgZWxlbWVudHNcbiAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogZmFsc2Vcbn07XG5cbi8qKiBBdHRyaWJ1dGVzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5hdHRycyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiBbJ2FyaWEtbGl2ZScsICdwb2xpdGUnXSwgLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG4gICdFUlJPUl9JTlBVVCc6IFsnYXJpYS1pbnZhbGlkJywgJ3RydWUnXSxcbiAgJ0VSUk9SX0xBQkVMJzogJ2FyaWEtZGVzY3JpYmVkYnknXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsInZhciBlPS9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaSx0PS9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGtleWdlbikvaSxuPS8oXFxbW15cXFtcXF1dKlxcXSkvZztmdW5jdGlvbiBhKGUsdCxhKXtpZih0Lm1hdGNoKG4pKSFmdW5jdGlvbiBlKHQsbixhKXtpZigwPT09bi5sZW5ndGgpcmV0dXJuIGE7dmFyIHI9bi5zaGlmdCgpLGk9ci5tYXRjaCgvXlxcWyguKz8pXFxdJC8pO2lmKFwiW11cIj09PXIpcmV0dXJuIHQ9dHx8W10sQXJyYXkuaXNBcnJheSh0KT90LnB1c2goZShudWxsLG4sYSkpOih0Ll92YWx1ZXM9dC5fdmFsdWVzfHxbXSx0Ll92YWx1ZXMucHVzaChlKG51bGwsbixhKSkpLHQ7aWYoaSl7dmFyIGw9aVsxXSx1PStsO2lzTmFOKHUpPyh0PXR8fHt9KVtsXT1lKHRbbF0sbixhKToodD10fHxbXSlbdV09ZSh0W3VdLG4sYSl9ZWxzZSB0W3JdPWUodFtyXSxuLGEpO3JldHVybiB0fShlLGZ1bmN0aW9uKGUpe3ZhciB0PVtdLGE9bmV3IFJlZ0V4cChuKSxyPS9eKFteXFxbXFxdXSopLy5leGVjKGUpO2ZvcihyWzFdJiZ0LnB1c2goclsxXSk7bnVsbCE9PShyPWEuZXhlYyhlKSk7KXQucHVzaChyWzFdKTtyZXR1cm4gdH0odCksYSk7ZWxzZXt2YXIgcj1lW3RdO3I/KEFycmF5LmlzQXJyYXkocil8fChlW3RdPVtyXSksZVt0XS5wdXNoKGEpKTplW3RdPWF9cmV0dXJuIGV9ZnVuY3Rpb24gcihlLHQsbil7cmV0dXJuIG49KG49U3RyaW5nKG4pKS5yZXBsYWNlKC8oXFxyKT9cXG4vZyxcIlxcclxcblwiKSxuPShuPWVuY29kZVVSSUNvbXBvbmVudChuKSkucmVwbGFjZSgvJTIwL2csXCIrXCIpLGUrKGU/XCImXCI6XCJcIikrZW5jb2RlVVJJQ29tcG9uZW50KHQpK1wiPVwiK259ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obixpKXtcIm9iamVjdFwiIT10eXBlb2YgaT9pPXtoYXNoOiEhaX06dm9pZCAwPT09aS5oYXNoJiYoaS5oYXNoPSEwKTtmb3IodmFyIGw9aS5oYXNoP3t9OlwiXCIsdT1pLnNlcmlhbGl6ZXJ8fChpLmhhc2g/YTpyKSxzPW4mJm4uZWxlbWVudHM/bi5lbGVtZW50czpbXSxjPU9iamVjdC5jcmVhdGUobnVsbCksbz0wO288cy5sZW5ndGg7KytvKXt2YXIgaD1zW29dO2lmKChpLmRpc2FibGVkfHwhaC5kaXNhYmxlZCkmJmgubmFtZSYmdC50ZXN0KGgubm9kZU5hbWUpJiYhZS50ZXN0KGgudHlwZSkpe3ZhciBwPWgubmFtZSxmPWgudmFsdWU7aWYoXCJjaGVja2JveFwiIT09aC50eXBlJiZcInJhZGlvXCIhPT1oLnR5cGV8fGguY2hlY2tlZHx8KGY9dm9pZCAwKSxpLmVtcHR5KXtpZihcImNoZWNrYm94XCIhPT1oLnR5cGV8fGguY2hlY2tlZHx8KGY9ITEpLFwicmFkaW9cIj09PWgudHlwZSYmKGNbaC5uYW1lXXx8aC5jaGVja2VkP2guY2hlY2tlZCYmKGNbaC5uYW1lXT0hMCk6Y1toLm5hbWVdPSExKSxudWxsPT1mJiZcInJhZGlvXCI9PWgudHlwZSljb250aW51ZX1lbHNlIGlmKCFmKWNvbnRpbnVlO2lmKFwic2VsZWN0LW11bHRpcGxlXCIhPT1oLnR5cGUpbD11KGwscCxmKTtlbHNle2Y9W107Zm9yKHZhciB2PWgub3B0aW9ucyxtPSExLGQ9MDtkPHYubGVuZ3RoOysrZCl7dmFyIHk9dltkXTt5LnNlbGVjdGVkJiYoeS52YWx1ZXx8aS5lbXB0eSYmIXkudmFsdWUpJiYobT0hMCxsPWkuaGFzaCYmXCJbXVwiIT09cC5zbGljZShwLmxlbmd0aC0yKT91KGwscCtcIltdXCIseS52YWx1ZSk6dShsLHAseS52YWx1ZSkpfSFtJiZpLmVtcHR5JiYobD11KGwscCxcIlwiKSl9fX1pZihpLmVtcHR5KWZvcih2YXIgcCBpbiBjKWNbcF18fChsPXUobCxwLFwiXCIpKTtyZXR1cm4gbH1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcyc7XG5cbmltcG9ydCBzZXJpYWxpemUgZnJvbSAnZm9yLWNlcmlhbCc7XG5cbi8qKlxuICogQGNsYXNzICBUaGUgTmV3c2xldHRlciBtb2R1bGVcbiAqL1xuY2xhc3MgTmV3c2xldHRlciB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVsZW1lbnQgIFRoZSBOZXdzbGV0dGVyIERPTSBPYmplY3RcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgTmV3c2xldHRlciBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB0aGlzLl9lbCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLmtleXMgPSBOZXdzbGV0dGVyLmtleXM7XG5cbiAgICB0aGlzLmVuZHBvaW50cyA9IE5ld3NsZXR0ZXIuZW5kcG9pbnRzO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBOZXdzbGV0dGVyLnNlbGVjdG9ycztcblxuICAgIHRoaXMuc2VsZWN0b3IgPSBOZXdzbGV0dGVyLnNlbGVjdG9yO1xuXG4gICAgdGhpcy5zdHJpbmdLZXlzID0gTmV3c2xldHRlci5zdHJpbmdLZXlzO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gTmV3c2xldHRlci5zdHJpbmdzO1xuXG4gICAgdGhpcy50ZW1wbGF0ZXMgPSBOZXdzbGV0dGVyLnRlbXBsYXRlcztcblxuICAgIHRoaXMuY2xhc3NlcyA9IE5ld3NsZXR0ZXIuY2xhc3NlcztcblxuICAgIHRoaXMuY2FsbGJhY2sgPSBbXG4gICAgICBOZXdzbGV0dGVyLmNhbGxiYWNrLFxuICAgICAgTWF0aC5yYW5kb20oKS50b1N0cmluZygpLnJlcGxhY2UoJzAuJywgJycpXG4gICAgXS5qb2luKCcnKTtcblxuICAgIC8vIFRoaXMgc2V0cyB0aGUgc2NyaXB0IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGEgZ2xvYmFsIGZ1bmN0aW9uIHRoYXRcbiAgICAvLyBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIHRoZSByZXF1ZXN0ZWQgc2NyaXB0LlxuICAgIHdpbmRvd1t0aGlzLmNhbGxiYWNrXSA9IChkYXRhKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFjayhkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5mb3JtID0gbmV3IEZvcm1zKHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKSk7XG5cbiAgICB0aGlzLmZvcm0uc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIHRoaXMuZm9ybS5zdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRoaXMuX3N1Ym1pdChldmVudClcbiAgICAgICAgLnRoZW4odGhpcy5fb25sb2FkKVxuICAgICAgICAuY2F0Y2godGhpcy5fb25lcnJvcik7XG4gICAgfTtcblxuICAgIHRoaXMuZm9ybS53YXRjaCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGZvcm0gc3VibWlzc2lvbiBtZXRob2QuIFJlcXVlc3RzIGEgc2NyaXB0IHdpdGggYSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiB0byBiZSBleGVjdXRlZCBvbiBvdXIgcGFnZS4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRoZVxuICAgKiByZXNwb25zZSBhcyBhIEpTT04gb2JqZWN0IChmdW5jdGlvbiBwYXJhbWV0ZXIpLlxuICAgKlxuICAgKiBAcGFyYW0gICB7RXZlbnR9ICAgIGV2ZW50ICBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtQcm9taXNlfSAgICAgICAgIEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBuZXcgc2NyaXB0IGNhbGxcbiAgICovXG4gIF9zdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gU2VyaWFsaXplIHRoZSBkYXRhXG4gICAgdGhpcy5fZGF0YSA9IHNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtoYXNoOiB0cnVlfSk7XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGFjdGlvbiB0byBwb3N0LWpzb24uIFRoaXMgY3JlYXRlcyBhbiBlbmRwb2ludCBmb3IgbWFpbGNoaW1wXG4gICAgLy8gdGhhdCBhY3RzIGFzIGEgc2NyaXB0IHRoYXQgY2FuIGJlIGxvYWRlZCBvbnRvIG91ciBwYWdlLlxuICAgIGxldCBhY3Rpb24gPSBldmVudC50YXJnZXQuYWN0aW9uLnJlcGxhY2UoXG4gICAgICBgJHt0aGlzLmVuZHBvaW50cy5NQUlOfT9gLCBgJHt0aGlzLmVuZHBvaW50cy5NQUlOX0pTT059P2BcbiAgICApO1xuXG4gICAgLy8gQWRkIG91ciBwYXJhbXMgdG8gdGhlIGFjdGlvblxuICAgIGFjdGlvbiA9IGFjdGlvbiArIHNlcmlhbGl6ZShldmVudC50YXJnZXQsIHtzZXJpYWxpemVyOiAoLi4ucGFyYW1zKSA9PiB7XG4gICAgICBsZXQgcHJldiA9ICh0eXBlb2YgcGFyYW1zWzBdID09PSAnc3RyaW5nJykgPyBwYXJhbXNbMF0gOiAnJztcblxuICAgICAgcmV0dXJuIGAke3ByZXZ9JiR7cGFyYW1zWzFdfT0ke3BhcmFtc1syXX1gO1xuICAgIH19KTtcblxuICAgIC8vIEFwcGVuZCB0aGUgY2FsbGJhY2sgcmVmZXJlbmNlLiBNYWlsY2hpbXAgd2lsbCB3cmFwIHRoZSBKU09OIHJlc3BvbnNlIGluXG4gICAgLy8gb3VyIGNhbGxiYWNrIG1ldGhvZC4gT25jZSB3ZSBsb2FkIHRoZSBzY3JpcHQgdGhlIGNhbGxiYWNrIHdpbGwgZXhlY3V0ZS5cbiAgICBhY3Rpb24gPSBgJHthY3Rpb259JmM9d2luZG93LiR7dGhpcy5jYWxsYmFja31gO1xuXG4gICAgLy8gQ3JlYXRlIGEgcHJvbWlzZSB0aGF0IGFwcGVuZHMgdGhlIHNjcmlwdCByZXNwb25zZSBvZiB0aGUgcG9zdC1qc29uIG1ldGhvZFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgc2NyaXB0Lm9ubG9hZCA9IHJlc29sdmU7XG4gICAgICBzY3JpcHQub25lcnJvciA9IHJlamVjdDtcbiAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICBzY3JpcHQuc3JjID0gZW5jb2RlVVJJKGFjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjcmlwdCBvbmxvYWQgcmVzb2x1dGlvblxuICAgKlxuICAgKiBAcGFyYW0gICB7RXZlbnR9ICBldmVudCAgVGhlIHNjcmlwdCBvbiBsb2FkIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtDbGFzc30gICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29ubG9hZChldmVudCkge1xuICAgIGV2ZW50LnBhdGhbMF0ucmVtb3ZlKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2NyaXB0IG9uIGVycm9yIHJlc29sdXRpb25cbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVycm9yICBUaGUgc2NyaXB0IG9uIGVycm9yIGxvYWQgZXZlbnRcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX29uZXJyb3IoZXJyb3IpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLmRpcihlcnJvcik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBNYWlsQ2hpbXAgU2NyaXB0IGNhbGxcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGRhdGEgIFRoZSBzdWNjZXNzL2Vycm9yIG1lc3NhZ2UgZnJvbSBNYWlsQ2hpbXBcbiAgICpcbiAgICogQHJldHVybiAge0NsYXNzfSAgICAgICAgVGhlIE5ld3NsZXR0ZXIgY2xhc3NcbiAgICovXG4gIF9jYWxsYmFjayhkYXRhKSB7XG4gICAgaWYgKHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0pIHtcbiAgICAgIHRoaXNbYF8ke2RhdGFbdGhpcy5fa2V5KCdNQ19SRVNVTFQnKV19YF0oZGF0YS5tc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZGlyKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pc3Npb24gZXJyb3IgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgbXNnICBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX2Vycm9yKG1zZykge1xuICAgIHRoaXMuX2VsZW1lbnRzUmVzZXQoKTtcbiAgICB0aGlzLl9tZXNzYWdpbmcoJ1dBUk5JTkcnLCBtc2cpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3VibWlzc2lvbiBzdWNjZXNzIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICAge3N0cmluZ30gIG1zZyAgVGhlIHN1Y2Nlc3MgbWVzc2FnZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICAgICAgICBUaGUgTmV3c2xldHRlciBjbGFzc1xuICAgKi9cbiAgX3N1Y2Nlc3MobXNnKSB7XG4gICAgdGhpcy5fZWxlbWVudHNSZXNldCgpO1xuICAgIHRoaXMuX21lc3NhZ2luZygnU1VDQ0VTUycsIG1zZyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVzZW50IHRoZSByZXNwb25zZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG4gICAqXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICB0eXBlICBUaGUgbWVzc2FnZSB0eXBlXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBtc2cgICBUaGUgbWVzc2FnZVxuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX21lc3NhZ2luZyh0eXBlLCBtc2cgPSAnbm8gbWVzc2FnZScpIHtcbiAgICBsZXQgc3RyaW5ncyA9IE9iamVjdC5rZXlzKHRoaXMuc3RyaW5nS2V5cyk7XG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgIGxldCBhbGVydEJveCA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnNbdHlwZV0pO1xuXG4gICAgbGV0IGFsZXJ0Qm94TXNnID0gYWxlcnRCb3gucXVlcnlTZWxlY3RvcihcbiAgICAgIHRoaXMuc2VsZWN0b3JzLkFMRVJUX1RFWFRcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBsb2NhbGl6ZWQgc3RyaW5nLCB0aGVzZSBzaG91bGQgYmUgd3JpdHRlbiB0byB0aGUgRE9NIGFscmVhZHkuXG4gICAgLy8gVGhlIHV0aWxpdHkgY29udGFpbnMgYSBnbG9iYWwgbWV0aG9kIGZvciByZXRyaWV2aW5nIHRoZW0uXG4gICAgbGV0IHN0cmluZ0tleXMgPSBzdHJpbmdzLmZpbHRlcihzID0+IG1zZy5pbmNsdWRlcyh0aGlzLnN0cmluZ0tleXNbc10pKTtcbiAgICBtc2cgPSAoc3RyaW5nS2V5cy5sZW5ndGgpID8gdGhpcy5zdHJpbmdzW3N0cmluZ0tleXNbMF1dIDogbXNnO1xuICAgIGhhbmRsZWQgPSAoc3RyaW5nS2V5cy5sZW5ndGgpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgLy8gUmVwbGFjZSBzdHJpbmcgdGVtcGxhdGVzIHdpdGggdmFsdWVzIGZyb20gZWl0aGVyIG91ciBmb3JtIGRhdGEgb3JcbiAgICAvLyB0aGUgTmV3c2xldHRlciBzdHJpbmdzIG9iamVjdC5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMudGVtcGxhdGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlc1t4XTtcbiAgICAgIGxldCBrZXkgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7eyAnLCAnJykucmVwbGFjZSgnIH19JywgJycpO1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5fZGF0YVtrZXldIHx8IHRoaXMuc3RyaW5nc1trZXldO1xuICAgICAgbGV0IHJlZyA9IG5ldyBSZWdFeHAodGVtcGxhdGUsICdnaScpO1xuXG4gICAgICBtc2cgPSBtc2cucmVwbGFjZShyZWcsICh2YWx1ZSkgPyB2YWx1ZSA6ICcnKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gbXNnO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VSUk9SJykge1xuICAgICAgYWxlcnRCb3hNc2cuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLkVSUl9QTEVBU0VfVFJZX0xBVEVSO1xuICAgIH1cblxuICAgIGlmIChhbGVydEJveCkgdGhpcy5fZWxlbWVudFNob3coYWxlcnRCb3gsIGFsZXJ0Qm94TXNnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZFxuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICBOZXdzbGV0dGVyXG4gICAqL1xuICBfZWxlbWVudHNSZXNldCgpIHtcbiAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuX2VsLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuQUxFUlRTKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKylcbiAgICAgIGlmICghdGFyZ2V0c1tpXS5jbGFzc0xpc3QuY29udGFpbnModGhpcy5jbGFzc2VzLkhJRERFTikpIHtcbiAgICAgICAgdGFyZ2V0c1tpXS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5ISURERU4pO1xuXG4gICAgICAgIHRoaXMuY2xhc3Nlcy5BTklNQVRFLnNwbGl0KCcgJykuZm9yRWFjaCgoaXRlbSkgPT5cbiAgICAgICAgICB0YXJnZXRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoaXRlbSlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBTY3JlZW4gUmVhZGVyc1xuICAgICAgICB0YXJnZXRzW2ldLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB0YXJnZXRzW2ldLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcnMuQUxFUlRfVEVYVClcbiAgICAgICAgICAuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnb2ZmJyk7XG4gICAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2RcbiAgICpcbiAgICogQHBhcmFtICAge29iamVjdH0gIHRhcmdldCAgIE1lc3NhZ2UgY29udGFpbmVyXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBjb250ZW50ICBDb250ZW50IHRoYXQgY2hhbmdlcyBkeW5hbWljYWxseSB0aGF0IHNob3VsZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgYW5ub3VuY2VkIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgKlxuICAgKiBAcmV0dXJuICB7Q2xhc3N9ICAgICAgICAgICAgTmV3c2xldHRlclxuICAgKi9cbiAgX2VsZW1lbnRTaG93KHRhcmdldCwgY29udGVudCkge1xuICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuY2xhc3Nlcy5ISURERU4pO1xuXG4gICAgdGhpcy5jbGFzc2VzLkFOSU1BVEUuc3BsaXQoJyAnKS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoaXRlbSlcbiAgICApO1xuXG4gICAgLy8gU2NyZWVuIFJlYWRlcnNcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICBpZiAoY29udGVudCkge1xuICAgICAgY29udGVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBwcm9wZXIga2V5XG4gICAqXG4gICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBrZXkgIFRoZSByZWZlcmVuY2UgZm9yIHRoZSBzdG9yZWQga2V5cy5cbiAgICpcbiAgICogQHJldHVybiAge3N0cmluZ30gICAgICAgVGhlIGRlc2lyZWQga2V5LlxuICAgKi9cbiAgX2tleShrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5rZXlzW2tleV07XG4gIH1cbn1cblxuLyoqIEB0eXBlICB7T2JqZWN0fSAgQVBJIGRhdGEga2V5cyAqL1xuTmV3c2xldHRlci5rZXlzID0ge1xuICBNQ19SRVNVTFQ6ICdyZXN1bHQnLFxuICBNQ19NU0c6ICdtc2cnXG59O1xuXG4vKiogQHR5cGUgIHtPYmplY3R9ICBBUEkgZW5kcG9pbnRzICovXG5OZXdzbGV0dGVyLmVuZHBvaW50cyA9IHtcbiAgTUFJTjogJy9wb3N0JyxcbiAgTUFJTl9KU09OOiAnL3Bvc3QtanNvbidcbn07XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBNYWlsY2hpbXAgY2FsbGJhY2sgcmVmZXJlbmNlLiAqL1xuTmV3c2xldHRlci5jYWxsYmFjayA9ICdOZXdzbGV0dGVyQ2FsbGJhY2snO1xuXG4vKiogQHR5cGUgIHtPYmplY3R9ICBET00gc2VsZWN0b3JzIGZvciB0aGUgaW5zdGFuY2UncyBjb25jZXJucyAqL1xuTmV3c2xldHRlci5zZWxlY3RvcnMgPSB7XG4gIEVMRU1FTlQ6ICdbZGF0YS1qcz1cIm5ld3NsZXR0ZXJcIl0nLFxuICBBTEVSVFM6ICdbZGF0YS1qcyo9XCJhbGVydFwiXScsXG4gIFdBUk5JTkc6ICdbZGF0YS1qcz1cImFsZXJ0LXdhcm5pbmdcIl0nLFxuICBTVUNDRVNTOiAnW2RhdGEtanM9XCJhbGVydC1zdWNjZXNzXCJdJyxcbiAgQUxFUlRfVEVYVDogJ1tkYXRhLWpzLWFsZXJ0PVwidGV4dFwiXSdcbn07XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBtYWluIERPTSBzZWxlY3RvciBmb3IgdGhlIGluc3RhbmNlICovXG5OZXdzbGV0dGVyLnNlbGVjdG9yID0gTmV3c2xldHRlci5zZWxlY3RvcnMuRUxFTUVOVDtcblxuLyoqIEB0eXBlICB7T2JqZWN0fSAgU3RyaW5nIHJlZmVyZW5jZXMgZm9yIHRoZSBpbnN0YW5jZSAqL1xuTmV3c2xldHRlci5zdHJpbmdLZXlzID0ge1xuICBTVUNDRVNTX0NPTkZJUk1fRU1BSUw6ICdBbG1vc3QgZmluaXNoZWQuLi4nLFxuICBFUlJfUExFQVNFX0VOVEVSX1ZBTFVFOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUnLFxuICBFUlJfVE9PX01BTllfUkVDRU5UOiAndG9vIG1hbnknLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAnaXMgYWxyZWFkeSBzdWJzY3JpYmVkJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdsb29rcyBmYWtlIG9yIGludmFsaWQnXG59O1xuXG4vKiogQHR5cGUgIHtPYmplY3R9ICBBdmFpbGFibGUgc3RyaW5ncyAqL1xuTmV3c2xldHRlci5zdHJpbmdzID0ge1xuICBWQUxJRF9SRVFVSVJFRDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQuJyxcbiAgVkFMSURfRU1BSUxfUkVRVUlSRUQ6ICdFbWFpbCBpcyByZXF1aXJlZC4nLFxuICBWQUxJRF9FTUFJTF9JTlZBTElEOiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuJyxcbiAgVkFMSURfQ0hFQ0tCT1hfQk9ST1VHSDogJ1BsZWFzZSBzZWxlY3QgYSBib3JvdWdoLicsXG4gIEVSUl9QTEVBU0VfVFJZX0xBVEVSOiAnVGhlcmUgd2FzIGFuIGVycm9yIHdpdGggeW91ciBzdWJtaXNzaW9uLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsXG4gIFNVQ0NFU1NfQ09ORklSTV9FTUFJTDogJ0FsbW9zdCBmaW5pc2hlZC4uLiBXZSBuZWVkIHRvIGNvbmZpcm0geW91ciBlbWFpbCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkcmVzcy4gVG8gY29tcGxldGUgdGhlIHN1YnNjcmlwdGlvbiBwcm9jZXNzLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAncGxlYXNlIGNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB3ZSBqdXN0IHNlbnQgeW91LicsXG4gIEVSUl9QTEVBU0VfRU5URVJfVkFMVUU6ICdQbGVhc2UgZW50ZXIgYSB2YWx1ZScsXG4gIEVSUl9UT09fTUFOWV9SRUNFTlQ6ICdSZWNpcGllbnQgXCJ7eyBFTUFJTCB9fVwiIGhhcyB0b28gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnLFxuICBFUlJfQUxSRUFEWV9TVUJTQ1JJQkVEOiAne3sgRU1BSUwgfX0gaXMgYWxyZWFkeSBzdWJzY3JpYmVkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAndG8gbGlzdCB7eyBMSVNUX05BTUUgfX0uJyxcbiAgRVJSX0lOVkFMSURfRU1BSUw6ICdUaGlzIGVtYWlsIGFkZHJlc3MgbG9va3MgZmFrZSBvciBpbnZhbGlkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgZW50ZXIgYSByZWFsIGVtYWlsIGFkZHJlc3MuJyxcbiAgTElTVF9OQU1FOiAnTmV3c2xldHRlcidcbn07XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgUGxhY2Vob2xkZXJzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBpbiBtZXNzYWdlIHN0cmluZ3MgKi9cbk5ld3NsZXR0ZXIudGVtcGxhdGVzID0gW1xuICAne3sgRU1BSUwgfX0nLFxuICAne3sgTElTVF9OQU1FIH19J1xuXTtcblxuTmV3c2xldHRlci5jbGFzc2VzID0ge1xuICBBTklNQVRFOiAnYW5pbWF0ZWQgZmFkZUluVXAnLFxuICBISURERU46ICdoaWRkZW4nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdzbGV0dGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNraW5nIGJ1cyBmb3IgR29vZ2xlIGFuYWx5dGljcyBhbmQgV2VidHJlbmRzLlxuICovXG5jbGFzcyBUcmFjayB7XG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVHJhY2suc2VsZWN0b3IsXG4gICAgfTtcblxuICAgIHRoaXMuZGVzaW5hdGlvbnMgPSBUcmFjay5kZXN0aW5hdGlvbnM7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBsZXQga2V5ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tLZXk7XG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tEYXRhKTtcblxuICAgICAgdGhpcy50cmFjayhrZXksIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gd3JhcHBlclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBmaW5hbCBkYXRhIG9iamVjdFxuICAgKi9cbiAgdHJhY2soa2V5LCBkYXRhKSB7XG4gICAgLy8gU2V0IHRoZSBwYXRoIG5hbWUgYmFzZWQgb24gdGhlIGxvY2F0aW9uXG4gICAgY29uc3QgZCA9IGRhdGEubWFwKGVsID0+IHtcbiAgICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICAgICAgZWxbVHJhY2sua2V5XSA9IGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtlbFtUcmFjay5rZXldfWBcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgfSk7XG5cbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGQpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZyhrZXksIGQpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbiAgICByZXR1cm4gZDtcbiAgfTtcblxuICAvKipcbiAgICogRGF0YSBidXMgZm9yIHRyYWNraW5nIHZpZXdzIGluIFdlYnRyZW5kcyBhbmQgR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgYXBwICAgVGhlIG5hbWUgb2YgdGhlIFNpbmdsZSBQYWdlIEFwcGxpY2F0aW9uIHRvIHRyYWNrXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgdmlldyhhcHAsIGtleSwgZGF0YSkge1xuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZGF0YSk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnVmlldyhhcHAsIGtleSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBFdmVudHMgdG8gV2VidHJlbmRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgd2VidHJlbmRzKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBXZWJ0cmVuZHMgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCd3ZWJ0cmVuZHMnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCBldmVudCA9IFt7XG4gICAgICAnV1QudGknOiBrZXlcbiAgICB9XTtcblxuICAgIGlmIChkYXRhWzBdICYmIGRhdGFbMF0uaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSlcbiAgICAgIGV2ZW50LnB1c2goe1xuICAgICAgICAnRENTLmRjc3VyaSc6IGRhdGFbMF1bVHJhY2sua2V5XVxuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgT2JqZWN0LmFzc2lnbihldmVudCwgZGF0YSk7XG5cbiAgICAvLyBGb3JtYXQgZGF0YSBmb3IgV2VidHJlbmRzXG4gICAgbGV0IHd0ZCA9IHthcmdzYTogZXZlbnQuZmxhdE1hcChlID0+IHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhlKS5mbGF0TWFwKGsgPT4gW2ssIGVba11dKTtcbiAgICB9KX07XG5cbiAgICAvLyBJZiAnYWN0aW9uJyBpcyB1c2VkIGFzIHRoZSBrZXkgKGZvciBndGFnLmpzKSwgc3dpdGNoIGl0IHRvIFdlYnRyZW5kc1xuICAgIGxldCBhY3Rpb24gPSBkYXRhLmFyZ3NhLmluZGV4T2YoJ2FjdGlvbicpO1xuXG4gICAgaWYgKGFjdGlvbikgZGF0YS5hcmdzYVthY3Rpb25dID0gJ0RDUy5kY3N1cmknO1xuXG4gICAgLy8gV2VidHJlbmRzIGRvZXNuJ3Qgc2VuZCB0aGUgcGFnZSB2aWV3IGZvciBNdWx0aVRyYWNrLCBhZGQgcGF0aCB0byB1cmxcbiAgICBsZXQgZGNzdXJpID0gZGF0YS5hcmdzYS5pbmRleE9mKCdEQ1MuZGNzdXJpJyk7XG5cbiAgICBpZiAoZGNzdXJpKVxuICAgICAgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIGRhdGEuYXJnc2FbZGNzdXJpICsgMV07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGlmICh0eXBlb2YgV2VidHJlbmRzICE9PSAndW5kZWZpbmVkJylcbiAgICAgIFdlYnRyZW5kcy5tdWx0aVRyYWNrKHd0ZCk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ1dlYnRyZW5kcycsIHd0ZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggQ2xpY2sgRXZlbnRzIHRvIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICBndGFnKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBndGFnID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnZ3RhZycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHVyaSA9IGRhdGEuZmluZCgoZWxlbWVudCkgPT4gZWxlbWVudC5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKTtcblxuICAgIGxldCBldmVudCA9IHtcbiAgICAgICdldmVudF9jYXRlZ29yeSc6IGtleVxuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGd0YWcoVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnQpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksIHVyaVtUcmFjay5rZXldLCBldmVudF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggU2NyZWVuIFZpZXcgRXZlbnRzIHRvIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgYXBwICBUaGUgbmFtZSBvZiB0aGUgYXBwbGljYXRpb25cbiAgICogQHBhcmFtICB7U3RyaW5nfSAga2V5ICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqL1xuICBndGFnVmlldyhhcHAsIGtleSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBndGFnID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnZ3RhZycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHZpZXcgPSB7XG4gICAgICBhcHBfbmFtZTogYXBwLFxuICAgICAgc2NyZWVuX25hbWU6IGtleVxuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGd0YWcoJ2V2ZW50JywgJ3NjcmVlbl92aWV3Jywgdmlldyk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnZ3RhZycsIFRyYWNrLmtleSwgJ3NjcmVlbl92aWV3Jywgdmlld107XG4gIH07XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRyYWNraW5nIGZ1bmN0aW9uIHRvICovXG5UcmFjay5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0cmFja1wiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBldmVudCB0cmFja2luZyBrZXkgdG8gbWFwIHRvIFdlYnRyZW5kcyBEQ1MudXJpICovXG5UcmFjay5rZXkgPSAnZXZlbnQnO1xuXG4vKiogQHR5cGUge0FycmF5fSBXaGF0IGRlc3RpbmF0aW9ucyB0byBwdXNoIGRhdGEgdG8gKi9cblRyYWNrLmRlc3RpbmF0aW9ucyA9IFtcbiAgJ3dlYnRyZW5kcycsXG4gICdndGFnJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhY2s7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVzZXMgdGhlIFNoYXJlIEFQSSB0byB0XG4gKi9cbmNsYXNzIFdlYlNoYXJlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IocyA9IHt9KSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBXZWJTaGFyZS5zZWxlY3RvcjtcblxuICAgIHRoaXMuY2FsbGJhY2sgPSAocy5jYWxsYmFjaykgPyBzLmNhbGxiYWNrIDogV2ViU2hhcmUuY2FsbGJhY2s7XG5cbiAgICB0aGlzLmZhbGxiYWNrID0gKHMuZmFsbGJhY2spID8gcy5mYWxsYmFjayA6IFdlYlNoYXJlLmZhbGxiYWNrO1xuXG4gICAgaWYgKG5hdmlnYXRvci5zaGFyZSkge1xuICAgICAgLy8gUmVtb3ZlIGZhbGxiYWNrIGFyaWEgdG9nZ2xpbmcgYXR0cmlidXRlc1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBpdGVtLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpO1xuICAgICAgICBpdGVtLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lciBmb3IgdGhlIHNoYXJlIGNsaWNrXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZWxlY3RvcikpXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgICB0aGlzLmRhdGEgPSBKU09OLnBhcnNlKHRoaXMuZWxlbWVudC5kYXRhc2V0LndlYlNoYXJlKTtcblxuICAgICAgICB0aGlzLnNoYXJlKHRoaXMuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2VcbiAgICAgIHRoaXMuZmFsbGJhY2soKTsgLy8gRXhlY3V0ZSB0aGUgZmFsbGJhY2tcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlYiBTaGFyZSBBUEkgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZGF0YSAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGl0bGUsIHVybCwgYW5kIHRleHQuXG4gICAqXG4gICAqIEByZXR1cm4gIHtQcm9taXNlfSAgICAgICBUaGUgcmVzcG9uc2Ugb2YgdGhlIC5zaGFyZSgpIG1ldGhvZC5cbiAgICovXG4gIHNoYXJlKGRhdGEgPSB7fSkge1xuICAgIHJldHVybiBuYXZpZ2F0b3Iuc2hhcmUoZGF0YSlcbiAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soZGF0YSk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICBjb25zb2xlLmRpcihlcnIpO1xuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqIFRoZSBodG1sIHNlbGVjdG9yIGZvciB0aGUgY29tcG9uZW50ICovXG5XZWJTaGFyZS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ3ZWItc2hhcmVcIl0nO1xuXG4vKiogUGxhY2Vob2xkZXIgY2FsbGJhY2sgZm9yIGEgc3VjY2Vzc2Z1bCBzZW5kICovXG5XZWJTaGFyZS5jYWxsYmFjayA9ICgpID0+IHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgY29uc29sZS5kaXIoJ1N1Y2Nlc3MhJyk7XG59O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBXZWJTaGFyZSBmYWxsYmFjayAqL1xuV2ViU2hhcmUuZmFsbGJhY2sgPSAoKSA9PiB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgIGNvbnNvbGUuZGlyKCdGYWxsYmFjayEnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViU2hhcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vKipcbiAqIFRoZSBBY2NvcmRpb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdG9nZ2xlID0gbmV3IFRvZ2dsZSh7XG4gICAgICBzZWxlY3RvcjogQWNjb3JkaW9uLnNlbGVjdG9yXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbkFjY29yZGlvbi5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJhY2NvcmRpb25cIl0nO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG5jbGFzcyBEcm9wZG93biB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgc2V0dGluZ3MgIFRoaXMgY291bGQgYmUgc29tZSBjb25maWd1cmF0aW9uXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLiBmb3IgdGhlIHBhdHRlcm4gbW9kdWxlLlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBkYXRhICAgICAgVGhpcyBjb3VsZCBiZSBhIHNldCBvZiBkYXRhIG5lZWRlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHRoZSBwYXR0ZXJuIG1vZHVsZSB0byByZW5kZXIuXG5cbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBpbnN0YW50aWF0ZWQgcGF0dGVyblxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBEcm9wZG93bi5zZWxlY3RvcixcbiAgICAgIGFmdGVyOiAoKSA9PiB7XG4gICAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgICAgIHdpbmRvdy5zY3JvbGwoMCwgMCk7XG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZShEcm9wZG93bi5jbGFzc2VzLk9WRVJGTE9XKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSAgU3RyaW5nICBNYWluIERPTSBzZWxlY3RvciAqL1xuRHJvcGRvd24uc2VsZWN0b3IgPSAnW2RhdGEtanMqPVxcXCJkcm9wZG93blxcXCJdJztcblxuLyoqIEB0eXBlICBPYmplY3QgIFZhcmlvdXMgY2xhc3NlcyB1c2VkIGJ5IHRoZSBzY3JpcHQgKi9cbkRyb3Bkb3duLmNsYXNzZXMgPSB7XG4gIE9WRVJGTE9XOiAnb3ZlcmZsb3ctaGlkZGVuJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRHJvcGRvd247XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3RvZ2dsZS90b2dnbGUnO1xuXG4vLyBpbXBvcnQgU2VhcmNoIGZyb20gJ3NyYy9vYmplY3RzL3NlYXJjaC9zZWFyY2gnO1xuXG4vKipcbiAqIFRoZSBNb2JpbGUgTmF2IG1vZHVsZVxuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBNb2JpbGVNZW51IHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcmV0dXJuICB7b2JqZWN0fSAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gTW9iaWxlTWVudS5zZWxlY3RvcjtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gTW9iaWxlTWVudS5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLnRvZ2dsZSA9IG5ldyBUb2dnbGUoe1xuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3IsXG4gICAgICBhZnRlcjogKHRvZ2dsZSkgPT4ge1xuICAgICAgICBpZiAodG9nZ2xlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoVG9nZ2xlLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgIHRvZ2dsZS50YXJnZXQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycy5DTE9TRSkuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzLk9QRU4pLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGUgKi9cbk1vYmlsZU1lbnUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwibW9iaWxlLW1lbnVcIl0nO1xuXG4vKiogQHR5cGUgIHtPYmplY3R9ICBBZGRpdGlvbmFsIHNlbGVjdG9ycyB1c2VkIGJ5IHRoZSBzY3JpcHQgKi9cbk1vYmlsZU1lbnUuc2VsZWN0b3JzID0ge1xuICBDTE9TRTogJ1tkYXRhLWpzLW1vYmlsZS1tZW51Kj1cImNsb3NlXCJdJyxcbiAgT1BFTjogJ1tkYXRhLWpzLW1vYmlsZS1tZW51Kj1cIm9wZW5cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBNb2JpbGVNZW51O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90b2dnbGUvdG9nZ2xlJztcblxuLyoqXG4gKiBUaGUgU2VhcmNoIG1vZHVsZVxuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTZWFyY2gge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90b2dnbGUgPSBuZXcgVG9nZ2xlKHtcbiAgICAgIHNlbGVjdG9yOiBTZWFyY2guc2VsZWN0b3IsXG4gICAgICBhZnRlcjogKHRvZ2dsZSkgPT4ge1xuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNlYXJjaC5zZWxlY3Rvcik7XG4gICAgICAgIGxldCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU2VhcmNoLnNlbGVjdG9ycy5pbnB1dCk7XG5cbiAgICAgICAgaWYgKGVsLmNsYXNzTmFtZS5pbmNsdWRlcygnYWN0aXZlJykgJiYgaW5wdXQpIHtcbiAgICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkb20gc2VsZWN0b3IgZm9yIHRoZSBtb2R1bGVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblNlYXJjaC5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJzZWFyY2hcIl0nO1xuXG5TZWFyY2guc2VsZWN0b3JzID0ge1xuICBpbnB1dDogJ1tkYXRhLWpzKj1cInNlYXJjaF9faW5wdXRcIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2g7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgQ29weSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvY29weS9jb3B5JztcbmltcG9ydCBJY29ucyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgTmV3c2xldHRlciBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvbmV3c2xldHRlci9uZXdzbGV0dGVyJztcbi8vIGltcG9ydCBUb29sdGlwcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcGF0dGVybnMtZnJhbWV3b3JrL3NyYy91dGlsaXRpZXMvdG9vbHRpcHMvdG9vbHRpcHMnO1xuaW1wb3J0IFRyYWNrIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wYXR0ZXJucy1mcmFtZXdvcmsvc3JjL3V0aWxpdGllcy90cmFjay90cmFjayc7XG5pbXBvcnQgV2ViU2hhcmUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3BhdHRlcm5zLWZyYW1ld29yay9zcmMvdXRpbGl0aWVzL3dlYi1zaGFyZS93ZWItc2hhcmUnO1xuXG4vLyBFbGVtZW50c1xuLy8gaW1wb3J0IC4uLiBmcm9tICcuLi9lbGVtZW50cy8uLi4nO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQWNjb3JkaW9uIGZyb20gJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgRHJvcGRvd24gZnJvbSAnLi4vY29tcG9uZW50cy9kcm9wZG93bi9kcm9wZG93bic7XG4vLyBpbXBvcnQgLi4uIGZyb20gJy4uL2NvbXBvbmVudHMvLi4uJztcblxuLy8gT2JqZWN0c1xuaW1wb3J0IE1vYmlsZU1lbnUgZnJvbSAnLi4vb2JqZWN0cy9tb2JpbGUtbWVudS9tb2JpbGUtbWVudSc7XG5pbXBvcnQgU2VhcmNoIGZyb20gJy4uL29iamVjdHMvc2VhcmNoL3NlYXJjaCc7XG4vLyBpbXBvcnQgLi4uIGZyb20gJy4uL29iamVjdHMvLi4uJztcbi8qKiBpbXBvcnQgbW9kdWxlcyBoZXJlIGFzIHRoZXkgYXJlIHdyaXR0ZW4uICovXG5cbi8qKlxuICogVGhlIE1haW4gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgbWFpbiB7XG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBJY29ucyBVdGlsaXR5XG4gICAqXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBwYXRoICBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICBJbnN0YW5jZSBvZiBJY29uc1xuICAgKi9cbiAgaWNvbnMocGF0aCA9ICdzdmcvaWNvbnMuc3ZnJykge1xuICAgIHJldHVybiBuZXcgSWNvbnMocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgVG9nZ2xlIFV0aWxpdHlcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIHNldHRpbmdzICBTZXR0aW5ncyBmb3IgdGhlIFRvZ2dsZSBDbGFzc1xuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgIEluc3RhbmNlIG9mIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlKHNldHRpbmdzID0gZmFsc2UpIHtcbiAgICByZXR1cm4gKHNldHRpbmdzKSA/IG5ldyBUb2dnbGUoc2V0dGluZ3MpIDogbmV3IFRvZ2dsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFQSSBmb3IgdmFsaWRhdGluZyBhIGZvcm0uXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gICAgc2VsZWN0b3JcbiAgICogQHBhcmFtICB7ZnVuY3Rpb259ICBzdWJtaXRcbiAgICovXG4gIHZhbGlkKHNlbGVjdG9yLCBzdWJtaXQgPSBmYWxzZSkge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgbGV0IGZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpO1xuXG4gICAgICBmb3JtLnN1Ym1pdCA9IChzdWJtaXQpID8gc3VibWl0IDogKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5zdWJtaXQoKTtcbiAgICAgIH07XG5cbiAgICAgIGZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJy5jLXF1ZXN0aW9uX19jb250YWluZXInO1xuXG4gICAgICBmb3JtLndhdGNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIEFjY29yZGlvbiBDb21wb25lbnRcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIEFjY29yZGlvblxuICAgKi9cbiAgYWNjb3JkaW9uKCkge1xuICAgIHJldHVybiBuZXcgQWNjb3JkaW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgRHJvcGRvd24gQ29tcG9uZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBEcm9wZG93blxuICAgKi9cbiAgZHJvcGRvd24oKSB7XG4gICAgcmV0dXJuIG5ldyBEcm9wZG93bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIENvcHkgVXRpbGl0eVxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgQ29weVxuICAgKi9cbiAgY29weSgpIHtcbiAgICByZXR1cm4gbmV3IENvcHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBUcmFjayBPYmplY3RcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFRyYWNrXG4gICAqL1xuICB0cmFjaygpIHtcbiAgICByZXR1cm4gbmV3IFRyYWNrKCk7XG4gIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgVG9vbHRpcHMgZWxlbWVudFxuICAvLyAgKiBAcGFyYW0gIHtPYmplY3R9ICAgc2V0dGluZ3MgU2V0dGluZ3MgZm9yIHRoZSBUb29sdGlwcyBDbGFzc1xuICAvLyAgKiBAcmV0dXJuIHtub2RlbGlzdH0gICAgICAgICAgVG9vbHRpcCBlbGVtZW50c1xuICAvLyAgKi9cbiAgLy8gdG9vbHRpcHMoZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFRvb2x0aXBzLnNlbGVjdG9yKSkge1xuICAvLyAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gIC8vICAgICBuZXcgVG9vbHRpcHMoZWxlbWVudCk7XG4gIC8vICAgfSk7XG5cbiAgLy8gICByZXR1cm4gKGVsZW1lbnRzLmxlbmd0aCkgPyBlbGVtZW50cyA6IG51bGw7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgRmlsdGVyIENvbXBvbmVudFxuICAvLyAgKiBAcmV0dXJuIHtPYmplY3R9IEluc3RhbmNlIG9mIEZpbHRlclxuICAvLyAgKi9cbiAgLy8gZmlsdGVyKCkge1xuICAvLyAgIHJldHVybiBuZXcgRmlsdGVyKCk7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgTmVhcmJ5IFN0b3BzIENvbXBvbmVudFxuICAvLyAgKiBAcmV0dXJuIHtPYmplY3R9IEluc3RhbmNlIG9mIE5lYXJieVN0b3BzXG4gIC8vICAqL1xuICAvLyBuZWFyYnlTdG9wcygpIHtcbiAgLy8gICByZXR1cm4gbmV3IE5lYXJieVN0b3BzKCk7XG4gIC8vIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIE5ld3NsZXR0ZXJcbiAgICovXG4gIG5ld3NsZXR0ZXIoZW5kcG9pbnQgPSAnJykge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihOZXdzbGV0dGVyLnNlbGVjdG9yKTtcblxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBsZXQgbmV3c2xldHRlciA9IG5ldyBOZXdzbGV0dGVyKGVsZW1lbnQpO1xuXG4gICAgICBuZXdzbGV0dGVyLmZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJy5jLXF1ZXN0aW9uX19jb250YWluZXInO1xuXG4gICAgICB3aW5kb3dbbmV3c2xldHRlci5jYWxsYmFja10gPSBkYXRhID0+IHtcbiAgICAgICAgZGF0YS5yZXNwb25zZSA9IHRydWU7XG5cbiAgICAgICAgZGF0YS5lbWFpbCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cIkVNQUlMXCJdJykudmFsdWU7XG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7ZW5kcG9pbnR9P2AgKyBPYmplY3Qua2V5cyhkYXRhKVxuICAgICAgICAgIC5tYXAoayA9PiBgJHtrfT0ke2VuY29kZVVSSShkYXRhW2tdKX1gKS5qb2luKCcmJyk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gbmV3c2xldHRlcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciB0aGUgTmV3c2xldHRlciBPYmplY3RcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIE5ld3NsZXR0ZXJcbiAgICovXG4gIG5ld3NsZXR0ZXJGb3JtKGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1qcz1cIm5ld3NsZXR0ZXItZm9ybVwiXScpKSB7XG4gICAgbGV0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgbGV0IHJlc3BvbnNlID0gcGFyYW1zLmdldCgncmVzcG9uc2UnKTtcbiAgICBsZXQgbmV3c2xldHRlciA9IG51bGw7XG5cbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgbmV3c2xldHRlciA9IG5ldyBOZXdzbGV0dGVyKGVsZW1lbnQpO1xuICAgICAgbmV3c2xldHRlci5mb3JtLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCA9ICcuYy1xdWVzdGlvbl9fY29udGFpbmVyJztcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UgJiYgbmV3c2xldHRlcikge1xuICAgICAgbGV0IGVtYWlsID0gcGFyYW1zLmdldCgnZW1haWwnKTtcbiAgICAgIGxldCBpbnB1dCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cIkVNQUlMXCJdJyk7XG5cbiAgICAgIGlucHV0LnZhbHVlID0gZW1haWw7XG5cbiAgICAgIG5ld3NsZXR0ZXIuX2RhdGEgPSB7XG4gICAgICAgICdyZXN1bHQnOiBwYXJhbXMuZ2V0KCdyZXN1bHQnKSxcbiAgICAgICAgJ21zZyc6IHBhcmFtcy5nZXQoJ21zZycpLFxuICAgICAgICAnRU1BSUwnOiBlbWFpbFxuICAgICAgfTtcblxuICAgICAgbmV3c2xldHRlci5fY2FsbGJhY2sobmV3c2xldHRlci5fZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld3NsZXR0ZXI7XG4gIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgQWxlcnRCYW5uZXIgQ29tcG9uZW50XG4gIC8vICAqXG4gIC8vICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBBbGVydEJhbm5lclxuICAvLyAgKi9cbiAgLy8gYWxlcnRCYW5uZXIoZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQWxlcnRCYW5uZXIuc2VsZWN0b3IpKSB7XG4gIC8vICAgcmV0dXJuIChlbGVtZW50KSA/IG5ldyBBbGVydEJhbm5lcihlbGVtZW50KSA6IG51bGw7XG4gIC8vIH1cblxuICAvLyAvKipcbiAgLy8gICogQW4gQVBJIGZvciB0aGUgU2hhcmVGb3JtIENvbXBvbmVudFxuICAvLyAgKlxuICAvLyAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgU2hhcmVGb3JtXG4gIC8vICAqL1xuICAvLyBzaGFyZUZvcm0oZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFNoYXJlRm9ybS5zZWxlY3RvcikpIHtcbiAgLy8gICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAvLyAgICAgbmV3IFNoYXJlRm9ybShlbGVtZW50KTtcbiAgLy8gICB9KTtcblxuICAvLyAgIHJldHVybiAoZWxlbWVudHMubGVuZ3RoKSA/IGVsZW1lbnRzIDogbnVsbDtcbiAgLy8gfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBBbiBBUEkgZm9yIHRoZSBEaXNjbGFpbWVyIENvbXBvbmVudFxuICAvLyAgKiBAcmV0dXJuICB7T2JqZWN0fSAgSW5zdGFuY2Ugb2YgRGlzY2xhaW1lclxuICAvLyAgKi9cbiAgLy8gZGlzY2xhaW1lcigpIHtcbiAgLy8gICByZXR1cm4gbmV3IERpc2NsYWltZXIoKTtcbiAgLy8gfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBBbiBBUEkgZm9yIHRoZSBUZXh0Q29udHJvbGxlciBPYmplY3RcbiAgLy8gICpcbiAgLy8gICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFRleHRDb250cm9sbGVyXG4gIC8vICAqL1xuICAvLyB0ZXh0Q29udHJvbGxlcihlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihUZXh0Q29udHJvbGxlci5zZWxlY3RvcikpIHtcbiAgLy8gICByZXR1cm4gKGVsZW1lbnQpID8gbmV3IFRleHRDb250cm9sbGVyKGVsZW1lbnQpIDogbnVsbDtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBBbiBBUEkgZm9yIHRoZSBNb2JpbGUgTmF2XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICBJbnN0YW5jZSBvZiBNb2JpbGVNZW51XG4gICAqL1xuICBtb2JpbGVNZW51KCkge1xuICAgIHJldHVybiBuZXcgTW9iaWxlTWVudSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIEFQSSBmb3IgdGhlIFNlYXJjaCBCb3hcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFNlYXJjaFxuICAgKi9cbiAgc2VhcmNoKCkge1xuICAgIHJldHVybiBuZXcgU2VhcmNoKCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gQVBJIGZvciBXZWIgU2hhcmVcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gIEluc3RhbmNlIG9mIFdlYlNoYXJlXG4gICAqL1xuICB3ZWJTaGFyZSgpIHtcbiAgICByZXR1cm4gbmV3IFdlYlNoYXJlKHtcbiAgICAgIGZhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIG5ldyBUb2dnbGUoe1xuICAgICAgICAgIHNlbGVjdG9yOiBXZWJTaGFyZS5zZWxlY3RvclxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl0sIm5hbWVzIjpbInRoaXMiLCJsZXQiLCJjb25zdCIsImkiLCJBY2NvcmRpb24iLCJjb25zdHJ1Y3RvciIsIl90b2dnbGUiLCJUb2dnbGUiLCJzZWxlY3RvciIsIkRyb3Bkb3duIiwidG9nZ2xlIiwiYWZ0ZXIiLCJib2R5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwid2luZG93Iiwic2Nyb2xsIiwiY2xhc3NMaXN0IiwiY2xhc3NlcyIsIk9WRVJGTE9XIiwiTW9iaWxlTWVudSIsInNlbGVjdG9ycyIsInRhcmdldCIsImNvbnRhaW5zIiwiYWN0aXZlQ2xhc3MiLCJDTE9TRSIsImZvY3VzIiwiT1BFTiIsIlNlYXJjaCIsImVsIiwiaW5wdXQiLCJjbGFzc05hbWUiLCJpbmNsdWRlcyIsIm1haW4iLCJpY29ucyIsInBhdGgiLCJJY29ucyIsInNldHRpbmdzIiwidmFsaWQiLCJzdWJtaXQiLCJmb3JtIiwiRm9ybXMiLCJldmVudCIsIkVSUk9SX01FU1NBR0VfUEFSRU5UIiwid2F0Y2giLCJhY2NvcmRpb24iLCJkcm9wZG93biIsImNvcHkiLCJDb3B5IiwidHJhY2siLCJUcmFjayIsIm5ld3NsZXR0ZXIiLCJlbmRwb2ludCIsImVsZW1lbnQiLCJOZXdzbGV0dGVyIiwiY2FsbGJhY2siLCJkYXRhIiwicmVzcG9uc2UiLCJlbWFpbCIsInZhbHVlIiwibG9jYXRpb24iLCJPYmplY3QiLCJrZXlzIiwibWFwIiwiayIsImVuY29kZVVSSSIsImpvaW4iLCJuZXdzbGV0dGVyRm9ybSIsInBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsImdldCIsIl9kYXRhIiwiX2NhbGxiYWNrIiwibW9iaWxlTWVudSIsIndlYlNoYXJlIiwiV2ViU2hhcmUiLCJmYWxsYmFjayJdLCJtYXBwaW5ncyI6Ijs7O0VBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBTSxNQUFNLEdBUVYsZUFBVyxDQUFDLENBQUMsRUFBRTs7QUFBQztFQUNsQjtFQUNBLEVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7RUFDaEQsTUFBTSxNQUFNLENBQUMsY0FBYyxHQUFHLEVBQUUsR0FBQztBQUNqQztFQUNBLEVBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0QjtFQUNBLEVBQUksSUFBSSxDQUFDLFFBQVEsR0FBRztFQUNwQixJQUFNLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUTtFQUMzRCxJQUFNLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUztFQUMvRCxJQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYTtFQUMvRSxJQUFNLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVztFQUN2RSxJQUFNLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLO0VBQzNDLElBQU0sS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FB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QUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFnQixtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFDLFVBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBUyxHQUFHLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUMsT0FBTyxDQUFDOztFQ005cUQ7RUFDQTtFQUNBO0VBQ0EsSUFBTSxVQUFVLEdBUWQsbUJBQVcsQ0FBQyxPQUFPLEVBQUU7O0FBQUM7RUFDeEIsRUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUN2QjtFQUNBLEVBQUksSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0FBQ2hDO0VBQ0EsRUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7QUFDMUM7RUFDQSxFQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztBQUMxQztFQUNBLEVBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO0FBQ3hDO0VBQ0EsRUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFDNUM7RUFDQSxFQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUN0QztFQUNBLEVBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO0FBQzFDO0VBQ0EsRUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7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
