'use strict';

function processConfig() {
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
    utilsGlobal.init('int-upgrade-eligibility');
    const utils = utilsGlobal['int-upgrade-eligibility'];
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;
    let oldURL = null;

    function fail(message) {
      warn(message);
      mutate.revert();
      ['evolv:upgrade-eligibility', 'evolv:cpc-iphone', 'evolv:cpc-upgrade-eligible']
        .forEach(item => localStorage.removeItem(item));
      window.evolv.client.contaminate({
        reason: 'requirements-missing',
        details: message,
      });
    }

    function accountOverviewPage() {
      log('init: overview page');
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      let paginationButtons = null;
      const paginationMin = 1;
      let paginationIndex = paginationMin + 1;
      let paginationMax = null;
      let complete = false;
      let tileIndex = 0;
      let tileUpgradeStatus = {};

      function getIsReady(spans) {
          return spans.some(span => span.textContent === 'Ready for upgrade');
      }

      function getPhone(spans) {
          return spans.find(span => span.childNodes[0]?.data?.match(/\d{3}\.\d{3}\.\d{4}/))?.textContent?.replaceAll('.', '');
      }

      function setStorage() {
          complete = true;
          const tileUpgradeStatusString = JSON.stringify(tileUpgradeStatus);
          log (`set localStorage item 'evolv:upgrade-eligibility' to '${tileUpgradeStatusString}'`);
          localStorage.setItem('evolv:upgrade-eligibility', tileUpgradeStatusString);
      }

      if (isMobile) {
          collect('div[data-polymap="deviceSection"] .slick-dots button', 'pagination');
          collect('div[data-polymap="deviceSection"] .slick-slide', 'device-tile');
          
      } else {
          collect('div[data-polymap="deviceSection"] li[class*="PaginationListItem-VDS__"] button', 'pagination');
          collect('//div[@data-polymap="deviceSection"]//div[contains(@class, "grid-column")]//div[contains(@class, "grid-column")]', 'device-tile');
      }
      
      mutate('device-tile').customMutation((state, tile) => {
          if (complete) return;
          
          const tileMax = isMobile ? tile.parentNode.childNodes.length : tile.parentNode.parentNode.childNodes.length;
          
          paginationButtons ??= collect.get('pagination').elements;
          paginationMax = paginationMax || paginationButtons.length - 1;
          
          const spans = Array.from(tile.querySelectorAll('span'));
          const phone = getPhone(spans);
          
          if (phone) {
              let isReady = getIsReady(spans);
              
              if (isReady) {
                  tileUpgradeStatus[phone] = true;
              } else {
                  tileUpgradeStatus[phone] = false;
              }
          }
          
          if (tileIndex < tileMax - 1) {
              tileIndex += 1;
          } else if (paginationButtons.length && (paginationIndex < paginationMax)) { 
              debug('click pagination:', paginationIndex);
              paginationButtons[paginationIndex].click();
              paginationIndex += 1;
              tileIndex = 0;
          } else if (paginationButtons.length && (paginationIndex === paginationMax)) {
              debug('click pagination:', paginationMin);
              paginationButtons[paginationMin].click();
              setStorage();
          } else {
              setStorage();
          }
      });
    }

    function dataselectorPage() {
      log('init: dataselector page');

      utils.isObjectEmpty ??= (object) => {
          return Object.keys(object).length === 0 && object.constructor === Object;
      };
      
      utils.getPersistRoot ??= () => {
          const persistRootRaw = JSON.parse(sessionStorage.getItem('persist:root'));
          const persistRoot = {};
          Object.keys(persistRootRaw).forEach(key => {
              persistRoot[key] = JSON.parse(persistRootRaw[key]);
          });
          return utils.isObjectEmpty(persistRoot) ? null : persistRoot;
      };
      
      let foundPhone = false;
      
      function getIsUpgradeEligible(phone) {
          const JSONstring = localStorage.getItem('evolv:upgrade-eligibility');
          
          if (!JSONstring) {
            fail('No localStorage item "evolv:upgrade-eligibility" set');
            return;
          }
      
          const upgradeEligibility = JSON.parse(JSONstring);
          const lineEligible = upgradeEligibility[phone];
          
          if (lineEligible === undefined) {
            fail(`Upgrade eligibility for ${phone} not set`);
            return
          }

          return lineEligible;
      }
      
      function getIsIPhone(phone) {
          const persistRoot = utils.getPersistRoot();
          
          if (!persistRoot) {
              fail(`No sessionStorage item 'persist:root' set`);
            return;
          }
      
          return !!persistRoot.PMD.sectionContentMetaData.sections[0]
              .data.planItemsDataList
              .find(entry => entry.mdn === phone)
              ?.productDisplayName?.match(/iPhone/)
      }
      
      $mu('//img/ancestor::div[2]/following-sibling::div/p[last()]').customMutation((state, p) => {
          if (foundPhone) return;
      
          const phone = p.textContent.match(/\d{3}-\d{3}-\d{4}/)?.[0]?.replaceAll('-', '');
          if (!phone) return;
          
          const isIPhone = getIsIPhone(phone);
          const isUpgradeEligible = getIsUpgradeEligible(phone);

          debug(`set localStorage item 'evolv:cpc-iphone' to '${isIPhone}'`);
          localStorage.setItem('evolv:cpc-iphone', isIPhone);

          debug(`set localStorage item 'evolv:cpc-upgrade-eligible' to '${isUpgradeEligible}'`);
          localStorage.setItem('evolv:cpc-upgrade-eligible', isUpgradeEligible);
          
          debug(`set remoteContext item 'vz.CPCIPhone' to '${isIPhone}'`);
          window.evolv.context.set('vz.CPCIPhone', isIPhone);

          debug(`set remoteContext item 'vz.CPCUpgradeEligible' to '${isUpgradeEligible}'`);
          window.evolv.context.set('vz.CPCUpgradeEligible', isUpgradeEligible);
          
          foundPhone = true;
      });
    }
  
    function confirmPage() {
      log('init: confirmation page');

      const isIPhone = localStorage.getItem('evolv:cpc-iphone') === 'true';
      const isUpgradeEligible = localStorage.getItem('evolv:cpc-upgrade-eligible') === 'true';

      debug(`set remoteContext item 'vz.CPCIPhone' to '${isIPhone}'`);
      window.evolv.context.set('vz.CPCIPhone', isIPhone);

      debug(`set remoteContext item 'vz.CPCUpgradeEligible' to '${isUpgradeEligible}'`);
      window.evolv.context.set('vz.CPCUpgradeEligible', isUpgradeEligible);
    }
  
    function checkURL() {
      const newURL = window.location.href;
      if (newURL === oldURL) return;

      if (/\/digital\/nsa\/secure\/ui\/udb\/#\//.test(window.location.href)) {
        accountOverviewPage();
      } else if (/\/digital\/nsa\/secure\/ui\/cpc\/#\/dataselector(perks)?/.test(window.location.href)) {
        dataselectorPage();
      } else if (/\/digital\/nsa\/secure\/ui\/cpc\/#\/confirm/.test(window.location.href)) {
        confirmPage();
      }

      oldURL = newURL;
    }

    checkURL();
    $mu('#route-page-container').customMutation(checkURL, checkURL);
  });
}

module.exports = processConfig;
