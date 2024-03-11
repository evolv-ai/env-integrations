export default function processConfig() {
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
    utilsGlobal.init('int-cpcueb');
    const utils = utilsGlobal['int-cpcueb'];
    const { log, debug, warn } = utils;
    const { collect, mutate, $mu } = window.evolv;

    function overview() {
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      let paginationButtons = null;
      const paginationIndexMin = isMobile ? 0 : 1;
      let paginationIndex = paginationIndexMin + 1;
      let paginationIndexMax = null;
      let complete = false;
      let tileUpgradeStatus = {};
      let timer;

      function getIsReady(spans) {
          return !!spans.some(span => span.textContent === 'Ready for upgrade');
      }

      function getPhone(spans) {
          return spans.find(span => span.childNodes[0]?.data?.match(/\d{3}\.\d{3}\.\d{4}/))?.textContent?.replaceAll('.', '');
      }

      function setStorage() {
          complete = true;
          log ('Setting localStorage item to', tileUpgradeStatus);
          localStorage.setItem('evolv:upgrade-eligibility', JSON.stringify(tileUpgradeStatus));
      }

      if (isMobile) {
          collect('div[data-polymap="deviceSection"] .slick-dots button', 'pagination');
          collect('div[data-polymap="deviceSection"] .slick-slide', 'device-tile');
      } else {
          collect('div[data-polymap="deviceSection"] li[class*="PaginationListItem-VDS__"] button', 'pagination');
          collect('//div[@data-polymap="deviceSection"]//div[contains(@class, "grid-column")]/parent::div[contains(@class, "grid-column")]', 'device-tile');
      }
      
      
      mutate('device-tile').customMutation((state, tile) => {
          if (complete) return;
          
          paginationButtons ??= collect.get('pagination').elements;
          paginationIndexMax = paginationIndexMax || paginationButtons.length - 1;
          
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
          
          clearTimeout(timer);
          if (isMobile || !paginationButtons.length) {
              timer = setTimeout(setStorage, 25);
          } else {
              timer = setTimeout(() => {
                  if (paginationIndex < paginationIndexMax) {
                      log('click pagination:', paginationIndex);
                      paginationButtons[paginationIndex].click();
                      paginationIndex += 1;
                  } else if (paginationIndex === paginationIndexMax) {
                      paginationButtons[paginationIndexMin].click();
                      setStorage();
                  }
              }, 25);
          }
      });
    }

    function dataselector() {
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
              const message = 'No localStorage item "evolv:upgrade-eligibility" set';
              warn(message);
              window.evolv.client.contaminate({
              reason: 'no-upgrade-eligibility',
              details: message,
            });
            return;
          }
      
          const upgradeEligibility = JSON.parse(JSONstring);
      
          return upgradeEligibility[phone];
      }
      
      function getIsIPhone(phone) {
          const persistRoot = utils.getPersistRoot();
          
          if (!persistRoot) {
              const message = 'No sessionStorage item "persist:root" set';
              warn(message);
              window.evolv.client.contaminate({
                  reason: 'no-persist-root',
                  details: message,
                });
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
      
          localStorage.setItem('evolv:cpc-is-iphone', isIPhone);
          localStorage.setItem('evolv:cpc-is-upgrade-eligible', isUpgradeEligible);
          
          window.evolv.context.set('vz.CPCIsIPhone', isIPhone);
          window.evolv.context.set('vz.CPCIsUpgradeEligible', isUpgradeEligible);
          
          foundPhone = true;
      });
    }
  
    function confirm() {
      localStorage.removeItem('evolv:upgrade-eligibility');
      localStorage.removeItem('evolv:cpc-is-iphone');
      localStorage.removeItem('evolv:cpc-is-upgrade-eligible');
    }
  
    if (/\/digital\/nsa\/secure\/ui\/udb\/#\//.test(window.location.href)) {
      overview();
    } else if (/\/digital\/nsa\/secure\/ui\/cpc\/#\/dataselector(perks)?/.test(window.location.href)) {
      dataselector();
    } else if (/\/digital\/nsa\/secure\/ui\/cpc\/#\/confirm/.test(window.location.href)) {
      confirm();
    }
  });
};
