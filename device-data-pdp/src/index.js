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

  waitFor(() => window.evolv?.utils).then((utilsGlobal) => {
    const utils = utilsGlobal.init('int-device-data-pdp');
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;
    const sessionKey = 'evolv:device-data-pdp';
    const webURL = 'web.url';

    // Procedure if requirements are not met
    function fail(message) {
      warn(message);
      mutate.revert();
      sessionStorage.removeItem(sessionKey);
      window.evolv.client.contaminate({
        reason: 'requirements-unmet',
        details: message,
      });
    }

    function checkURL(event, key, url) {
      if (!(key === webURL)) return;

      if (/\/smartphones\/(?!.*-certified-pre-owned).*\//.test(url)) {
        pdpPage();
      } else if (/\/sales\/nextgen\/protection(\/options)?\.html/.test(url)) {
        dpPages();
      }
    }

    function pdpPage() {
      log(`init: pdp page - v${version}`);
      // const exampleValue = true;

      waitFor(() => window.vzdl?.txn?.product?.current?.[0]).then(
        (deviceValues) => {
          const deviceValuesEdited = JSON.stringify(
            (({ name, nonRecurringPrice, productId }) => ({
              name,
              nonRecurringPrice,
              productId,
            }))(deviceValues)
          );
          log(
            `Set sessionStorage item '${sessionKey}' to ${deviceValuesEdited}`
          );
          sessionStorage.setItem(sessionKey, deviceValuesEdited);
        }
      );
    }

    function dpPages() {
      log(`init: dp pages - v${version}`);
      const deviceValues = sessionStorage.getItem(sessionKey);

      if (!deviceValues) {
        fail(`Session storage item '${sessionKey}' was not found`);
      }

      // sessionStorage is always a string, so convert to boolean
      const deviceValuesObj = JSON.parse(deviceValues);

      Object.keys(deviceValuesObj).forEach((key) => {
        const contextKey = `vz.device.${key}`;
        const contextValue = deviceValuesObj[key];
        log(
          `Bind '${contextKey}': '${contextValue}' to evolv.context.remoteContext`
        );
        window.evolv.context.set(contextKey, contextValue);
      });
    }

    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  });
}
