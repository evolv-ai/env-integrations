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
    const URLCriteria = {
      pdpPage: (url) => /\/smartphones\/(?!.*-certified-pre-owned).*\//i.test(url),
      dpPages: (url) => /\/sales\/nextgen\/protection(\/options)?\.html/i.test(url)
      && !/^nso$/i.test(window.vzdl.page.flow),
      cartPage: (url) => /\/sales\/nextgen\/expresscart\.html/i.test(url)
    }
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

      if (URLCriteria.pdpPage(url)) {
        pdpPage();
      } else if (URLCriteria.dpPages(url)) {
        dpPages();
      } else if (URLCriteria.cartPage(url)) {
        cartPage();
      }
    }

    function updateSessionStorage(lineIndex) {
      const url = window.location.href;

      // Only run if you're on an approved page (mutate functions could span pages due to SPA nav)
      if (Object.keys(URLCriteria).every(key => !URLCriteria[key](url))) return;

      const sessionStorageOld = sessionStorage.getItem(sessionKey);
      let deviceValuesOld;

      if (sessionStorageOld) {
        deviceValuesOld = JSON.parse(sessionStorageOld);
      }

      const deviceValuesRaw = window.vzdl?.txn?.product?.current?.filter(product => product.category.toLowerCase() === 'device')?.map(device => {
        const properties = (({ name, nonRecurringPrice, productId }) => ({
            name,
            nonRecurringPrice,
            productId,
          }))(device)
        
        if (properties.nonRecurringPrice) {
          properties.nonRecurringPrice = parseFloat(properties.nonRecurringPrice);
        }

        if (URLCriteria.pdpPage(url)) {
          properties.nseSmartphone = true;
        } else {
          const deviceOld = deviceValuesOld?.find(deviceValueOld => deviceValueOld.productId === device.productId);
          properties.nseSmartphone = deviceOld?.nseSmartphone || false;
        }

        return properties;
      });

      let sessionStorageNew;

      if (lineIndex >= 0) {
        const deviceValuesArray = [];
        deviceValuesArray[lineIndex] = deviceValuesRaw[0];
        sessionStorageNew = JSON.stringify(deviceValuesArray);
      } else {
        sessionStorageNew = JSON.stringify(deviceValuesRaw);
      }

      if (!sessionStorageNew || sessionStorageNew === sessionStorageOld) return;

      log(
        `Set sessionStorage item '${sessionKey}' to ${deviceValues}`
      );

      sessionStorage.setItem(sessionKey, deviceValues);
    }

    function pdpPage() {
      log(`init: pdp page - v${version}`);
      const mtn = sessionStorage.getItem('SELECTED_PROSPECT_MTN');
      const lineIndex = mtn ? parseInt( mtn.match(/newLine(\d+)/)?.[1], 10) : 0;
      waitFor(() => window.vzdl?.txn?.product?.current?.[0]).then(() => updateSessionStorage(lineIndex));
    }

    function dpPages() {
      log(`init: dp pages - v${version}`);

      if (dpHasLoaded) return; // Prevents multiple instances of collector

      $mu('#stickydevice-device-line-info', 'int-device-data-pdp-line').customMutation((state, lineElement) => {
        const href = window.location.href;
        const deviceValues = sessionStorage.getItem(sessionKey);

        if (!URLCriteria.dpPages(href)) {
          warn(`'${href}' does not meet URL criteria`);
          return;
        }

        if (!deviceValues) {
          warn(`No sessionStorage item '${sessionKey}' found`);
          return;
        }

        const lineIndex = parseInt(lineElement.textContent?.match(/Line (\d+)/)?.[1], 10) - 1;
        if (!(lineIndex >= 0)) {
          warn('No line number');
          return;
        }

        const deviceValuesObj = JSON.parse(deviceValues);
        const device = deviceValuesObj[lineIndex];

        if (!device) {
          warn(`Line ${lineIndex} not found in '${sessionKey}`)
          return;
        }

        Object.keys(device).forEach((key) => {
          const contextKey = `vz.device.${key}`;
          const contextValue = device[key];

          if (window.evolv.context.get(contextKey) === contextValue) return;

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
      $mu('.cart', 'int-device-data-pdp-watcher').customMutation(() => updateSessionStorage(), () => updateSessionStorage());

      cartHasLoaded = true;
    }

    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  });
}
