import Utils from './Utils.js';
import { VERSION } from './global.js';

/**
 * Creates a new Utils sandbox at the location `window.evolv.utils.<id>`. A sandbox with the same id will persist between contexts if the page has not reloaded.
 * @param {String} id A unique key for identifying the utils sandbox
 * @param {Object} [config] An object containing the project definition
 * @returns {Utils} A reference to the newly created Utils instance
 */
function init(id, config) {
  // Backwards compatibility
  const utilsId = typeof id === 'object' ? id.id : id;
  const utilsConfig = typeof id === 'object' ? id : config;

  const utilsOld = utilsId ? window.evolv.utils?.[utilsId] : window.evolv.utils;
  if (utilsOld) {
    return utilsOld;
  }

  const utilsNew = new Utils(utilsId, utilsConfig);
  if (utilsId) {
    window.evolv.utils[utilsId] = utilsNew;
  }

  return utilsNew;
}

function processConfig() {
  window.evolv ??= {};
  window.evolv.utils ??= init();
  window.evolv.utils.init ??= init;
  window.evolv.utils.debug(`init evolv-utils version ${VERSION}`);
  document.documentElement.dispatchEvent(new CustomEvent('evolvutilsinit'));
}

export default processConfig;
