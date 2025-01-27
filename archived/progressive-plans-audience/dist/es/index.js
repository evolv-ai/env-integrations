var version = "0.0.20";

var index = () => {
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
    const contextKey = 'vz.AALBanner';
    const webURL = 'web.url';
    utils.hasRun ??= false;

    // Procedure if requirements are not met
    function fail(message) {
      warn(message);
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
      ];

      const planPricing = {};

      $mu('//div[contains(@class, "InnerTileContainer")]//h3[contains(text(), "Unlimited")]/ancestor::div[2]', 'int-progressive-plan-audience-tile-heading')
        .customMutation((state, tileHeading) => {
          if (!isProgressivePlansPage()) return;

          const planTextPattern = /\$(\d+)(per\smonth\s*\/mo\*\s*|\s*)(with(out)?)\sauto\spay/i;
          const planName = tileHeading.querySelector('h3')?.textContent;

          if (!planName) {
            fail('No plan name');
            return;
          }

          let planTextMatch;

          Array.from(tileHeading.querySelectorAll('div')).find(div => {
            planTextMatch = div.textContent.match(planTextPattern);
            return planTextMatch;
          });

          if (!planTextMatch) {
            fail('No matching plan text found');
            return;
          }

          planPricing[planName] = planTextMatch[3].toLowerCase() === 'without' ? parseInt(planTextMatch[1], 10) : parseInt(planTextMatch[1], 10) + 10;

          if (!planPricing[planName]) {
            fail(`No plan price`);
          }
          
          if (Object.keys(planPricing).length === 3) {
            const planReferenceIndex = planReference.findIndex(planGroup => Object.keys(planPricing).every(name => planPricing[name] === planGroup[name]));
            log(`Bind '${contextKey}: ${planReferenceIndex}' to evolv.context.remoteContext`);
            window.evolv.context.set(contextKey, planReferenceIndex);
          }

          utils.hasRun = true;
        });
    }
  
    checkURL('init', webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  }).catch(() => {});
};

export { index as default };
