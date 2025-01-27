(function () {
  'use strict';

  const config = {
    name: 'AO Prospect Cart Refresh',
    version: '3.0.50',
    audience: 'Prospect D/T/M',
    kpi: 'OC-NSO-NSE.page-load',
    urls: 'https://www.verizon.com/sales/nextgen/expresscart.html and https://www.verizon.com/sales/nextgen/orderreview.html',
    contexts: [
      {
        id: 'psfec',
        display_name: 'Express Cart',
        variables: [
          {
            id: 'c1',
            display_name: 'C1 - Display pages using a different design',
            variants: [
              {
                id: 'v0',
                display_name: '0 - Control',
              },
              {
                id: 'v1',
                display_name:
                  '1 - New cart design and layout for device tiles with line totals',
              },
              {
                id: 'v2',
                display_name:
                  '2 - New cart design and layout for device tiles without line totals',
              },
            ],
          },
        ],
      },
    ],
  };

  const contextId = config.contexts[0].id;
  const utils = window.evolv.utils.init('psfec', config);
  const {
    log,
    warn,
    debug,
    describe,
    fail,
    throttle,
    addClass,
    removeClass,
    updateText,
    $,
    $$,
    makeElements,
  } = utils;

  ['name', 'version', 'audience', 'kpi'].forEach((prop) =>
    log(`${prop}: ${config[prop]}`),
  );

  window.evolv.cartRefresh(contextId);

  const { mut8, getAncestor, slugify, updateHTML, makeElement, singleSpace } =
    utils;

  utils.templates = {
    // Cart Refresh

    lineInfoDesktopAddition: () => `
    <div class="evolv-psfec-line-info-addition evolv-psfec-line-info-addition-desktop">
      <div class="evolv-psfec-line-info-addition-left">
        <div class="evolv-psfec-line-info-addition-name"></div>
        <div class="evolv-psfec-line-info-addition-description"></div>
        <div class="evolv-psfec-line-info-addition-ships"></div>
        <div class="evolv-psfec-line-info-addition-fulfilled"></div>
      </div>
      <div class="evolv-psfec-line-info-addition-right">
        <div class="evolv-psfec-line-info-addition-price"></div>
        <div class="evolv-psfec-line-info-addition-financing"></div>
      </div>
    </div>`,

    lineInfoMobileAddition: () => `
    <div class="evolv-psfec-line-info-addition evolv-psfec-line-info-addition-mobile-top">
      <div class="evolv-psfec-line-info-addition-name"></div>
      <div class="evolv-psfec-line-info-addition-description"></div>
      <div class="evolv-psfec-line-info-addition-price"></div>
    </div>
    <div class="evolv-psfec-line-info-addition evolv-psfec-line-info-addition-mobile-bottom">
      <div class="evolv-psfec-line-info-addition-financing"></div>
      <div class="evolv-psfec-line-info-addition-ships"></div>
      <div class="evolv-psfec-line-info-addition-fulfilled"></div>
    </div>`,

    lineTotal: (lineNumber, total) => `<div class="evolv-psfec-line-total-wrap">
    <div class="evolv-psfec-line-total">Line ${lineNumber} total: <span class="evolv-psfec-line-total-amount">${total}</span>
    </div>
  </div>`,

    lineInfoInnerAddition: (isMobile, id = 'info-inner', breakpoint = 751) => {
      const className = `evolv-psfec-${isMobile ? `max-${breakpoint - 1}` : `min-${breakpoint}`}`;
      return `<div class="evolv-psfec-line-${id}-addition ${className}">
    <div class="evolv-psfec-line-${id}-addition-ships"></div>
    <div class="evolv-psfec-line-${id}-addition-fulfilled"></div>
  </div>`;
    },
  };

  utils.app = {
    getLineNumber: (line) => {
      return line
        ?.querySelector('[id^="Line "][id$="_text"]')
        ?.textContent?.match(/\d+/)?.[0];
    },

    updatePerkSection: (state, lineDetails) => {
      const line = lineDetails.closest('.mutate-psfec-line');
      if (!line) {
        return;
      }

      const lineNumber = utils.app.getLineNumber(line);

      const planSectionInner = getAncestor(
        line.querySelector('p[id$="_plan_text"]'),
        4,
      );
      if (!planSectionInner) {
        return;
      }

      const perkNames = Array.from(
        planSectionInner.querySelectorAll('div[id$=_left_content] p'),
      )?.filter(
        (p) =>
          !p.textContent.includes('$') &&
          !p.closest('.mutate-psfec-second-number'),
      );

      utils.perkSectionElements = {
        perkSections: [],
        protectionSections: [],
        secondNumberSections: [],
      };

      const sections = {
        perkSections: perkNames.map((perkName) => getAncestor(perkName, 4)),
        protectionSections: Array.from(
          line.querySelectorAll(
            '.mutate-psfec-line-details div[data-testid="protectionSection"], .mutate-psfec-line-details div[data-testid="test-component"]',
          ),
        ),
        secondNumberSections: Array.from(
          line.querySelectorAll(
            '.mutate-psfec-line-details div[data-testid="70995-plan-section"]',
          ),
        ),
      };

      let hasNewText = false;
      ['perkSections', 'protectionSections', 'secondNumberSections'].forEach(
        (sectionsKey) => {
          const sectionsNew = sections[sectionsKey];

          if (
            sectionsNew.length &&
            sectionsNew.some((sectionNew, index) => {
              const sectionOld = utils.perkSectionElements[sectionsKey][index];
              return !(
                singleSpace(sectionNew.textContent) ===
                singleSpace(sectionOld?.textContent)
              );
            })
          ) {
            hasNewText = true;
          }
        },
      );

      if (!hasNewText) {
        return;
      }

      if (sections.secondNumberSections.length) {
        addClass(line, 'evolv-psfec-has-second-number');
      }

      const noDeviceProtection =
        sections.protectionSections?.[0]?.textContent?.includes(
          'No Device Protection',
        );

      const perkPrices = Array.from(
        planSectionInner.querySelectorAll(
          'div[id$=_right_content] p:first-child',
        ),
      ).map((priceElement, index, priceElements) => {
        // Excludes p tags that contain other p tags
        if (
          priceElements.some(
            (element) =>
              element !== priceElement && priceElement.contains(element),
          )
        ) {
          return 0;
        }
        return (
          parseFloat(
            priceElement.textContent.match(utils.regex.dollarsPerMo)?.[1],
          ) || 0
        );
      });

      const perkSectionHTMLs = sections.perkSections.map(
        (perkSection) => perkSection.outerHTML,
      );
      sections.secondNumberSections.forEach((numberSection) =>
        perkSectionHTMLs.push(numberSection.outerHTML),
      );
      sections.protectionSections.forEach((protectionSection, index) => {
        if (noDeviceProtection && !index) {
          perkSectionHTMLs.push(
            `<div class="evolv-psfec-accordion-perks-title">Protection</div>
            ${utils.templates.accordionPerk(
              'No device protection',
              '$0.00/mo',
              '',
              'device-protection',
            )}`,
          );
        } else if (protectionSection.dataset.testid === 'test-component') {
          const appleCarePrice = protectionSection.querySelector(
            '.mutate-psfec-acp-price',
          )?.textContent;
          perkSectionHTMLs.push(
            utils.templates.accordionPerk(
              'AppleCare+',
              '',
              appleCarePrice,
              'apple-care',
            ),
          );
        } else {
          perkSectionHTMLs.push(protectionSection.outerHTML);
          perkPrices.push(
            parseFloat(
              protectionSection
                .querySelector('#protectionDisplayPrice')
                ?.textContent?.match(utils.regex.dollarsPerMo)?.[1],
            ) || 0,
          );
        }
      });

      const perksTotal = perkPrices.reduce((a, c) => a + c, 0);
      const accordionClass = `evolv-psfec-accordion-perks`;
      const accordionId = `${accordionClass}-${evolv.vds.accordionIndex}`;
      const accordionExisting = {
        accordion: line.querySelector(`.${accordionClass}`),
      };

      const accordionNew = {
        rightHTML: `$${perksTotal.toFixed(2)}/mo`,
        detailsHTML: `<div class="evolv-psfec-accordion-perks-details-inner">
        ${sections.perkSections.length ? `<div class="evolv-psfec-accordion-perks-title">Perks</div>` : ''}
        ${perkSectionHTMLs.reduce((a, c) => a + c, '')}
      </div>`,
      };

      accordionNew.details = utils.components.accordionDetailsPanel(
        accordionNew.detailsHTML,
        sections.secondNumberSections?.[0],
      );

      if (accordionExisting.accordion) {
        accordionExisting.right =
          accordionExisting.accordion.querySelector('[slot="right"]');
        accordionExisting.details = accordionExisting.accordion.querySelector(
          'evolv-accordion-details',
        );
        accordionExisting.rightHTML = accordionExisting.right?.innerHTML;
        accordionExisting.detailsHTML = accordionExisting.details?.innerHTML;

        updateText(accordionExisting.right, accordionNew.rightHTML);

        if (
          singleSpace(accordionNew.details.textContent) !==
          singleSpace(accordionExisting.details.textContent)
        ) {
          log(`update perk section: line ${lineNumber}`);
          accordionExisting.details.innerHTML = '';
          accordionExisting.details.append(accordionNew.details);
        }

        return;
      } else {
        log(`insert perk section: line ${lineNumber}`);

        accordionNew.accordion = makeElement(`
        <evolv-accordion
          id="${accordionId}"
          class="${accordionClass}"
          breakpoint="751px"
          ${utils.isOrderReview ? 'open-first="true"' : ''}
        >
          <evolv-accordion-item>
           <evolv-accordion-header>
             Perks & Services
<evolv-title primitive="span" slot="right" breakpoint="751px">${accordionNew.rightHTML}</evolv-title>
           </evolv-accordion-header>
           <evolv-accordion-details>
           </evolv-accordion-details>
          </evolv-accordion-item>
        </evolv-accordion>`);

        accordionNew.accordion
          .querySelector('evolv-accordion-details')
          .append(accordionNew.details);
      }

      let accordionSlot = line.querySelector('.evolv-psfec-line-addition-perks');

      if (!accordionSlot) {
        const lineAddition = makeElement(utils.templates.lineAddition);
        line.append(lineAddition);
        accordionSlot = lineAddition.querySelector(
          '.evolv-psfec-line-addition-perks',
        );
      }

      accordionSlot.append(accordionNew.accordion);
      addClass(line, 'evolv-psfec-has-accordion');

      if (utils.variant.c1 === 'v1') {
        utils.app.updateLineTotal(state, line);
      }
    },

    updateFinancing: (state, lineColorSizePriceFRP) => {
      const line = lineColorSizePriceFRP.closest('.mutate-psfec-line');
      const info = lineColorSizePriceFRP.closest('.mutate-psfec-line-info');
      const type = lineColorSizePriceFRP.closest(
        '[type="MOBILE"], [type="DESKTOP"]',
      );

      if (!line || !info || !type) {
        return;
      }

      utils.app.getLineNumber(line);
      const typeOption = type.getAttribute('type');
      const isMobile = typeOption === 'MOBILE';
      const priceMonthly = info.querySelector('.mutate-psfec-line-price');
      const priceFRP = info.querySelector('.mutate-psfec-line-frp');
      const ships = info.querySelector('.mutate-psfec-line-ships');
      const fulfilled = info.querySelector('.mutate-psfec-line-fulfilled');
      const monthly = !!priceMonthly;

      const financing = Array.from(
        info.querySelectorAll(
          'p:not(.evolv-psfec-line-info-addition-financing-message):not(.evolv-psfec-financing-message)',
        ),
      ).find((p) => p.textContent.includes('for 36 months'));

      const priceMonthlyAmount = priceMonthly?.childNodes[0]?.data?.match(
        utils.regex.dollarsPerMo,
      )?.[1];
      const priceAmount = monthly
        ? parseFloat(priceMonthlyAmount)
        : parseFloat(priceFRP?.textContent?.match(utils.regex.dollars)?.[1]);

      const wasAmount = parseFloat(
        priceMonthly?.childNodes?.[2]?.textContent?.match(
          /\$(\d{1,4}\.\d{2})\s/,
        )[1],
      );

      if (!monthly) {
        removeClass(line, 'evolv-psfec-has-credit-applied');
        removeClass(line, 'evolv-psfec-has-financing');
      }

      const credit = wasAmount
        ? `$${(wasAmount - priceAmount).toFixed(2)}/mo`
        : null;
      const retail = financing?.textContent.match(/\$\d,?\d{1,3}\.\d{2}/)[0];
      const byodSavings = info.querySelector(
        '.mutate-psfec-line-byod-savings',
      )?.outerHTML;
      const actFeeText = info
        .querySelector('.mutate-psfec-line-act-fee')
        ?.textContent?.replace('included', `incl'd`);
      const financingNew = utils.templates.financing(
        priceMonthlyAmount,
        retail,
        credit,
        byodSavings,
        actFeeText,
      );

      function shipTransform(element) {
        utils.removeClassesMatching(element, /mutate|Styled(Body|Typography)/g);
        return utils.wrap(
          element,
          '<evolv-title size="xsmall" breakpoint="751px"></evolv-title>',
        );
      }

      const additionClass = `.evolv-psfec-line-info-addition`;
      const additionTypeClass = `${additionClass}-${isMobile ? 'mobile-bottom' : 'desktop'}`;

      let addition = info.querySelector(additionTypeClass);
      if (!addition) {
        const additionTemplate = `lineInfo${utils.capitalizeFirstLetter(typeOption)}Addition`;
        info.insertAdjacentHTML(
          'afterbegin',
          utils.templates[additionTemplate](),
        );
        addition = info.querySelector(additionTypeClass);
      }

      const financingSlot = addition.querySelector(`${additionClass}-financing`);
      const shipsSlot = info.querySelector(`${additionClass}-ships`);
      const fulfilledSlot = info.querySelector(`${additionClass}-fulfilled`);

      updateHTML(financingSlot, financingNew);
      utils.updateFirstChild(shipsSlot, ships, shipTransform);
      utils.updateFirstChild(fulfilledSlot, fulfilled, shipTransform);

      addClass(type, 'evolv-psfec-has-financing');
      addClass(type, `evolv-psfec-${isMobile ? 'max-849' : 'min-850'}`);
    },

    // This needs to handle monthly and full retail price scenarios
    updateLineTotal: (state, line) => {
      const lineNumber = utils.app.getLineNumber(line);

      if (!lineNumber) {
        return;
      }

      function getPrice(selector) {
        return parseFloat(
          line
            ?.querySelector(selector)
            ?.textContent?.match(utils.regex.dollarsPerMo)?.[1],
        );
      }

      let monthly;
      let devicePrice = getPrice('.mutate-psfec-line-price');
      if (isNaN(devicePrice)) {
        devicePrice =
          line
            .querySelector('.mutate-psfec-line-frp span')
            ?.textContent?.match(/\$(\d{1,4}\.\d{2})/)?.[1] || 0;
        monthly = devicePrice ? false : null;
      } else {
        monthly = true;
      }

      let planPrice = getPrice('.mutate-psfec-plan-price');
      if (isNaN(planPrice)) {
        planPrice = getPrice('.mutate-psfec-plan-total');
      }

      const perksTotal = getPrice('.evolv-psfec-accordion-perks-total') || 0;

      if (isNaN(planPrice)) {
        return;
      }

      const lineTotal = monthly
        ? `$${(devicePrice + planPrice + perksTotal).toFixed(2)}/mo`
        : `$${(planPrice + perksTotal).toFixed(2)}/mo`;

      let lineTotalSlot = line.querySelector('.evolv-psfec-line-addition-total');

      if (!lineTotalSlot) {
        const lineAddition = makeElement(utils.templates.lineAddition);
        line.append(lineAddition);
        lineTotalSlot = lineAddition.querySelector(
          '.evolv-psfec-line-addition-total',
        );
      }

      const lineTotalPrevious = lineTotalSlot.querySelector(
        '.evolv-psfec-line-total-wrap',
      );
      const lineTotalSection = makeElement(
        utils.templates.lineTotal(lineNumber, lineTotal, monthly),
      );

      if (!lineTotalPrevious) {
        log('insert line total: line', lineNumber, ', total:', lineTotal);
        lineTotalSlot.append(lineTotalSection);
      } else if (lineTotalPrevious.textContent !== lineTotalSection.textContent) {
        log('update line total: line', lineNumber, ', total:', lineTotal);
        lineTotalPrevious.replaceWith(lineTotalSection);
      }
    },

    updateEditModal: (state, editLink) => {
      const line = editLink.closest('.mutate-psfec-line');
      if (!line) {
        return;
      }

      const isPlan = editLink.classList.contains('mutate-psfec-plan-edit');
      const hasDeviceEdit = !!line.querySelector(
        '[data-testid="MiniPdpMainComponentEditButton"]',
      );
      const slotSelector = isPlan
        ? '.evolv-modal-edit-plan'
        : '.evolv-modal-edit-protection';

      if (hasDeviceEdit) {
        return;
      }

      const editModalButtonWrap = line.querySelectorAll(
        '.mutate-psfec-line-remove-wrap',
      );

      editModalButtonWrap.forEach((buttonWrap) => {
        utils.modal;
        const type = buttonWrap
          .closest('[type=MOBILE], [type=DESKTOP]')
          .getAttribute('type')
          .toLowerCase();
        const modalButtonClass = `evolv-psfec-edit-modal-button-${type}`;

        const editModalButtonExisting = line.querySelector(
          `.${modalButtonClass}, .evolv-psfec-link-button-line-edit`,
        );
        if (!editModalButtonExisting) {
          const editModalButtonNew = utils.components.editModalButton(type);
          const modalNew = editModalButtonNew.querySelector('.evolv-modal');
          buttonWrap.prepend(editModalButtonNew);
          utils.modal.instances[utils.modal.index] = new utils.components.Modal(
            modalNew,
            document.activeElement,
            '.evolv-psfec-pdp-modal-edit',
          );
          utils.modal.index += 1;
          addClass(line, 'evolv-psfec-has-custom-edit-modal');
        }
        const slot = buttonWrap.querySelector(slotSelector);
        const modalEditButtonExisting = slot.querySelector(
          '.evolv-psfec-pdp-modal-edit',
        );

        if (!modalEditButtonExisting) {
          const modalEditButtonNew = isPlan
            ? utils.components.modalPlanEditButton(line)
            : utils.components.modalProtectionEditButton(line);
          slot.append(modalEditButtonNew);
        }
      });
    },

    refreshCartTile: (variant = 'v1') => {
      const { namespace, app } = utils;

      const flow = window.vzdl.page?.flow?.toLowerCase();
      if (/aal|eup/i.test(flow)) {
        fail(`wrong flow: ${flow}`);
        return;
      }

      // Call common implementation
      app.cartRefreshCommon(contextId, variant);
    },
  };

  utils.xpath;

  utils.selectors = {
    ...utils.commonSelectors,
    
    // Prospect-specific selectors
    'order-summary-title': '//*[@id="orderSummaryTitle"]/parent::div',
    'pdp-modal-vz-loader': '//div[@id="miniPdpModal"]//div[@aria-label="loader overlay"]/parent::div',
    'multi-protect-tile': '//a[@id="editProtection"]/ancestor::div[4]',
    'sim-icon': '//div[@data-testid="expressCheckoutSimIndex"]//*[local-name()="svg"]/parent::div',
    'sim-info': '//div[@data-testid="expressCheckoutSimIndex"]//h2/parent::div',
    'sim-grid': '//div[@data-testid="expressCheckoutSimIndex"]//h2/ancestor::div[2]',
    'sim-remove': '//div[@data-testid="expressCheckoutSimIndex"]//a[@data-testid="remove-sim-link"]/ancestor::div[2]',
  };

  Object.keys(utils.selectors).forEach((key) => {
    debug(`collect: ${key} '${utils.selectors[key]}'`);
    collect(utils.selectors[key], `${contextId}-${key}`);
  });



  // REMOVE FROM PROD

  // $mu('audio', 'audio').customMutation((state, audio) => audio.muted = true);
  // utils.app.refreshCartTile('v1');
  // console.warn('HERE')

})();
