/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
import { version } from '../package.json';
import CookieMethods from './CookieMethods.js';
import initNamespace from './namespace.js';
import TemplateResult from './TemplateResult.js';
import XPathMethods from './XPathMethods.js';

/***
 * Creates the prefix for a log message.
 * @internal
 * @param {string} id - The context id.
 * @param {number} opacity - The opacity of the prefix. A number between 0 and 1.
 */
function getLogPrefix(id, opacity) {
  return [
    `%c[evolv${id ? `-${id}` : '-utils'}]`,
    `background-color: rgba(255, 122, 65, ${
      opacity / 2
    }); border: 1px solid rgba(255, 122, 65, ${opacity}); border-radius: 2px`,
  ];
}

class Utils {
  #config;

  #logPrefixNormal;

  #logPrefixDebug;

  /**
   * An array of callbacks to be executed on context exit. Used by [.namespace](#Utils+namespace)
   * and can also be used for custom tear-down/clean-up functions if you have problems with
   * elements persisting after SPA navigation changes. Reversion triggers when the current active
   * key transitions to inactive, so in the Web Editor it won't fire in Edit mode. It also requires
   * the `config` object to contain the context key as it matches in the YML. If `config.contexts[0].id`
   * is not the same as the context key in the YML you can add the following to the top level of
   * `config`:
   * ```js
   *  context_key: this.key,
   * ```
   */
  toRevert = [];

