(function () {
  'use strict';

  const config = {
    name: 'Customer Cart Refresh',
    version: '1.1.1',
    audience: 'Customer D/T/M/A | Exclude ESO flow',
    kpi: 'OC-AAL-EUP.page-load',
    urls: [
      'https://www.verizon.com/sales/nextgen/expresscart.html',
      'https://www.verizon.com/sales/nextgen/orderreview.html',
    ],
    contexts: [
      {
        id: 'ccrec',
        display_name: 'Express Cart',
        variables: [
          {
            id: 'c1',
            display_name: '1 - Display pages using a different design',
            variants: [
              {
                id: 'v0',
                display_name: '1.0 - Control',
              },
              {
                id: 'v1',
                display_name:
                  '1.1 - New cart design, white tiles on gray background, total at top',
              },
              {
                id: 'v2',
                display_name:
                  '1.2 - New cart design, white tiles on gray background, no total',
              },
              {
                id: 'v3',
                display_name:
                  '1.3 - New cart design, white tiles on gray background, total at bottom',
              },
            ],
          },
          {
            id: 'c3',
            display_name: '3 - Motivational Copy',
            variants: [
              {
                id: 'v0',
                display_name: '3.0 - Control',
              },
              {
                id: 'v1',
                display_name: `3.1 - Display copy as "Just place your order and you’re good to go!"`,
              },
              {
                id: 'v2',
                display_name: `3.2 - You’re one click away from the network that keeps you connected."`,
              },
              {
                id: 'v3',
                display_name: `3.3 - Display copy as "You’re just a click away, it’s that simple!"`,
              },
              {
                id: 'v4',
                display_name: `3.4 - Display copy as "You’re one click away."`,
              },
              {
                id: 'v5',
                display_name: `3.5 - Display copy as "You’re one step away from your new device."`,
              },
            ],
          },
          {
            id: 'c4',
            display_name: '4 - Suppress Trade-in Tile',
            variants: [
              {
                id: 'v0',
                display_name: '4.0 - Control',
              },
              {
                id: 'v1',
                display_name:
                  '4.1 - Hide trade-in tile when BIC offer is present',
              },
            ],
          },
        ],
      },
    ],
  };
  const contextId = config.contexts[0].id;
  const utils = window.evolv.utils.init(contextId, config);
  const {
    log,
    warn,
    debug,
    describe,
    namespace,
    throttle,
    addClass,
    removeClass,
    updateText,
    fail,
    subscribe,
    slugify,
    getAncestor,
    wrap,
    makeElement,
    makeElements,
  } = utils;

  ['name', 'version', 'audience', 'kpi', 'urls'].forEach((prop) =>
    log(`${prop}:`, config[prop]),
  );

  window.evolv.cartRefresh(contextId);

  const { mut8, singleSpace, updateHTML } = utils;

  utils.templates = {
    // Cart Refresh



    lineTotalSlot: (className) => `
    <div class="evolv-ccrec-line-total-slot ${className ? `evolv-ccrec-${className}` : ''}"></div>`,

    lineTotal: (total) => `
    <evolv-title class="evolv-ccrec-line-total" bold="true" breakpoint="751px">
      <span class="evolv-ccrec-line-total-inner">
        Total line cost:
        <span class="evolv-ccrec-line-total-amount">${total}</span>
      </span>
    </evolv-title>`,

    lineInfoMobileAddition: () => `
    <div class="evolv-ccrec-line-info-addition-total evolv-ccrec-line-total-slot evolv-ccrec-line-total-slot-top" ></div>
    <div class="evolv-ccrec-line-info-addition evolv-ccrec-line-info-addition-mobile-top">

      <div class="evolv-ccrec-line-info-addition-name"></div>
      <div class="evolv-ccrec-line-info-addition-description"></div>
      <div class="evolv-ccrec-line-info-addition-price"></div>
    </div>
    <div class="evolv-ccrec-line-info-addition evolv-ccrec-line-info-addition-mobile-bottom">
      <div class="evolv-ccrec-line-info-addition-financing"></div>
      <div class="evolv-ccrec-line-info-addition-ships"></div>
      <div class="evolv-ccrec-line-info-addition-fulfilled"></div>
      <div class="evolv-ccrec-line-info-addition-gift"></div>
    </div>`,

    lineInfoDesktopAddition: () => `
    <div class="evolv-ccrec-line-info-addition-total evolv-ccrec-line-total-slot evolv-ccrec-line-total-slot-top"></div>
    <div class="evolv-ccrec-line-info-addition evolv-ccrec-line-info-addition-desktop">
      <div class="evolv-ccrec-line-info-addition-left">
        <div class="evolv-ccrec-line-info-addition-name"></div>
        <div class="evolv-ccrec-line-info-addition-description"></div>
        <div class="evolv-ccrec-line-info-addition-ships"></div>
        <div class="evolv-ccrec-line-info-addition-fulfilled"></div>
      </div>
      <div class="evolv-ccrec-line-info-addition-right">
        <div class="evolv-ccrec-line-info-addition-price"></div>
        <div class="evolv-ccrec-line-info-addition-financing"></div>
        <div class="evolv-ccrec-line-info-addition-gift"></div>
      </div>
    </div>`,
  };

  utils.app = {
    getLineNumber: (line) => {
      const lineIndex = parseInt(
        line.querySelector(utils.selectors['line-name'])?.id?.match(/\d+/)?.[0],
      );

      return typeof lineIndex === 'number' ? (lineIndex + 1).toString() : null;
    },

    updateLineAddition: (line) => {
      if (!line) {
        return;
      }

      const target = line.querySelector('.mutate-ccrec-line-details');

      if (!target) {
        return;
      }

      let addition = line.querySelector('.evolv-ccrec-line-addition');

      if (!addition) {
        addition = makeElement(utils.templates.lineAddition);
        target.append(addition);
      }

      return addition;
    },

    updatePerkSection: (state, lineDetails) => {
      const line = lineDetails.closest('.mutate-ccrec-line');
      if (!line) {
        return;
      }

      const lineNumber = utils.app.getLineNumber(line);
      const lineContent = line.querySelector('.mutate-ccrec-line-content');
      if (!lineContent) {
        return;
      }

      const perkNames = Array.from(
        lineContent.querySelectorAll('div[id$=_left_content] p'),
      )?.filter(
        (p) =>
          !p.textContent.includes('$') &&
          !p.closest('.mutate-ccrec-second-number') &&
          !p.closest('evolv-accordion-details') &&
          !p.textContent.includes('Promotional Savings'),
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
            '.mutate-ccrec-protection-section, div[data-testid="test-component"]',
          ),
        ).filter(
          (protection) => !protection.closest('.evolv-ccrec-accordion-perks'),
        ),
        secondNumberSections: Array.from(
          line.querySelectorAll(
            '.mutate-ccrec-line-details div[data-testid="70995-plan-section"]',
          ),
        ).filter(
          (protection) => !protection.closest('.evolv-ccrec-accordion-perks'),
        ),
      };

      let hasNewText = false;
      ['perkSections', 'protectionSections', 'secondNumberSections'].forEach(
        (sectionsKey) => {
          if (hasNewText) {
            return;
          }
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
        addClass(line, 'evolv-ccrec-has-second-number');
      }

      const noDeviceProtection =
        sections.protectionSections?.[0]?.textContent?.includes(
          'No Device Protection',
        );

      const perkPrices = sections.perkSections.map((perkSection) => {
        const price = perkSection.querySelector(
          'div[id$=_right_content] p:first-child',
        );
        return (
          parseFloat(price?.textContent?.match(utils.regex.dollarsPerMo)?.[1]) ||
          0
        );
      });

      const perkSectionHTMLs = sections.perkSections.map(
        (perkSection) => perkSection.outerHTML,
      );
      if (sections.perkSections.length) {
        perkSectionHTMLs.unshift(
          `<div class="evolv-ccrec-accordion-perks-title">Perks</div>`,
        );
      }
      sections.secondNumberSections.forEach((numberSection) =>
        perkSectionHTMLs.unshift(numberSection.outerHTML),
      );

      const protectionSectionHTMLs = [];
      sections.protectionSections.forEach((protectionSection, index) => {
        if (noDeviceProtection && !index) {
          protectionSectionHTMLs.push(
            '<div class="evolv-ccrec-accordion-perks-title">Protection</div>',
          );
          protectionSectionHTMLs.push(
            utils.templates.accordionPerk(
              'No device protection',
              '$0.00/mo',
              '',
              'device-protection',
            ),
          );
        } else if (protectionSection.dataset.testid === 'test-component') {
          const appleCarePrice = protectionSection.querySelector(
            '.mutate-ccrec-acp-price',
          )?.textContent;
          protectionSectionHTMLs.push(
            utils.templates.accordionPerk(
              'AppleCare+',
              '',
              `${appleCarePrice} Due today`,
              'apple-care',
            ),
          );
        } else {
          protectionSectionHTMLs.push(protectionSection.outerHTML);
          perkPrices.push(
            parseFloat(
              protectionSection
                .querySelector('#ProtectionServicePrice')
                ?.textContent?.match(utils.regex.dollarsPerMo)?.[1],
            ) || 0,
          );
        }
      });

      const perksTotal = perkPrices.reduce((a, c) => a + c, 0);
      const accordionClass = `evolv-ccrec-accordion-perks`;
      const accordionId = `${accordionClass}-${evolv.vds.accordionIndex}`;
      const accordionExisting = {
        accordion: line.querySelector(`.${accordionClass}`),
      };

      const accordionNew = {
        rightHTML: `$${perksTotal.toFixed(2)}/mo`,
        detailsHTML: `<div class="evolv-ccrec-accordion-perks-details-inner">
        ${protectionSectionHTMLs.reduce((a, c) => a + c, '')}
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
              Services & perks  
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

      const lineAddition = utils.app.updateLineAddition(line);
      if (!lineAddition) {
        return;
      }

      const accordionSlot = lineAddition.querySelector(
        '.evolv-ccrec-line-addition-perks',
      );

      accordionSlot.append(accordionNew.accordion);
      addClass(line, 'evolv-ccrec-has-accordion');
    },

    updateFinancing: (state, lineColorSizePriceFRP) => {
      const line = lineColorSizePriceFRP.closest('.mutate-ccrec-line');
      const info = lineColorSizePriceFRP.closest('.mutate-ccrec-line-info');
      const type = lineColorSizePriceFRP.closest(
        '[type="MOBILE"], [type="DESKTOP"]',
      );

      if (!(line && info && type)) {
        return;
      }

      utils.app.getLineNumber(line);
      const typeOption = type.getAttribute('type');
      const isMobile = typeOption === 'MOBILE';
      const priceMonthly = info.querySelector('.mutate-ccrec-line-price');
      const priceFRP = info.querySelector('.mutate-ccrec-line-frp');
      const ships = info.querySelector('.mutate-ccrec-line-ships');
      const fulfilled = info.querySelector('.mutate-ccrec-line-fulfilled');
      const monthly = !!priceMonthly;
      const financing = Array.from(
        info.querySelectorAll('p:not(.evolv-ccrec-line-info-addition-financing)'),
      ).find(
        (p) =>
          p.textContent.includes('for 36 months') &&
          !p.closest('.evolv-ccrec-line-info-addition'),
      );

      let priceMonthlyAmount;
      let wasAmount;

      if (priceMonthly?.textContent?.includes('was')) {
        priceMonthlyAmount = priceMonthly?.childNodes[0]?.data?.match(
          utils.regex.dollarsPerMo,
        )?.[1];

        wasAmount = parseFloat(
          priceMonthly?.childNodes?.[2]?.textContent?.match(
            /\$(\d{1,4}\.\d{2})\s/,
          )?.[1],
        );
      } else {
        priceMonthlyAmount = priceMonthly?.textContent?.match(
          /\$(\d{1,4}\.\d{1,2})\s?\/mo/,
        )?.[1];
      }

      const priceAmount = monthly
        ? parseFloat(priceMonthlyAmount)
        : parseFloat(priceFRP?.textContent?.match(utils.regex.dollars)?.[1]);
      const isDFO = financing?.textContent?.includes('Verizon Visa');

      let financingText;
      if (wasAmount && monthly) {
        financingText = `was $${wasAmount}/mo for 36 months`;
      } else if (monthly) {
        financingText = `$${priceAmount}/mo for 36 months`;
      } else {
        financingText = null;
      }

      if (financingText && isDFO) {
        financingText +=
          '<br> on Verizon Visa<sup>®</sup> Card; <evolv-text-link size="small">Details</evolv-text-link>';
      } else if (financingText) {
        financingText += ',';
      }

      if (!monthly) {
        removeClass(line, 'evolv-ccrec-has-credit-applied');
        removeClass(line, 'evolv-ccrec-has-financing');
      }
      const credit = wasAmount
        ? `$${(wasAmount - priceAmount).toFixed(2)}/mo`
        : null;
      const retail = financing?.textContent.match(/\$\d,?\d{1,3}\.\d{2}/)[0];
      const actFeeText = info
        .querySelector('.mutate-ccrec-line-act-fee')
        ?.textContent?.replace('included', `incl'd`);

      const financingNew = utils.templates.financing(
        financingText,
        retail,
        credit,
        actFeeText,
      );
      const [shipsNew, fulfilledNew] = [ships, fulfilled].map((element) => {
        const text = element?.textContent?.trim();
        return text
          ? `<evolv-title size="xsmall" breakpoint="751px">${text}</evolv-title>`
          : null;
      });

      const additionClass = `.evolv-ccrec-line-info-addition`;
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

      const gift = type.querySelector('.mutate-ccrec-gift');

      const financingSlot = addition.querySelector(`${additionClass}-financing`);
      const shipsSlot = addition.querySelector(`${additionClass}-ships`);
      const fulfilledSlot = addition.querySelector(`${additionClass}-fulfilled`);
      const giftSlot = addition.querySelector(`${additionClass}-gift`);

      if (updateHTML(financingSlot, financingNew)) {
        utils.forwardClicks(financingSlot, financing);
      }
      updateHTML(shipsSlot, shipsNew);
      updateHTML(fulfilledSlot, fulfilledNew);

      if (gift && !gift.closest(`${additionClass}-gift`)) {
        giftSlot.append(gift);
      }

      addClass(type, 'evolv-ccrec-has-financing');
      addClass(type, `evolv-ccrec-${isMobile ? 'max-849' : 'min-850'}`);
    },

    updateDiscountSection: (state, discountSection) => {
      const lineDetails = discountSection.closest('.mutate-ccrec-line-details');
      const line = lineDetails?.closest('.mutate-ccrec-line');
      const lineAddition = utils.app.updateLineAddition(line);

      if (!(line && lineDetails && lineAddition)) {
        return;
      }

      const discountSlot = lineAddition.querySelector(
        '.evolv-ccrec-line-addition-discount',
      );
      const discountHTML = discountSection.outerHTML;

      updateHTML(discountSlot, discountHTML);
      addClass(discountSection, 'evolv-hide');
    },

    updateLineTotal: (state, price) => {
      const line = price.closest('.mutate-ccrec-line');
      if (!line) {
        return;
      }

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
      let devicePrice = getPrice('.mutate-ccrec-line-price');
      if (isNaN(devicePrice)) {
        devicePrice = 0;
        addClass(line, 'evolv-ccrec-is-frp');
      }

      let planPrice = getPrice('.mutate-ccrec-plan-price') || 0;
      const perkTotal = getPrice('.mutate-ccrec-perk-total') || 0;
      const discountPrice = getPrice('.mutate-ccrec-discount-price') || 0;
      const lineTotal = `$${(devicePrice + planPrice + perkTotal - discountPrice).toFixed(2)}/mo`;
      const lineAddition = utils.app.updateLineAddition(line);
      const lineDetails = line.querySelector('.mutate-ccrec-line-details');
      if (!(lineAddition && lineDetails)) {
        return;
      }

      if (
        !lineDetails.firstElementChild?.classList?.contains(
          'evolv-ccrec-line-total-slot',
        )
      ) {
        lineTotalSlot = makeElement(
          utils.templates.lineTotalSlot('line-total-slot-c1-frp'),
        );
        lineDetails.prepend(lineTotalSlot);
      }

      const lineTotalSlots = line.querySelectorAll(
        '.evolv-ccrec-line-addition-total, .evolv-ccrec-line-info-addition-total, .evolv-ccrec-line-total-slot',
      );
      lineTotalSlots.forEach((slot) => {
        const lineTotalPrevious = slot.querySelector('.evolv-ccrec-line-total');
        const lineTotalSection = makeElement(
          utils.templates.lineTotal(lineTotal),
        );

        if (!lineTotalPrevious) {
          log('insert line total: line', lineNumber, '- total:', lineTotal);
          slot.append(lineTotalSection);
          addClass(line, 'evolv-ccrec-has-line-total');
        } else if (
          lineTotalPrevious.textContent !== lineTotalSection.textContent
        ) {
          log('update line total: line', lineNumber, '- total:', lineTotal);
          lineTotalPrevious.replaceWith(lineTotalSection);
          addClass(line, 'evolv-ccrec-has-line-total');
        }
      });
    },

    refreshCartTile: (variant = 'v1') => {
      app.cartRefreshCommon(contextId, variant);
    },

    suppressTradeIn: (variant) => {
      describe(contextId, 'c4');
      describe(contextId, 'c4', variant);
      namespace(contextId, 'c4');
      namespace(contextId, 'c4', variant);
    },

    motivationalCopy: (variant) => {
      describe(contextId, 'c3');
      describe(contextId, 'c3', variant);
      namespace(contextId, 'c3');
      namespace(contextId, 'c3', variant);

      const content = {
        v1: `Just place your order and you’re good to go!`,
        v2: `You’re one click away from the network that keeps you connected.`,
        v3: `You’re just a click away, it’s that simple!`,
        v4: `You’re one click away!`,
        v5: `You’re one step away from your new device.`,
      };

      if (window.location.pathname.includes('/sales/nextgen/orderreview')) {
        mut8('cart-title')
          .inject(
            `
        <evolv-title class="evolv-motivational-copy" size="medium" color="gray44" breakpoint="751px">${content[variant]}</evolv-title>
      `,
          )
          .append();
        mut8('cart-title').customMutation((state, element) => {
          element
            .querySelector(':scope > div > div:empty')
            ?.parentNode?.classList?.add('evolv-hide');
        });
      }
    },
  };

  const { containsClass, containsKey, includesAll, anyKey } = utils.xpath;

  utils.selectors = {
    ...utils.commonSelectors,
    
    // Customer-specific selectors
    'keep-shopping': '//a[@id="keep_shopping_link"]/ancestor::div[2]',
    'next-steps-wrap': `//div[${containsClass('content')}]/preceding::h2[contains(text(),"Next,")][1]/parent::div`,
    'content-wrap-next-steps-cart-title': includesAll('content-wrap', [
      'next-steps-wrap',
      'cart-title',
    ]),
    'line-prices': anyKey(
      ['line-price', 'line-frp', 'plan-price', 'perk-total', 'discount-price'],
      `//div[${containsKey('line')}]//div[${containsKey('line-content')}]`,
    ),
  };

  Object.keys(utils.selectors).forEach((key) => {
    debug(`collect: ${key} '${utils.selectors[key]}'`);
    collect(utils.selectors[key], `${contextId}-${key}`);
  });

  // utils.reportUnusedSelectors = () => {
  //   utils.remainingSelectors = Object.keys(utils.selectors);
  //   const remaining = utils.remainingSelectors;

  //   let index = remaining.length;
  //   while (index--) {
  //     const selector = remaining[index];
  //     mut8(selector).customMutation((_, element) => {
  //       const currentIndex = remaining.indexOf(selector);

  //       if (currentIndex >= 0) {
  //         remaining.splice(currentIndex, 1);
  //       };
  //     });
  //   }
  // }

  // $mu('audio', 'audio').customMutation((state, audio) => audio.muted = true);

  // // utils.reportUnusedSelectors();
  // warn('HERE')
  // utils.app.refreshCartTile('v1');
  // utils.app.suppressTradeIn('v1');
  // utils.app.motivationalCopy('v1');

  // setTimeout(() => { window.location.reload }, 600000);

})();
