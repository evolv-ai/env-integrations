/**
 *
 * @param {Utils} utils The current Utils object.
 */
export default function initNamespace(utils) {
  const { body } = document;
  const { addClass, removeClass, toRevert, isNewConfig, config, log } = utils;

  const namespacePrefix = config?.namespace_prefix || 'evolv';
  const namespaceClasses = new Set();
  let bodyClassObserver;
  let bodyClassObserving = false;

  function updateBodyClasses() {
    if (!bodyClassObserving) {
      return;
    }
    namespaceClasses.forEach((className) => addClass(body, className));
  }

  function revertBodyClasses() {
    bodyClassObserving = false;
    bodyClassObserver.disconnect();
    namespaceClasses.forEach((className) => {
      log(`namespace: revert '${className}'`);
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
    const prefix = isNewConfig
      ? `${namespacePrefix}-${config.id}`
      : namespacePrefix;

    function handleClass(className) {
      if (namespaceClasses.has(className)) {
        return;
      }

      log(`namespace: add '${className}'`);
      addClass(body, className, true);
      namespaceClasses.add(className);
    }

    handleClass(prefix);

    args.reduce((acc, cur) => {
      const className = [acc, cur].join('-');
      handleClass(className);
      return className;
    }, prefix);

    if (!bodyClassObserver && !bodyClassObserving) {
      initBodyClassObserver();
    }
  }

  return namespace;
}
