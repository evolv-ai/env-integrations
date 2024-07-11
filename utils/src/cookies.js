class CookieMethods {
  /**
   * A group of methods for getting and setting cookies. These methods get assigned to the
   * <code>evolv.utils.cookie</code> object.
   */
  constructor(debug) {
    this.#debug = debug;
  }

  #debug;

  /**
   * Retrieves the decoded (optionally) value of the specified cookie.
   * @param {string} key The cookie key
   * @param {boolean} [decode=true] Whether to decode the value
   * @returns {string} The value of the cookie
   * @example
   * document.cookie = 'test-cookie=true';
   * utils.cookie.getItem('test-cookie'); // 'true'
   */
  getItem(key, decode = true) {
    const pattern = new RegExp(`(^|; ?)(${key}=[^;]*)(?=;|$)`);
    const value = document.cookie.match(pattern)?.[2]?.split('=')?.[1];
    if (!value) {
      return undefined;
    }
    const result = decode ? decodeURIComponent(value) : value;
    this.#debug(`cookie: get '${result}' ${decode ? '(decoded)' : ''} from item '${key}'`);
    return result;
  }

  /**
   * Sets an encoded (optionally) value to the specified cookie.
   * @param {string} key The cookie key
   * @param {(string|number)} value The value to assign
   * @param {boolean} [encode=true] Whether to URI encode the value
   * @example
   * utils.cookie.setItem('testCookie', '{"a":"1","b":"2"}');
   * document.cookie; // 'testCookie=%7B%22a%22%3A%221%22%2C%22b%22%3A%222%22%7D'
   */
  setItem(key, value, encode = true) {
    const result = encode ? `${key}=${encodeURIComponent(value)}` : `${key}=${value}`;
    this.#debug(`cookie: set item '${result}'${encode ? ' (encoded)' : ''}`);
    document.cookie = result;
  }

  /**
   * Appends an encoded (optionally) value to the specifiec cookie.
   * @param {string} key The cookie key
   * @param {(string|number)} value The value to append
   * @param {boolean} [encode=true] Whether to URI encode the value
   * @example
   * document.cookie = 'throttle=|EnableTest1';
   * utils.cookie.appendItem('|EnableTest2');
   * document.cookie; // 'throttle=%7CEnableTest1%7CEnableTest2'
   */
  appendItem(key, value, encode = true) {
    const existingValue = this.getItem(key, false);
    const newValue = `${existingValue}${encode ? encodeURIComponent(value) : value}`;
    this.setItem(key, newValue, false);
  }
}

export default CookieMethods;
