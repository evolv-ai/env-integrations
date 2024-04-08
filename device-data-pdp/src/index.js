import { version } from '../package.json';

export default function() {
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

  waitFor(() => window.evolv?.utils && window.vzdl?.page?.flow && window.vzdl.user?.authStatus, 10000).then(() => {
    const sandboxKey = 'int-device-data-pdp'
    const utils = window.evolv.utils.init(sandboxKey);
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;
    const sessionKey = 'evolv:device-data-pdp';
    const webURL = 'web.url';
    const URLCriteria = {
      interstitialPage: (url) => /\/sales\/nextgen\/offerinterstitial\.html/i.test(url),
      dpPages: (url) => /\/sales\/nextgen\/protection(\/options)?\.html/i.test(url)
        && !/^nso$/i.test(window.vzdl.page.flow),
      cartPage: (url) => /\/sales\/next(gen)?\/expresscart\.html/i.test(url)
    }
    let dpHasLoaded = false;
    let interstitialHasLoaded = false;
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

      if (URLCriteria.interstitialPage(url)) {
        interstitialPage();
      } else if (URLCriteria.dpPages(url)) {
        dpPages();
      } else if (URLCriteria.cartPage(url)) {
        cartPage();
      }
    }

    function getLineNumber(lineElement) {
      return parseInt(lineElement.textContent?.match(/Line (\d+)/)?.[1], 10);
    }

    function cartUpdateSessionStorage() {
      // Only run if you're on an approved page (mutate functions could span pages due to SPA nav)
      if (!URLCriteria.cartPage(window.location.href)) return;

      const vzdlDevices = window.vzdl?.txn?.product?.current
        ?.filter(product => product.category.toLowerCase() === 'device');
      
      const deviceDataString = sessionStorage.getItem(sessionKey);
      if (!deviceDataString) {
        warn(`No sessionStorage item '${sessionKey}' found`);
        return;
      }

      const deviceData = JSON.parse(deviceDataString);
      const deviceDataNew = {};

      vzdlDevices.forEach((vzdlDevice, index) => {
        const lineNumber = index + 1;
        const { name } = vzdlDevice;
        const price = vzdlDevice.fullRetailPrice;
        const nse = deviceData[lineNumber]?.nse || false;
        deviceDataNew[lineNumber] = { name, price, nse };
      });

      const sessionStorageNew = JSON.stringify(deviceDataNew);
      log (`Set sessionStorage item '${sessionKey}' to ${sessionStorageNew}`);
      sessionStorage.setItem(sessionKey, sessionStorageNew);
    }

    // Function to run on Offer Interstitial
    function interstitialPage() {
      log(`init: interstitial page - v${version}`);
      if (interstitialHasLoaded) return;

      $mu('#stickydevice-device-line-info', 'int-device-data-pdp-line')
        .customMutation((state, lineElement) => {

          // Prevents Mutate from loading this function on unauthorized pages due to SPA nav
          if (!URLCriteria.interstitialPage(window.location.href)) return;

          const lineNumber = getLineNumber(lineElement);
          if (!(lineNumber >= 0)) {
            warn('No line number');
            return;
          }
          const lineNumberString = lineNumber.toString();

          const deviceDataString = sessionStorage.getItem(sessionKey);
          if (!deviceDataString) {
            return;
          }

          const deviceData = JSON.parse(deviceDataString);

          const vzdlDevice = window.vzdl?.txn?.product?.current
            ?.find(device => device.selectedLineMdnHash === lineNumberString);

          const name = vzdlDevice.name;
          const price = vzdlDevice.fullRetailPrice;
          const nse = true;

          deviceData[lineNumber] = { name, price, nse };

          const sessionStorageNew = JSON.stringify(deviceData);
          
          log (`Set sessionStorage item '${sessionKey}' to ${sessionStorageNew}`);
          sessionStorage.setItem(sessionKey, sessionStorageNew);

          interstitialHasLoaded = true;
        });
    }

    // Function for DP pages
    function dpPages() {
      log(`init: dp pages - v${version}`);

      if (dpHasLoaded) return; // Prevents multiple instances of collector

      $mu('#stickydevice-device-line-info', 'int-device-data-pdp-line')
        .customMutation((state, lineElement) => {
          if (!URLCriteria.dpPages(window.location.href)) return;
          
          const deviceDataString = sessionStorage.getItem(sessionKey);

          if (!deviceDataString) {
            warn(`No sessionStorage item '${sessionKey}' found`);
            return;
          }

          const lineNumber = getLineNumber(lineElement);
          if (!(lineNumber >= 0)) {
            warn('No line number');
            return;
          }

          const deviceData = JSON.parse(deviceDataString);
          const device = deviceData[lineNumber];

          if (!device) {
            warn(`Line ${lineNumber} not found in sessionStorage item '${sessionKey}'`)
            return;
          }

          Object.keys(device).forEach((key) => {
            const contextKey = `vz.device.${key}`;
            const contextValue = device[key];

            if (window.evolv.context.get(contextKey) === contextValue) {
              log(
                `evolv.context.remoteContext property '${contextKey}': '${contextValue}' already bound`
              );
              return
            };

            log(
              `Bind '${contextKey}': '${contextValue}' to evolv.context.remoteContext`
            );

            window.evolv.context.set(contextKey, contextValue);
          });

          dpHasLoaded = true;
        });
    }

    function cartPage() {
      log(`init: cart page - v${version}`);

      if (cartHasLoaded) return;

      let isWaiting = false;
      let productCurrentOld;

      function waitForProductChange() {
        if (isWaiting) return;
        isWaiting = true;

        waitFor(() => JSON.stringify(window.vzdl?.txn?.product?.current) !== productCurrentOld)
          .then(() => {
            cartUpdateSessionStorage();
            productCurrentOld = JSON.stringify(window.vzdl.txn.product.current);
            isWaiting = false;
          }).catch(() => {
            isWaiting = false;
          });
      }

      // Update sessionStorage with most recent devices
      $mu('//div[contains(concat(" ", @class, " "), " cart ")] | //div[contains(@data-testid, "product-dev")]/parent::div', 'int-device-data-pdp-watcher')
        .customMutation(() => waitForProductChange(), () => waitForProductChange());

      collect('//div[contains(@id, "newLine")]').subscribe((action, element) => {
        if (action === 1) {
          log(element);
        }
      })

      cartHasLoaded = true;
    }

    // Monitor URL
    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);

  }, 10000).catch(() => {});
}