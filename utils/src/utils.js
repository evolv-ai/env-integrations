/* eslint-disable class-methods-use-this */
import { version } from '../package.json';
import CookieMethods from './cookies.js';

/***
 * Creates the prefix for a log message.
 * @internal
 * @param {string} id - The context id.
 * @param {number} opacity - The opacity of the prefix. A number between 0 and 1.
 */
function getlogPrefix(id, opacity) {
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

    this.#logPrefixNormal = getlogPrefix(id, 1);
    this.#logPrefixDebug = getlogPrefix(id, 0.5);

    this.version = version;
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
   * Logs an debug message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
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
      this.warn('Describe requires Evolv Utils to be initialized with a config object');
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
      const timer = setTimeout(() => {
        clearInterval(poll);
        reject();
      }, timeout);
      poll = setInterval(() => {
        const result = callback();
        if (result) {
          clearInterval(poll);
          clearTimeout(timer);
          resolve(result);
        }
      }, interval);
    });
  }

  /**
   * Polls a callback function at the specified interval. When its return value changes, the listener is called.
   * If the timeout is reached and no callback has been fired, the catch callback is called.
   * @param {function} callback The callback function to poll
   * @param {number} timeout The timeout in milliseconds, defaults to 5000
   * @param {number} interval The interval in milliseconds, defaults to 25
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

  subscribe = (testCondition, duration = 5000, interval = 25) => {
    let fired;
    let poll;
    let previousState;
    let catcherA;
    let callbackA = () => {};

    setTimeout(() => {
      clearInterval(poll);
      if (catcherA && !fired) {
        this.debug('subscribe: timed out');
        catcherA();
      }
    }, duration);

    poll = setInterval(() => {
      const currentState = testCondition();

      if (currentState !== previousState) {
        this.debug(`subscribe: change in test condition results. previous: ${previousState}, current: ${currentState}`);
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
   * Transforms a string into a slug.
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
   * Creates an array of elements from an HTML string and adds click handlers to the elements.
   * @param {string} HTMLString The HTML string
   * @param {Object} clickHandlers An object where the keys are CSS selectors and the values are click handlers
   * @returns {HTMLElement[]} The array of elements
   */
  makeElements(HTMLString, clickHandlers = {}) {
    const template = document.createElement('template');
    template.innerHTML = HTMLString;

    Object.keys(clickHandlers).forEach((key) => {
      template.content.querySelector(key).addEventListener('click', clickHandlers[key]);
    });

    const array = Array.from(template.content.children);
    return array;
  }

  /**
   * Creates an element from an HTML string and adds click handlers to the element.
   * @param {string} HTMLString The HTML string
   * @param {Object} clickHandlers An object where the keys are CSS selectors and the values are click handlers
   * @returns {HTMLElement} A single element
   */
  makeElement(HTMLString, clickHandlers = {}) {
    const template = document.createElement('template');
    template.innerHTML = HTMLString;

    Object.keys(clickHandlers).forEach((key) => {
      template.content.querySelector(key).addEventListener('click', clickHandlers[key]);
    });

    return template.content.firstElementChild;
  }

  /**
   * Selects an element from the DOM or creates new element from an HTML string.
   * @param {string} selector The CSS selector, XPath expression, or HTML string
   * @returns {HTMLElement[]} An array containing a single element
   */
  $(selector) {
    switch (selector.charAt(0)) {
      case '/':
      case '(': {
        const result = document.evaluate(
          selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue;
        return result ? [result] : [];
      }
      case '<':
        return [this.makeElement(selector)];
      default: {
        const result = document.querySelector(selector);
        return result ? [result] : [];
      }
    }
  }

  /**
   * Selects elements from the DOM or creates new elements from an HTML string.
   * @param {string} selector The CSS selector, XPath expression, or HTML string
   * @returns {HTMLElement[]} The array of elements
   */
  $$(selector) {
    switch (selector.charAt(0)) {
      case '/':
      case '(': {
        const result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
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
        return Array.from(document.querySelectorAll(selector));
    }
  }

  /**
   * Adds a class from an element only if a change needs to occur.
   * @param {HTMLElement} element The element
   * @param {string} className The class name
   */
  addClass = (element, className) => {
    if (!element.classList.contains(className)) {
      this.debug(`add-class: '${className}' added`);
      element.classList.add(className);
    }
  };

  /**
   * Removes a class from an element only if a change needs to occur.
   * @param {HTMLElement} element The element
   * @param {string} className The class name
   */
  removeClass = (element, className) => {
    if (element.classList.contains(className)) {
      this.debug(`remove-class: '${className}' removed`);
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
      this.debug(`update-text: text replaced with '${text}'`);
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
    const elementArray = elements instanceof Element ? [elements] : Array.from(elements);
    const wrapper = this.makeElement(wrapperString);
    elementArray[0].before(wrapper);
    wrapper.append(...elementArray);
    return wrapper;
  };

  /**
   * Adds classes prefixed with `evolv-` to the body element.
   * @param {...(string|number)} args The namespace
   */
  namespace = (...args) => {
    this.addClass(document.body, ['evolv', ...args].join('-'));
  };
}

export default Utils;
