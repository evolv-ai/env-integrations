/**
 *
 * @param {Utils} utils The current Utils object.
 */
export default function initNamespace(utils) {
  const { body } = document;
  const { addClass, removeClass, toRevert, isNewConfig, config, debug } = utils;

  const namespacePrefix = config?.namespace_prefix || 'evolv';
  const namespaceClasses = new Set();
  let bodyClassObserver;
  let bodyClassObserving = false;

  function updateBodyClasses() {
    if (!bodyClassObserving) {
      return;
    }

    namespaceClasses.forEach((className) => {
      if (!body.classList.contains(className)) {
        debug(`namespace: replace body class '${className}'`);
        body.classList.add(className);
      }
    });
  }

  function revertBodyClasses() {
    bodyClassObserving = false;
    bodyClassObserver.disconnect();
    namespaceClasses.forEach((className) => {
      debug(`namespace: revert body class '${className}'`);
      removeClass(body, className, true);
      namespaceClasses.delete(className);
    });
  }

  function initBodyClassObserver() {
    bodyClassObserver = new MutationObserver(updateBodyClasses);
    bodyClassObserver.observe(body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    bodyClassObserving = true;
    toRevert.push(revertBodyClasses);
  }

  function namespace(...args) {
    function handleClass(className) {
      if (namespaceClasses.has(className)) {
        return;
      }

      debug(`namespace: add body class '${className}'`);
      addClass(body, className, true);
      namespaceClasses.add(className);
    }

    if (isNewConfig) {
      [config.id, ...args].reduce((acc, cur) => {
        const className = [acc, cur].join('-');
        handleClass(className);
        return className;
      }, namespacePrefix);
    } else {
      handleClass([namespacePrefix, ...args].join('-'));
    }

    if (!bodyClassObserver && !bodyClassObserving) {
      initBodyClassObserver();
    }
  }

  return namespace;
}