  /**
   * The utils object containing all helper functions
   * @param {string} id A unique key for referencing the utils sandbox
   * @param {Object} config A configuration object that defines the project. Used by <code>describe()</code>
   */
  constructor(id, config) {
    this.#config = config;

    this.logLevel =
      localStorage
        .getItem('evolv:logs')
        ?.match(/normal|debug/i)?.[0]
        .toLowerCase() || 'silent';

    this.#logPrefixNormal = getLogPrefix(id, 1);
    this.#logPrefixDebug = getLogPrefix(id, 0.5);

    this.version = version;
    this.contextKey = config?.context_key || config?.contexts?.[0]?.id || null;

    this.setContext = this.setContext.bind(this);
    this.fail = this.fail.bind(this);
    this.makeElement = this.makeElement.bind(this);

    if (this.contextKey) {
      if (!this.contextKey.startsWith('web.')) {
        this.contextKey = `web.${this.contextKey}`;
      }

      window.evolv.client.getActiveKeys(this.contextKey).then(({ current }) => {
        if (!current.length) {
          return;
        }

        this.log(`key watcher: init key watching for '${this.contextKey}'`);

        window.evolv.client.getActiveKeys(this.contextKey).listen((keys) => {
          // Determine if user is exiting the context
          if (keys.previous.length && !keys.current.length) {
            this.log(`key watcher: exit context '${this.contextKey}'`);
            let index = this.toRevert.length;
            while (index--) {
              this.toRevert[index]();
            }
          }
        });
      });
    }

    this.windowWidthObserver = null;
    this.namespace = initNamespace(this);
    this.xpath = new XPathMethods(this.#config);
  }

  /**
   * Logs a message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   *    to <code>normal</code> or <code>debug</code>.
   * @param {...(string|number)} args - The messages to log
   */
  log = (...args) => {
    if (this.logLevel === 'normal' || this.logLevel === 'debug') {
      console.log(...this.#logPrefixNormal, ...args); // eslint-disable-line no-console
    }
  };

  /**
   * Logs a debug message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   *    to <code>debug</code>.
   * @param {...(string|number)} args - The debug messages to log.
   */
  debug = (...args) => {
    if (this.logLevel === 'debug') {
      console.log(...this.#logPrefixDebug, ...args); // eslint-disable-line no-console
    }
  };

  /**
   * Logs a warning to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   *    to <code>normal</code> or <code>debug</code>.
   * @param {...(string|number)} args - The warnings to log.
   */
  warn = (...args) => {
    if (this.logLevel === 'normal' || this.logLevel === 'debug') {
      console.warn(...this.#logPrefixNormal, ...args); // eslint-disable-line no-console
    }
  };

  /**
   * Logs the description of a context, variable, or variant from <code>evolv-config.json</code> to the console.
   * @param {string} context - The context id.
   * @param {string} variable - The variable id.
   * @param {string} variant - The variant id.
   */
  describe = (context, variable, variant) => {
    if (!this.#config) {
      this.warn(
        'Describe requires Evolv Utils to be initialized with a config object',
      );
      return;
    }
    const type = ['context', 'variable', 'variant'];
    let typeIndex;
    const item = [context, variable, variant].reduce((acc, cur, index) => {
      if (cur) {
        const next = acc[`${type[index]}s`].find((v) => v.id === cur);
        typeIndex = index;
        return next;
      }
      return acc;
    }, this.#config);
    this.log(`init ${type[typeIndex]}:`, item.display_name);
  };

  /**
   * For functions called in rapid succession, waits until a call has not been made for the duration
   * of the timeout before executing.
   * @param {function} callback The function to debounce
   * @param {number} timeout The timeout in milliseconds
   * @returns {function} The throttled function
   */
  debounce = (callback, timeout = 25) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback.apply(this, args);
      }, timeout);
    };
  };

  /**
   * For functions called in rapid succession, this function will only call once per a specified interval.
   * @param {function} callback The function to throttle
   * @param {number} limit The interval in milliseconds
   * @returns {function} The throttled function
   */
  throttle(callback, limit = 16) {
    let wait = false;
    return (...args) => {
      if (wait) {
        return;
      }
      wait = true;
      setTimeout(() => {
        callback.apply(this, args);
        wait = false;
      }, limit);
    };
  }

  /**
   * Polls a callback function until it returns a truthy value or a timeout is reached.
   * @param {function} callback The callback function to poll
   * @param {number} timeout The timeout in milliseconds, defaults to 5000
   * @param {number} interval The interval in milliseconds, defaults to 25
   * @returns {Promise} A promise that resolves when the callback returns a truthy value
   *    or rejects when the timeout is reached.
   */
  waitFor(callback, timeout = 5000, interval = 25) {
    return new Promise((resolve, reject) => {
      let poll;
      let result;
      const timer = setTimeout(() => {
        clearInterval(poll);
        reject(result);
      }, timeout);
      poll = setInterval(() => {
        try {
          result = callback();
          if (result) {
            clearInterval(poll);
            clearTimeout(timer);
            resolve(result);
          }
        } catch (e) {
          clearInterval(poll);
          this.warn('waitFor: error in callback\n', e);
          reject(result, e);
        }
      }, interval);
    });
  }

  /**
   * Polls a callback function at the specified interval. When its return value changes, the listener is called.
   * If the timeout is reached and no callback has been fired, the catch callback is called.
   * @param {function} testCondition The callback function to poll
   * @param {number|function} [exitCondition=5000] A number will be treated as a timeout in milliseconds. If a callback is provided, the subscription will terminate when the callback evaluates to `true`.
   * @param {number} [interval=25] The interval in milliseconds
   * @returns {Object} An object with a then() function that takes a listener callback followed by a catch()
   *  function accepts a catch callback.
   * @example
   * // This snippet will prevent a session token from being deleted by storing a copy of it in localStorage.
   *
   * subscribe(() => sessionStorage.getItem(key), 600000, 250).then(sessionToken => {
   *  const localToken = localStorage.getItem(key);
   *  console.log('[evolv-local] session token:', sessionToken, 'local token:', localToken);
   *  if (!sessionToken && localToken) {
   *    sessionStorage.setItem(key, localToken)
   *  } else if (sessionToken) {
   *    localStorage.setItem(key, sessionToken)
   *  }
   * });
   */
  subscribe = (testCondition, exitCondition = 5000, interval = 25) => {
    let fired;
    let poll;
    let previousState;
    let catcherA;
    let callbackA = () => {};
    const exitConditionType = typeof exitCondition;

    if (exitConditionType === 'number') {
      setTimeout(() => {
        clearInterval(poll);
        if (catcherA && !fired) {
          this.debug(`subscribe: timed out at ${exitCondition}ms`);
          catcherA();
        }
      }, exitCondition);
    }

    poll = setInterval(() => {
      if (exitConditionType === 'function' && exitCondition()) {
        this.debug('subscribe: exit condition met');
        clearInterval(poll);
        return;
      }

      const currentState = testCondition();

      if (currentState !== previousState) {
        this.debug(
          `subscribe: change in test condition results. previous: ${previousState}, current: ${currentState}`,
        );
        fired ??= true;
        callbackA(currentState);
        previousState = currentState;
      }
    }, interval);

    return {
      then: (callbackB) => {
        callbackA = callbackB;

        return {
          catch: (catcherB) => {
            catcherA = catcherB;
          },
        };
      },
    };
  };

  cookie = new CookieMethods(this.debug);

  /**
   * A utility object for string manipulation methods.
   */
  string = {
    /**
     * Capitalizes the first letter of a string.
     *
     * @param {string} string The string to capitalize.
     * @returns {string} The string with the first letter capitalized.
     * @example
     * string.capitalizeFirstLetter('hello'); // 'Hello'
     * string.capitalizeFirstLetter('HELLO'); // 'Hello'
     */
    capitalizeFirstLetter: (string) =>
      string.charAt(0).toUpperCase() + string.slice(1).toLowerCase(),

    /**
     * Checks if the given string is in camelCase format.
     *
     * @param {string} string The string to check.
     * @returns {boolean} Returns `true` if the string is in camelCase, `false` otherwise.
     * @example
     * string.isCamelCase('myVariable'); // true
     * string.isCamelCase('my_variable'); // false
     */
    isCamelCase: (string) => /^[a-z]+([A-Z][a-z]*)$/.test(string),

    /**
     * Parses a string into an array of words. If the string is in camelCase, it splits the string
     * at uppercase letter boundaries. If not, it treats spaces or non-word characters as delimiters.
     *
     * @param {string} string The string to parse.
     * @returns {string[]} An array of words parsed from the string.
     * @example
     * string.parse('myCamelCaseString'); // ['my', 'Camel', 'Case', 'String']
     * string.parse('hello world!'); // ['hello', 'world']
     */
    parse: (string) => {
      if (this.string.isCamelCase(string)) {
        return string.match(/[A-Z]?[a-z]+/g);
      }

      return string.replace(/\W+/g, ' ').trim().split(' ');
    },

    /**
     * Converts a string to camelCase.
     *
     * @param {string} string The string to convert.
     * @returns {string} The string converted to camelCase.
     * @example
     * string.toCamelCase('hello world'); // 'helloWorld'
     * string.toCamelCase('this is a test'); // 'thisIsATest'
     */
    toCamelCase: (string) =>
      this.string
        .parse(string)
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : this.string.capitalizeFirstLetter(word.toLowerCase()),
        )
        .join(''),

    /**
     * Converts a string to kebab-case.
     *
     * @param {string} string The string to convert.
     * @returns {string} The string converted to kebab-case.
     * @example
     * string.toKebabCase('helloWorld'); // 'hello-world'
     * string.toKebabCase('this is a test'); // 'this-is-a-test'
     */
    toKebabCase: (string) =>
      this.string
        .parse(string)
        .map((word) => word.toLowerCase())
        .join('-'),
  };

