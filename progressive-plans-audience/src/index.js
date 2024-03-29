import { version } from '../package.json';

export default (config) => {
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

  waitFor(() => window.evolv?.utils && window.vzdl?.page?.flow).then(() => {
    const sandboxKey = 'int-progressive-plans-audience';
    const utils = window.evolv.utils.init(sandboxKey);
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;
    const contextKey = 'vz.AAL-banner';
    const webURL = 'web.url';
    utils.hasRun ??= false;

    // Procedure if requirements are not met
    function fail(message) {
      warn(message);
      mutate.revert();
      sessionStorage.removeItem(sessionKey);
      window.evolv.client.contaminate({
        reason: 'requirements-unmet',
        details: `${sandboxKey} ${message}`,
      });
    }

    function isProgressivePlansPage(url = window.location.href) {
      return /\/sales\/nextgen\/plans\/progressiveplans\.html/i.test(url) // /sales/nextgen/plans/progressiveplans.html
        && /aal/i.test(window.vzdl.page.flow) // in AAL flow
    }

    function checkURL(event, key, url) {
      if (!(key === webURL)) return;

      if (isProgressivePlansPage(url)) {
        progressivePlansPage();
      }
    }

    function progressivePlansPage() {
      log(`init: progressive plans page - v${version}`);

      if (utils.hasRun) return;

      const planReference = [
        {
          'Unlimited Ultimate': 90,
          'Unlimited Plus': 80,
          'Unlimited Welcome': 65,
        },
        {
          'Unlimited Ultimate': 75,
          'Unlimited Plus': 65,
          'Unlimited Welcome': 50,
        },
        {
          'Unlimited Ultimate': 65,
          'Unlimited Plus': 55,
          'Unlimited Welcome': 40,
        }
      ]

      const planPricing = {}

      $mu('//h2[@regularweight="light"][contains(text(), "Unlimited")]/ancestor::div[2]', 'int-progressive-plan-audience-tile-heading')
        .customMutation((state, tileHeading) => {
          if (!isProgressivePlansPage) return;

          const planPrices = {};
          const planName = tileHeading.querySelector('h2').textContent;
          const planPrice = parseInt(tileHeading.querySelector('span[regularweight="light"] span').textContent.match(/\$(\d+)/)[1], 10);
          const planAutoPayText = Array.from(tileHeading.querySelectorAll('span')).find(span => /With(out)? Auto Pay/.test(span.textContent)).textContent;
          let planAutoPay;

          if (!planName || !planPrice || !planAutoPayText) {
            fail(`planName: ${planName}, planPrice: ${planPrice}, planAutoPayText: ${planAutoPayText}`)
          }

          if (planAutoPayText?.includes('Without')) {
            planAutoPay = false;
          } else if (planAutoPayText?.includes('With')) {
            planAutoPay = true;
          } else {
            fail('Autopay status not found')
          }

          planPricing[planName] = planAutoPay ? planPrice : planPrice + 10;
          
          if (Object.keys(planPricing).length === 3) {
            const planReferenceIndex = planReference.findIndex(planGroup => Object.keys(planPricing).every(name => planPricing[name] === planGroup[name]))
            log(`Bind '${contextKey}' to evolv.context.remoteContext`);
            window.evolv.context.set(contextKey, planReferenceIndex);
          }

          utils.hasRun = true;
        });
    }
  
    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  });
};
