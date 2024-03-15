import { version } from '../package.json';

export default function integration() {
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
    let oldURL = null;

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
        fail(`'${sessionKey}' was not found`);
      }

      // sessionStorage is always a string, so convert to boolean
      const exampleValue = exampleValueString.toLowerCase === 'true'; 

      log(`Bind '${contextKey}' to evolv.context.remoteContext`);
      window.evolv.context.set(contextKey, exampleValue);
    }
  
    function checkURL() {
      const newURL = window.location.href;
      if (newURL === oldURL) return;

      if (/\/example\/page\/1\//.test(window.location.href)) {
        examplePage1();
      } else if (/\/example\/page\/2\//.test(window.location.href)) {
        examplePage2();
      }

      oldURL = newURL;
    }

    checkURL();

    // The ideal reference point is going to be the container who's contents
    // change with the URL during SPA navigation. By running the `checkURL`
    // function on both initialization and modification you can monitor the URL
    // without having to monkey-patch popState
    $mu('#example-app-container').customMutation(checkURL, checkURL);
  });
};
