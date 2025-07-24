/* eslint-disable class-methods-use-this */

/**
 * A utility class for generating XPath selectors for elements based on class names.
 * The generated XPaths can be used to locate DOM elements that match specific patterns
 * related to mutation keys and context prefixes.
 */
class XPathMethods {
  /**
   * @private
   * @type {string}
   */
  #prefix;

  /**
   * Creates an instance of the XPathMethods class.
   *
   * @param {Object} config - Configuration object for initializing the XPath methods.
   * @param {string} [config.xpath_prefix] - The prefix for XPath generation. If not provided falls back to `config.context_key`
   * @param {string} [config.context_key] - An alternate context key to use for generating the prefix. If not provided falls back to `config.contexts[0].id`
   * @param {Array<{id: string}>} [config.contexts] - A list of context objects, used if neither `xpath_prefix` nor `context_key` is provided.
   *
   * @example
   * const xpathMethods = new XPathMethods({ xpath_prefix: 'abc' });
   */
  constructor(config) {
    this.#prefix =
      config?.xpath_prefix ||
      config?.context_key ||
      config?.contexts?.[0]?.id ||
      config?.id ||
      '';
  }

  /**
   * Generates an XPath expression that matches elements containing the specified class name.
   *
   * @param {string} className - The class name to match within the element's `class` attribute.
   * @returns {string} An XPath expression to match elements containing the specified class.
   *
   * @example
   * // HTML
   * <div class="content">
   *   <div class="content-inner">Content</div>
   * </div>
   *
   * // JS
   * collect(`//div[${containsClass('content')}]`, 'content');
   *
   * // Mutate only collects the outer div
   */
  containsClass = (className) =>
    `contains(concat(" ", @class, " "), " ${className} ")`;

  /**
   * Generates an XPath expression to match elements that contain a mutation key as a class name.
   * The mutation key is prefixed with the class prefix.
   *
   * @param {string} key - The collector name to match as part of the class name.
   * @returns {string} An XPath expression for the specified mutation key.
   *
   * @example
   * // In this example utils was initialized with config.xpath_prefix = "page-transform"
   * utils.selectors = {
   *   'protection-section': `//div[${containsKey('line-content')}]//div[@data-testid="protectionSection"]`
   * }
   * console.log(utils.selectors['protection-section']);
   * // Output: //div[contains(concat(" ", @class, " "), " mutate-page-transform-protection-section ")]
   */
  containsKey = (key) =>
    this.containsClass(
      `mutate-${this.#prefix ? `${this.#prefix}-` : ''}${key}`,
    );

  /**
   * Generates an XPath expression that matches an element containing all the specified keys as classes.
   * The keys are prefixed and combined into an XPath expression to match a container element
   * that holds all other specified elements.
   *
   * @param {Array<string>} keys - A list of keys to match as part of the element's class names.
   * @param {string} container - The collector name that identifies the container element.
   * @returns {string} An XPath expression to find the container element that contains all specified keys.
   *
   * @example
   * // In this example utils was initialized with config.contexts[0].id = "abc"
   * const selectors = {
   *   'user-profile-settings': utils.xpath.includesAllKeys(['user', 'profile', 'settings'], 'container')
   * }
   * console.log(selectors['user-profile-settings']);
   * // Output: //*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-user ")]/ancestor::*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-profile ")]/ancestor::*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-settings ")]/ancestor::*[contains(concat(" ", @class, " "), " mutate-abc-container ")]
   */
  includesKeys = (keys, containerKey) => {
    const container = `*[${this.containsKey(containerKey)}]`;
    return keys.reduce(
      (acc, cur) =>
        `${acc}//*[${this.containsKey(cur)}]/ancestor::${container}`,
      `//${container}`,
    );
  };

  /**
   * Generates an XPath expression to match any element containing one of the specified keys.
   * Optionally, a container key can be provided to further scope the search.
   *
   * @param {Array<string>} keys - A list of keys to match as part of the element's class names.
   * @param {string} [container = ''] - An optional key to limit the scope of the XPath to a specific container element. Can be an XPath selector or a collector name.
   * @returns {string} An XPath expression that matches any element with one of the specified keys.
   *
   * @example
   * // Using collector name
   * // In this example utils was initialized with config.contexts[0].id = "abc"
   * const selectors = {
   *   'container': '.container',
   *   'user-profile': utils.xpath.anyKey(['user', 'profile'], 'container');
   * }
   * console.log(selectors['user-profile']);
   * // Output: //*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-user ")] | //*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-profile ")]
   *
   * @example
   * // Using XPath selector
   * // In this example utils was initialized with config.contexts[0].id = "abc"
   * const selectors = {
   *   'user-profile': utils.xpath.anyKey(['user', 'profile'], '//div[@id="container"]');
   * }
   * console.log(selectors['user-profile']);
   * // Output: //div[@id="container"]//*[contains(concat(" ", @class, " "), " mutate-abc-user ")] | //div[@id="container"]//*[contains(concat(" ", @class, " "), " mutate-abc-profile ")]
   */
  anyKey = (keys, container) => {
    let containerString;

    if (!container) {
      containerString = '';
    } else if (container.startsWith('//')) {
      containerString = container;
    } else {
      containerString = `//*[${this.containsKey(container)}]`;
    }

    return keys
      .map((key) => `${containerString}//*[${this.containsKey(key)}]`)
      .join(' | ');
  };
}

export default XPathMethods;
