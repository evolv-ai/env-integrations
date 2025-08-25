// Allows the Fios TFN Hotfix to only apply during customer service hours
// M-F 8am - 7pm ET
// Sat 8am - 5pm ET

const version = '1.0.2';
function init () {
  const id = 'fios-tfn-hotfix-hours'
  const utils = window.evolv.utils.init(id);
  const { debug } = utils;
  const urlPattern = /https:\/\/www\.verizon\.com\/inhome\/(buildproducts|popularplans|ordersummary|checkout)/i;
  const binding = 'vz.fiosTFNHotfixHours';
  const webURL = 'web.url';

  function checkURL(event, key, url) {
    if (!(key === webURL)) return;

    if (urlPattern.test(url)) {
      debug(`init ${id} version ${version}`);

      const now = Date.now();
      const isDaylightSavings = Date.UTC(2025, 11, 2, 4) > now;

      // Offsets UTC by ET to refer to ET from anywhere on the globe
      const offsetET = (isDaylightSavings ? 4 : 5) * 60 * 60 * 1000;
      const DateET = new Date(now - offsetET);
      const nowET = DateET.getTime();
      const yearET = DateET.getUTCFullYear();
      const monthET = DateET.getUTCMonth();
      const dateET = DateET.getUTCDate();
      const dayET = DateET.getUTCDay();

      let openET, closeET
      switch (dayET) {
        case 5: // Sat
          openET = Date.UTC(yearET, monthET, dateET, 8);
          closeET = Date.UTC(yearET, monthET, dateET, 17);
          break;
        case 6: // Sun
          break;
        default: // Mon-Fri
          openET = Date.UTC(yearET, monthET, dateET, 8);
          closeET = Date.UTC(yearET, monthET, dateET, 19);
          break;
      }

      if (nowET >= openET && nowET <= closeET) {
        debug(`set remote context '${binding}' to true`);
        window.evolv.context.set(binding, true);
      }
    }
  }

  checkURL('init', webURL, evolv.context.get(webURL));
  evolv.client.on('context.value.added', checkURL);
  evolv.client.on('context.value.changed', checkURL);
}

if (window.evolv?.utils) {
  init();
} else {
  document.documentElement.addEventListener('evolvutilsinit', init);
}