  /**
   * Transforms a string into a slug.
   * @deprecated Use `utils.string.toKebabCase()` instead
   * @param {string} string The string to transform
   * @returns {string} The slug
   */
  slugify(string) {
    return string
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Sets Evolv remote context property and outputs log
   * @param {string} key The remote context key
   * @param {string} value The remote context value
   * @example
   * // For Snowflake monitoring. Sets initial t=0 to monitor load time
   * utils.setContext('vz.cartDeviceEditModal', {
   *   variant: `c8${variant}`,
   *   loadTime: 0,
   *   bodyClasses: null
   * });
   */
  setContext(key, value) {
    this.log(`set context: set remote context key '${key}' to`, value);
    window.evolv.context.set(key, value);
  }

  /**
   * A tag for template literals that exports a `TemplateResult` object to be consumed by the `utils.render` method.
   *
   * @param {string[]} strings
   * @param  {...any} expressions
   * @returns {TemplateResult}
   */
  html = (strings, ...expressions) => new TemplateResult(strings, expressions);

  /**
   * Transforms `TemplateResult` into an `Node`. Attributes prefixed with `@` will be assigned as event listeners. Allows embedding of `Nodes`, other `TemplateResult` objects, and arrays of expressions.
   * @param {TemplateResult} templateResult
   * @returns {Node}
   * @example
   * // Creates a div containing two buttons with click handlers already assigned
   * const {html, render} = utils;
   *
   * const button = render(html`
   *   <div class="button-wrap">
   *       <button @click=${goBackCallback}>
   *           Go back
   *       </button>
   *       <button class="secondary" @click=${continueCallback}>
   *           Continue
   *       </button>
   *   </div>
   * `)
   *
   * @example
   * // Creates a group of tiles
   * const {html, render} = utils;
   *
   * const tileContents = [
   *   {
   *     title: 'Buy this phone',
   *     body: 'It's better than your old phone.',
   *     onClick: app.phoneAction
   *   },
   *   {
   *     title: 'Upgrade your plan',
   *     body: 'It's better than your old plan.',
   *     onClick: app.planAction
   *   },
   *   {
   *     title: 'Get device protection',
   *     body: 'You know you're clumsy.',
   *     onClick: app.protectionAction
   *   }
   * ]
   *
   * const tileTemplate = (content) => render(html`
   *   <div class="tile">
   *     <h2>${content.title}</h2>
   *     <div>${content.body}</div>
   *     <button @click=${content.onClick}>Continue</button>
   *   </div>
   * `);
   *
   * // Maps the content into a new array of `TemplateResult` objects which get recursively rendered. The `false` flag is important because it instructs `inject` to not clone the element, preventing the destruction of event listeners.
   * mutate('main').inject(() => render(html`
   *   <div class="tile-group">
   *     ${tileContents.map(tileContent => tileTemplate(tileContent))}
   *   </div>
   * `), false);
   */
  render = (templateResult) => templateResult.render();

  /**
   * Renders a `TemplateResult` and returns an array of elements.
   * @param {TemplateResult} templateResult The `TemplateResult` to render
   * @returns {NodeList} The rendered nodes
   */
  renderAll = (templateResult) => templateResult.renderAll();

  /**
   * Creates an array of elements from an HTML string and adds click handlers to the elements.
   * ** Deprecated: to be replaced by [render](#Utils+render)
   * @param {string} HTMLString The HTML string
   * @param {Object} clickHandlers An object where the keys are CSS selectors and the values are click handlers
   * @returns {Element[]} The array of elements
   */
  makeElements(HTMLString, clickHandlers = {}) {
    const template = document.createElement('template');
    template.innerHTML = HTMLString;

    Object.keys(clickHandlers).forEach((key) => {
      template.content
        .querySelector(key)
        ?.addEventListener('click', clickHandlers[key]);
    });

    return [...template.content.children];
  }

  /**
   * Creates an element from an HTML string and adds click handlers to the element.
   * @param {string} HTMLString The HTML string
   * @param {Object} clickHandlers An object where the keys are CSS selectors and the values are click handlers
   * @returns {HTMLElement} A single element
   */
  makeElement(HTMLString, clickHandlers = {}) {
    return this.makeElements(HTMLString, clickHandlers)[0];
  }

  /**
   * Selects an element from the DOM or creates new element from an HTML string.
   * @param {string} selector The CSS selector, XPath expression, or HTML string
   * @returns {HTMLElement} A single element
   */
  $(selector) {
    switch (selector.charAt(0)) {
      case '/':
      case '(': {
        return document.evaluate(
          selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue;
      }
      case '<':
        return this.makeElement(selector);
      default: {
        return document.querySelector(selector);
      }
    }
  }

  /**
   * Selects elements from the DOM or creates new elements from an HTML string.
   * @param {string} selector The CSS selector, XPath expression, or HTML string
   * @returns {Element[]} An array of result elements
   */
  $$(selector) {
    switch (selector.charAt(0)) {
      case '/':
      case '(': {
        const result = document.evaluate(
          selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null,
        );
        const length = result.snapshotLength;
        const array = new Array(length);
        for (let i = 0; i < length; i += 1) {
          array[i] = result.snapshotItem(i);
        }
        return array;
      }
      case '<':
        return this.makeElements(selector);
      default:
        return [...document.querySelectorAll(selector)];
    }
  }

  /**
   * Adds a class from an element only if a change needs to occur.
   * @param {HTMLElement} element The element
   * @param {string} className The class name
   * @param {boolean} [silent=false] Whether to disable logging
   */
  addClass = (element, className, silent = false) => {
    if (element && !element.classList.contains(className)) {
      if (!silent) {
        this.debug(`add class: '${className}' added`);
      }
      element.classList.add(className);
    }
  };

  /**
   * Removes a class from an element only if a change needs to occur.
   * @param {HTMLElement} element The element
   * @param {string} className The class name
   * @param {boolean} [silent=false] Whether to disable logging
   */
  removeClass = (element, className, silent = false) => {
    if (element && element.classList.contains(className)) {
      if (!silent) {
        this.debug(`remove class: '${className}' removed`);
      }
      element.classList.remove(className);
    }
  };

  /**
   * Updates an element's innerText only if a change needs to occur.
   * @param {HTMLElement} element The element
   * @param {string} text The new text for the element
   */
  updateText = (element, text) => {
    if (element.innerText !== text) {
      this.debug(`update text: text replaced with '${text}'`);
      /* eslint-disable-next-line no-param-reassign */
      element.innerText = text;
    }
  };

  /**
   * Wraps an element or a group of elements with an HTML element defined by a string
   * @param {(HTMLElement|NodeList|HTMLElement[])} elements The elements to be wrapped
   * @param {string} wrapperString String containing markup a valid HTML element
   * @returns {HTMLElement} The wrapped element
   */
  wrap = (elements, wrapperString) => {
    this.debug('wrap:', wrapperString);
    const elementArray =
      elements instanceof Element ? [elements] : Array.from(elements);
    const wrapper = this.makeElement(wrapperString);
    elementArray[0].before(wrapper);
    wrapper.append(...elementArray);
    return wrapper;
  };

  /**
   * Checks if an element is currently visible on the screen
   * @param {HTMLElement} element The element to check
   * @returns {boolean} `true` if the element is visible
   */
  isVisible(element) {
    return !(element.offsetParent === null);
  }

  /**
   * A wrapper for `evolv.client.contaminate` that logs a warning to the console.
   * @param {string} details The specifics of the failure
   * @param {string} [reason=missing-requirements] The type of failure
   * @example
   * if (!modalDialog) {
   *   fail(`modalDialog not found`); // > fail: contaminating do to 'missing-requirements' - modalDialog not found
   * }
   */
  fail(details, reason = 'missing-requirements') {
    this.warn(`fail: contaminating due to '${reason}' -`, details);
    window.evolv.client.contaminate({ reason, details });
  }

  /**
   * Checks for full IntersectionObserver support
   * @returns {boolean} `true` if browser supports IntersectionObserver
   * @example
   * if (!supportsIntersectionObserver()) {
   *   fail('IntersectionObserver not supported'); // > fail: contaminating do to 'missing-requirements' -
   * }                                             // IntersectionObserver not supported
   *
   */
  supportsIntersectionObserver() {
    return (
      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype &&
      'isIntersecting' in window.IntersectionObserverEntry.prototype
    );
  }

  /**
   * Gets the nth ancestor or nth ancestor matching a selector for a given element
   * @param {HTMLElement} element The element
   * @param {number} [level=1] The number of ancestors to traverse
   * @example
   * addClass(getAncestor(protectionText, 3), 'evolv-psfec-protection-text-outer');
   * // > add class: 'evolv-psfec-protection-text-outer' added
   *
   *
   */
  getAncestor(element, level = 1) {
    let elementNew = element;
    let counter = level;

    while (counter--) {
      elementNew = elementNew?.parentElement || null;
    }

    return elementNew;
  }

  /**
   * Gets all elements before the given element within the same parent
   * @param {HTMLElement} element The element
   * @returns {HTMLElement[]} An array of elements
   * @example
   * mutate('order-summary-wrap').customMutation((state, orderSummaryWrap) => {
   *   utils.wrap(utils.getPrecedingSiblings(orderSummaryWrap), '<div class="evolv-psfec-cart-left"></div>');
   * });
   */
  getPrecedingSiblings(element) {
    const result = [];
    let precedingSibling = element.previousElementSibling;

    while (precedingSibling) {
      result.unshift(precedingSibling);
      precedingSibling = precedingSibling.previousElementSibling;
    }

    return result;
  }

  /**
   * Gets the outermost element matching a selector
   * @param {HTMLElement} element The element
   * @param {string} selector The selector to match
   * @example
   * const modalDialog = utils.getOutermost(iframe, 'div[class^="ModalDialogWrapper-VDS"]');
   */
  getOutermost = (element, selector) => {
    let outerElement = element;
    let outerElementPrevious;

    while (outerElement) {
      outerElementPrevious = outerElement;
      outerElement = outerElement?.parentElement?.closest(selector);
    }

    return outerElementPrevious;
  };

  /**
   * Converts a CSS size string (e.g., '10px', '1rem') to its numeric value in pixels.
   * If the value is in 'rem', it will be converted based on the root font size.
   * Returns NaN if the unit is not 'px' or 'rem'.
   *
   * @param {string} cssSize - The CSS size string (e.g., '10px', '1rem').
   * @returns {number} The numeric value of the size in pixels, or NaN if the unit is invalid.
   */
  cssSizeToValue = (cssSize) => {
    const unit = cssSize.match(/\d+\.?\d*(px|rem)/i)?.[1];
    const value = parseFloat(cssSize);

    if (unit === 'px' && !Number.isNaN(value)) {
      return value;
    }

    if (unit === 'rem' && !Number.isNaN(value)) {
      const remSize = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize,
      );
      return value * remSize;
    }

    return NaN;
  };

  /**
   * Updates a CSS property on a target element with a new value.
   * If the new value is the same as the current value, no update is made.
   * Optionally, the target element can be specified, otherwise defaults to `document.documentElement`.
   *
   * @param {string} property - The CSS property to update (e.g., 'background-color').
   * @param {string | number} value - The new value to set for the property (can be a string or number).
   * @param {HTMLElement} [targetElement=document.documentElement] - The target element to apply the style to.
   */

  updateProperty = (
    property,
    value,
    targetElement = document.documentElement,
  ) => {
    if (
      !targetElement ||
      !property ||
      value === null ||
      typeof value === 'undefined'
    ) {
      return;
    }
    const valuePrevious = targetElement.style.getPropertyValue(property);
    const valueCurrent = value.toString();

    if (valueCurrent === valuePrevious) {
      return;
    }

    targetElement.style.setProperty(property, valueCurrent);
  };

  /**
   * Checks if the device supports touch events.
   * This method checks for the presence of touch event properties in the window and navigator objects.
   *
   * @returns {boolean} `true` if the device supports touch events, otherwise `false`.
   */
  isTouchDevice = () =>
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  /**
   * Returns the offset rectangle of a given element relative to the document,
   * including scroll offsets and client positions.
   * This method calculates the element's position and size considering scrolling.
   *
   * @param {Element} element - The DOM element whose offset rectangle is to be calculated.
   * @returns {DOMRect} The calculated DOMRect object containing the element's position and dimensions.
   */
  getOffsetRect = (element) => {
    const box = element.getBoundingClientRect();
    const { width, height } = box;
    const { documentElement, body } = document;
    const scrollTop = documentElement.scrollTop ?? body.scrollTop;
    const scrollLeft = documentElement.scrollLeft ?? body.scrollLeft;
    const clientTop = documentElement.clientTop ?? body.clientTop;
    const clientLeft = documentElement.clientLeft ?? body.clientLeft;
    const x = Math.round(box.left + scrollLeft - clientLeft);
    const y = Math.round(box.top + scrollTop - clientTop);

    return new DOMRect(x, y, width, height);
  };

  /**
   * Adds a ResizeObserver to the body that updates the CSS custom property
   * `--evolv-window-width` with the current width of the body in px.
   */
  observeWindowWidth = () => {
    if (!this.windowWidthObserver) {
      this.windowWidthObserver = new ResizeObserver(() =>
        this.updateProperty(
          '--evolv-window-width',
          `${window.innerWidth}px`,
          document.body,
        ),
      );

      this.windowWidthObserver.observe(document.body);
    }
  };

  /**
   * Simulates a click on a specified DOM element without triggering Adobe tracking.
   *
   * @function
   * @param {HTMLElement} element - The DOM element on which the stealth click is performed.
   */
  stealthClick = (element) => {
    element.setAttribute('data-track-ignore', 'true');
    element.click();
    setTimeout(() => element.removeAttribute('data-track-ignore'), 0);
  };

  /**
   * Reverts any persistent actions. Currently this only applies to namespace(),
   * removing the body classes.
   *
   * @function
   */
  revert = () => {
    this.toRevert.forEach((action) => action());
  };
}

export default Utils;
