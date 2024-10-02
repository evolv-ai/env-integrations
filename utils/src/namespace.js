/**
 *
 * @param {Utils} utils The current Utils object.
 */
export default function initNamespace(utils) {
  const { body } = document;
  const { addClass, removeClass, toRevert } = utils;

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
    namespaceClasses.forEach((className) => removeClass(body, className));
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
    const className = ['evolv', ...args].join('-');
    addClass(body, className);
    namespaceClasses.add(className);
    if (!bodyClassObserver && !bodyClassObserving) {
      initBodyClassObserver();
    }
  }

  return namespace;
}
