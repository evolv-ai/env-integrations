import { version } from '../package.json';

export default function (config) {
  function waitFor(callback, timeout = 5000, interval = 25) {
    return new Promise((resolve, reject) => {
      let poll;
      const timer = setTimeout(() => {
        clearInterval(poll);
        reject();
      }, timeout);
      poll = setInterval(() => {
        const result = callback();
        if (result) {
          clearInterval(poll);
          clearTimeout(timer);
          resolve(result);
        }
      }, interval);
    });
  }

  waitFor(() => window.evolv?.utils && window.vzdl?.page?.flow && window.vzdl.user?.authStatus).then(() => {
    const sandboxKey = 'int-device-data-pdp'
    const utils = window.evolv.utils.init(sandboxKey);
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;
    const sessionKey = 'evolv:device-data-pdp';
    const webURL = 'web.url';
    let dpHasLoaded = false;
    let cartHasLoaded = false;

    // Procedure if requirements are not met
    function fail(message) {
      warn(message);
      mutate.revert();
      sessionStorage.removeItem(sessionKey);
      window.evolv.client.contaminate({
        reason: 'requirements-unmet',
        details: `[${sandboxKey}] ${message}`,
      });
    }

    function checkURL(event, key, url) {
      if (!(key === webURL)) return;
      if (/logged\sin/i.test(window.vzdl.user.authStatus)) return; // Exclude customer

      if (/\/smartphones\/(?!.*-certified-pre-owned).*\//i.test(url)) {
        pdpPage();
      } else if (
        /\/sales\/nextgen\/protection(\/options)?\.html/i.test(url)
        && !/^nso$/i.test(window.vzdl.page.flow) // Exclude BYOD
        ) {
        dpPages();
      } else if (/\/sales\/nextgen\/expresscart\.html/i.test(url)) {
        cartPage();
      }
    }

    function updateSessionStorage(lineIndex) {
      let deviceValues;

      const deviceValuesRaw = window.vzdl?.txn?.product?.current?.filter(product => product.category.toLowerCase() === 'device')?.map(product => {
        return (({ name, nonRecurringPrice, productId }) => ({
            name,
            nonRecurringPrice,
            productId,
          }))(product)
      });

      if (lineIndex >= 0) {
        const deviceValuesArray = [];
        deviceValuesArray[lineIndex] = deviceValuesRaw[0];
        deviceValues = JSON.stringify(deviceValuesArray);
      } else {
        deviceValues = JSON.stringify(deviceValuesRaw);
      }

      if (!deviceValues || deviceValues.length < 1) return;

      log(
        `Set sessionStorage item '${sessionKey}' to ${deviceValues}`
      );

      sessionStorage.setItem(sessionKey, deviceValues);
    }

    function pdpPage() {
      log(`init: pdp page - v${version}`);
      const mtn = sessionStorage.getItem('SELECTED_PROSPECT_MTN');

      const lineIndex = mtn ? parseInt( mtn.match(/newLine(\d{1,})/)?.[1], 10) : 0;
      waitFor(() => window.vzdl?.txn?.product?.current?.[0]).then(() => updateSessionStorage(lineIndex));
    }

    function dpPages() {
      log(`init: dp pages - v${version}`);
      const deviceValues = sessionStorage.getItem(sessionKey);

      if (!deviceValues) {
        fail(`Session storage item '${sessionKey}' was not found`);
      }

      if (dpHasLoaded) return;

      $mu('#stickydevice-device-line-info', 'line').customMutation((state, lineElement) => {
        const lineIndex = parseInt(lineElement.textContent.match(/Line (\d{1,})/)?.[1], 10) - 1;
        if (!(lineIndex >= 0)) fail('No line number');

        const deviceValuesObj = JSON.parse(deviceValues);
        const device = deviceValuesObj[lineIndex];

        Object.keys(device).forEach((key) => {
          const contextKey = `vz.device.${key}`;
          const contextValue = (key === 'nonRecurringPrice') ? parseFloat(device[key]) : device[key];

          log(
            `Bind '${contextKey}': '${contextValue}' to evolv.context.remoteContext`
          );
          window.evolv.context.set(contextKey, contextValue);
        });
      })

      dpHasLoaded = true;
    }

    function cartPage() {
      log(`init: cart page - v${version}`);

      if (cartHasLoaded) return;
      $mu('.cart', 'int-device-data-pdp-device-watcher').customMutation(updateSessionStorage, updateSessionStorage);

      cartHasLoaded = true;
    }

    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  });
}
