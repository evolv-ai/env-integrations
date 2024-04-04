import { version } from '../package.json';

export default function () {
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
      interstitialPage: (url) => /\/sales\/nextgen\/offerinterstitial\.html.*\//i.test(url),
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

      if (URLCriteria.interstitialPage(url)) {
        interstitialPage();
      } else if (URLCriteria.dpPages(url)) {
        dpPages();
      } else if (URLCriteria.cartPage(url)) {
        cartPage();
      }
    }

    function updateSessionStorage(lineIndex) {
      const url = window.location.href;

      // Only run if you're on an approved page (mutate functions could span pages due to SPA nav)
      if (['interstitialPage', 'cartPage'].every(key => !URLCriteria[key](url))) return;

      const deviceValuesRaw = window.vzdl?.txn?.product?.current
        ?.filter(product => product.category.toLowerCase() === 'device')
        ?.map((device, deviceIndex) => {
          const properties = (({ name, fullRetailPrice }) => ({
            name,
            fullRetailPrice
          }))(device)
          
          if (properties.fullRetailPrice) {
            properties.fullRetailPrice = parseFloat(properties.fullRetailPrice);
          }

          if (URLCriteria.interstitialPage(url)) {
            properties.nseSmartphone = true;
          } else if (URLCriteria.cartPage(url)) {
            properties.nseSmartphone = deviceValuesOld?.[deviceIndex]?.nseSmartphone || false;
          }

          return properties;
        });

      let sessionStorageNew;
    }


  });

    // Wait for initial criteria

    // Setup
    
    // Modify URL Criteria from PDP to Offer Interstitial

    // Fail proceedure

    // Modify CheckURL for Offer Interstitial

    // Function to Update Session Storage

    // Function to run on Offer Interstitial
    
      // Get full retail price & name from current product vzdl
      // Get line number from sticky header
      // Publish to sessionStorage

    // Function for DP pages
      
      // Get session storage
        // parse session string to JSON
        // convert price from string to number
        // convert line number from string to number
            
      // Find the device bind price to remoteContext

    // Cart Page

      // Monitor for changes to cart
      function cartPage() {
        log(`init: cart page - v${version}`);

        if (cartHasLoaded) return;

        let isWaiting = false;
        let productCurrentOld = JSON.stringify(window.vzdl.txn.product.current);

        function waitForProductChange() {
          if (isWaiting) return;
          isWaiting = true;

          waitFor(() => JSON.stringify(window.vzdl.txn.product.current) !== productCurrentOld)
            .then(() => {
              updateSessionStorage();
              isWaiting = false;
            });
        }

      // Update sessionStorage with most recent devices
        $mu('.cart', 'int-device-data-pdp-watcher')
          .customMutation(() => waitForProductChange(), () => waitForProductChange());
  
        cartHasLoaded = true;
      }

    // Monitor URL
    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
}