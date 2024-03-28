import { version } from '../package.json';

module.exports = (config) => {
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

  waitFor(() => window.evolv?.utils).then(utilsGlobal => {
    utilsGlobal.init('int-example');
    const utils = utilsGlobal['int-example'];
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;
    const sessionKey = 'evolv:example-value';
    const contextKey = 'vz.exampleValue';
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

      if (/\/example\/page\/1\//.test(url)) {
        examplePage1();
      } else if (/\/example\/page\/2\//.test(url)) {
        examplePage2();
      }
    }

    function examplePage1() {
      log(`init: example page 1 - v${version}`);
      const exampleValue = true;

      waitFor(() => exampleValue).then(exampleValue => {
        log(`Set sessionStorage item '${sessionKey}' to ${exampleValue}`);
        sessionStorage.setItem(sessionKey, exampleValue);
      });
    }

    function examplePage2() {
      log(`init: example page 2 - v${version}`);
      const exampleValueString = sessionStorage.getItem(sessionKey);

      if (!exampleValueString) {
        fail(`Session storage item '${sessionKey}' was not found`);
      }

      // sessionStorage is always a string, so convert to boolean
      const exampleValue = exampleValueString.toLowerCase === 'true'; 

      log(`Bind '${contextKey}' to evolv.context.remoteContext`);
      window.evolv.context.set(contextKey, exampleValue);
    }
  
    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  });
};
