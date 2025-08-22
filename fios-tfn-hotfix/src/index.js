const version = '1.0.0';

function init () {
  const id = 'fios-tfn-hotfix-tod'
  const utils = window.evolv.utils.init(id);
  const { log, debug, warn, waitFor } = utils;
  const urlPattern = /https:\/\/www\.verizon\.com\/inhome\/(buildproducts\?lq2=y|popularplans|ordersummary|checkout)/i;
  const tag = 'vz.fiosTfnHotfixTod';
  const webURL = 'web.url';

  function checkURL(event, key, url) {
    if (!(key === webURL)) return;

    if (urlPattern.test(url)) {
      timeOfDay();
    }
  }

  function timeOfDay() {
    debug(`init ${id} version ${version}`);

    const now = new Date();
    const nowMs = now.getTime();
    const isDaylightSavings = Date.UTC(2025, 11, 2, 4) > nowMs;
    const utcOffset = isDaylightSavings ? 4 : 5;
    const hoursET = now.getUTC

      log(`emit ${tag}`);
      window.evolv.client.emit(tag);
  }

  checkURL('init', webURL, evolv.context.get(webURL));
  evolv.client.on('context.value.added', checkURL);
  evolv.client.on('context.value.changed', checkURL);
};

if (window.evolv?.utils) {
  init();
} else {
  document.documentElement.addEventListener('evolvutilsinit', init);
}
