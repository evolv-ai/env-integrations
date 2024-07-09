const logs = {};

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

logs.init = (id, config) => {
  const logLevel =
    localStorage
      .getItem('evolv:logs')
      ?.match(/normal|debug/i)?.[0]
      .toLowerCase() || 'silent';

  const logPrefixNormal = getlogPrefix(id, 1);
  const logPrefixDebug = getlogPrefix(id, 0.5);

  /***
   * Logs a message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   *    to <code>normal</code> or <code>debug</code>.
   * @param {...any} args - The message to log.
   */
  const log = (...args) => {
    if (logLevel === 'normal' || logLevel === 'debug') {
      console.log(...logPrefixNormal, ...args);
    }
  };

  /***
   * Logs a warning to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   *    to <code>normal</code> or <code>debug</code>.
   * @param {...any} args - The warning to log.
   */
  const warn = (...args) => {
    if (logLevel === 'normal' || logLevel === 'debug') {
      console.warn(...logPrefixNormal, ...args);
    }
  };

  /***
   * Logs an debug message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   *    to <code>debug</code>.
   * @param {...any} args - The debug message to log.
   */
  const debug = (...args) => {
    if (logLevel === 'debug') {
      console.log(...logPrefixDebug, ...args);
    }
  };

  /***
   * Logs the description of a context, variable, or variant from <code>evolv-config.json</code> to the console.
   * @param {string} context - The context id.
   * @param {string} variable - The variable id.
   * @param {string} variant - The variant id.
   */
  const describe = (context, variable, variant) => {
    const type = ['context', 'variable', 'variant'];
    let typeIndex;
    const item = [context, variable, variant].reduce((acc, cur, index) => {
      if (cur) {
        const next = acc[`${type[index]}s`].find((v) => v.id === cur);
        typeIndex = index;
        return next;
      }
      return acc;
    }, config);
    log(`init ${type[typeIndex]}:`, item.display_name.toLowerCase());
  };

  return {
    logLevel,
    log,
    warn,
    debug,
    describe,
  };
};

export default logs;
