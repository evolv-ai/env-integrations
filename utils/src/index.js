import Utils from './Utils.js';

/**
 * Creates a new Utils sandbox at the location `window.evolv.utils.<id>`. A sandbox with the same id will persist between contexts if the page has not reloaded.
 * @param {String} id A unique key for identifying the utils sandbox
 * @param {Object} [config] An object containing the project definition
 * @returns {Utils} A reference to the newly created Utils instance
 */
function init(id, config) {
  const utilsOld = id ? window.evolv.utils?.[id] : window.evolv.utils;
  if (utilsOld) {
    return utilsOld;
  }

  const utilsNew = new Utils(id, config);
  if (id) {
    window.evolv.utils[id] = utilsNew;
  }

  return utilsNew;
}

function processConfig() {
  window.evolv ??= {};
  window.evolv.utils ??= init();
  window.evolv.utils.init ??= init;
  document.documentElement.dispatchEvent(new CustomEvent('evolvutilsinit'));
}

export default processConfig;
