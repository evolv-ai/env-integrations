'use strict';

var version = "0.0.1";

function cartRefresh(contextId) {
  const { collect, mutate, $mu } = window.evolv;
  const utils = window.evolv.utils.init(contextId);
  const { html, css, render } = utils;
  const { containsClass, containsKey, includesAll, anyKey } = utils.xpath;

  utils.describe(contextId);

  utils.mut8 = (mutateKey) => mutate(`${contextId}-${mutateKey}`, this.key);

  utils.updateHTML = (element, contentsHTML, compareTextOnly = true) => {
    if (!element || typeof contentsHTML !== 'string') {
      return;
    }
    const { singleSpace } = utils;
    const comparisonProperty = compareTextOnly ? 'textContent' : 'innerHTML';
    const contentsCurrent = makeElements(contentsHTML);
    const contentsStringCurrent = singleSpace(
      compareTextOnly
        ? contentsCurrent.map((content) => content.textContent).join(' ')
        : contentsHTML,
    );
    const contentsStringPrevious = singleSpace(element[comparisonProperty]);
    if (contentsStringCurrent !== contentsStringPrevious) {
      element.innerHTML = contentsHTML;
      return true;
    }
  };

  utils.updateElement = (
    target,
    source,
    transform = null,
    forwardClicks = true,
  ) => {
    if (!(target && source)) {
      return;
    }
    const targetText = utils.singleSpace(target.textContent);
    const sourceText = utils.singleSpace(source.textContent);

    if (targetText === sourceText) {
      return;
    }

    const targetClone = source.cloneNode(true);
    const targetNew = transform ? transform(targetClone) : targetClone;

    if (forwardClicks) {
      utils.forwardClicks(targetNew, source);
    }

    target.replaceWith(targetNew);
  };

  utils.updateFirstChild = (
    parent,
    source,
    transform = null,
    forwardClicks = true,
  ) => {
    if (!(parent && source)) {
      return;
    }
    const target = parent.firstElementChild;
    if (!target) {
      const targetClone = source.cloneNode(true);
      const targetNew = transform ? transform(targetClone) : targetClone;

      if (forwardClicks) {
        utils.forwardClicks(targetNew, source);
      }

      parent.prepend(targetNew);
    } else {
      utils.updateElement(target, source, transform, forwardClicks);
    }
  };

  utils.updateAttribute = (element, attribute, value) => {
    if (!element || !attribute) {
      return;
    }
    const valuePrevious = element.getAttribute(attribute);
    const valueCurrent = utils.cleanString(value);

    if (valueCurrent == valuePrevious) {
      return;
    }

    log(
      `update attribute: change '${attribute}' from '${valuePrevious}' to '${valueCurrent}'`,
    );
    element.setAttribute(attribute, valueCurrent);
  };

  utils.singleSpace = (string) => string?.replace(/\s\s+/g, ' ')?.trim();

  utils.forwardClicks = (targetElement, sourceElement) => {
    clickableSelector = 'button, a';
    const sourceClickable = sourceElement.querySelectorAll(clickableSelector);
    targetElement
      .querySelectorAll(clickableSelector)
      .forEach((clickable, index) => {
        clickable.addEventListener('click', () => {
          sourceClickable[index].click();
        });
      });
  };

  utils.removeClassesMatching = (element, regex = /.*/, recursive = true) => {
    if (!element) {
      return;
    }

    const elementSet = recursive
      ? [element, ...element.querySelectorAll('*')]
      : [element];

    elementSet.forEach((elementItem) => {
      let index = elementItem.classList.length;

      while (index--) {
        const className = elementItem.classList[index];
        if (regex.test(className)) {
          elementItem.classList.remove(className);
        }
      }
    });
  };

  utils.regex = {
    dollars: /\$(\d{1,5}\.\d{2})/,
    dollarsPerMo: /\$([0-9\.]*)\s?\/mo/,
    insideQuotes: /"(.*)"/,
    deviceTypeFromPath: /\/us\/(.*)\/[0-9a-z\-]+\//i,
  };

  utils.hasRun = {};
  utils.previous = {};

  utils.dataTrack = (name) => {
    if (!name) {
      return '';
    } else if (name === 'ignore') {
      return 'data-track-ignore="true"';
    } else {
      return name ? `data-track="{'type':'link','name':'${name}'}"` : '';
    }
  };

  // Literally does not do anything, it just marks the template so yml-min will
  //know how to process
  utils.css = (strings, ...expressions) => {
    let result = '';
    strings.forEach((string, index) => {
      result += `${string}${typeof expressions[index] !== 'undefined' ? expressions[index] : ''}`;
    });
    return result;
  };

  utils.templates = {
    PDPModalIframeStyles: () => css`
    <style id="evolv-iframe-styles">
      .evolv-text, .evolv-${contextId}-link-button {
        font-family: Verizon-NHG-eDS,Helvetica,Arial,sans-serif;
        font-weight: 400;
        color: black;
      }

      .evolv-bold {
        font-weight: 700;
      }
    
      .evolv-title-md, .evolv-accordion-button .text-2xl, div[data-testid="pdp-page-title"] .text-2xl {
        font-size: 20px !important;
        line-height: 24px !important;
      }

      .evolv-title-lg {
        font-size: 24px;
        line-height: 28px;
      }

      .evolv-${contextId}-link-button {
        font-size: 16px;
        border-bottom: 1px solid black;
      }

      .evolv-${contextId}-link-button:hover {
        box-shadow: 0 1px black;
      }

      .evolv-${contextId}-link-button:active {
        color: #6f7171;
        box-shadow: 0 1px #6f7171;
      }

      .evolv-confirm-cta-section {
        display: none;
      }

      div[data-testid="pdp-page-title"] .text-2xl {
        font-weight: 400 !important
      }

      .evolv-page-title-wrap {
        display: flex;
        justify-content: space-between;
      }

      .evolv-accordion-button {
        cursor: default;
      }
      
      .evolv-accordion-button .toggleIconWrapper {
        display: none;
      }

      div[data-testid="pdpComponentId"] > .grid {
        padding: 2px !important
      }

      div[data-testid="priceComponentId"] div[type="secondary"] {
        display: none;
      }
    </style>`,

    accordionItem: (headerContent, detailsContent) =>
      html` <evolv-accordion-item>
        <evolv-accordion-header> ${headerContent} </evolv-accordion-header>
        <evolv-accordion-details> ${detailsContent} </evolv-accordion-details>
      </evolv-accordion-item>`,

    accordion: (id, content) =>
      html` <evolv-accordion ${id ? `id="${id}"` : ''}>
        ${content}
      </evolv-accordion>`,

    financing: (monthlyPriceText, retailPrice, credit, actFee) => `
      <div class="evolv-${contextId}-financing">
        ${
          monthlyPriceText && retailPrice
            ? `
          <p class="evolv-${contextId}-financing-message">
            ${monthlyPriceText}<br>0% APR; Retail price: ${retailPrice}
          </p>`
            : ''
        }
      
      ${credit ? `<p class="evolv-${contextId}-financing-credit">${credit} credit applied</p>` : ''}
      ${actFee ? `<p class="evolv-${contextId}-financing-act-fee">${actFee}</p>` : ''}
    </div>`,

    lineAddition: () => `
      <div class="evolv-${contextId}-line-addition">
        <div class="evolv-${contextId}-line-addition-perks"></div>
        <div class="evolv-${contextId}-line-addition-discount"></div>
        <div class="evolv-${contextId}-line-addition-total evolv-${contextId}-line-total-slot"></div>
        <div class="evolv-${contextId}-line-addition-shop-phones"></div>
      </div>`,

    accordionPerk: (
      name,
      price,
      subtext,
      classSuffix,
    ) => `
      <div class="evolv-${contextId}-accordion-perk ${classSuffix ? `evolv-${contextId}-accordion-perk-${classSuffix}` : ''}">
        <span class="evolv-${contextId}-accordion-perk-name">${name}</span>
        ${subtext ? `<span class="evolv-${contextId}-accordion-perk-subtext">${subtext}</span>` : ''}
        <span class="evolv-${contextId}-accordion-perk-price">${price}</span>
      </div>`,
  };

  utils.events = {
    clickLineEditButton: ({ target }) => {
      const line = target.closest(`.mutate-${contextId}-line`);

      Array.from(
        line.querySelectorAll(`div[type] .mutate-${contextId}-line-edit`),
      )
        .find((vzLineEditButton) =>
          utils.isVisible(vzLineEditButton.closest('div[type]')),
        )
        .click();

      utils.lineLastEdited = utils.app.getLineNumber(line);
    },
    clickTrashButton: ({ target }) => {
      target.previousElementSibling.click();
    },
    clickModalDeviceEdit: ({ target }) => {
      // Get current state
      const button = target.closest('button');
      const buttonExpanded =
        button.getAttribute('aria-expanded') === 'false' ? false : true;
      const buttonParent = button.parentNode;
      const details = button.nextElementSibling;

      // Set new state
      const buttonState = buttonExpanded ? 'expanded' : 'collapsed';
      const dataTrackValue = `{'type':'link','name':'edit this device:${buttonState}'}`;

      buttonParent.classList.toggle(`evolv-${contextId}-expanded`);
      buttonParent.style.setProperty(
        '--evolv-details-height',
        `${details.scrollHeight}px`,
      );
      button.setAttribute('aria-expanded', !buttonExpanded);
      button.setAttribute('data-track', dataTrackValue);
    },
    clickPlanEdit: (lineSection) => {
      lineSection.querySelector('.mutate-${contextId}-plan-edit').click();
    },
    clickProtectionEdit: (lineSection) => {
      lineSection.querySelector('.mutate-${contextId}-protection-edit').click();
    },
    clickRemove: (closeModal, lineSection) => {
      closeModal.click();
      lineSection.querySelector('.mutate-${contextId}-line-remove').click();
    },
    clickByodModalButton: (type) => {
      document.body.append(
        render(html`
        <evolv-modal id="evolv-modal-line-edit-${type}">
          <evolv-modal-title
            size="large"
            primitive="h2"
          >What would you like to do?</evolv-modal-title>
          <evolv-modal-body>
            <div class="evolv-modal-edit-plan"></div>
            <div class="evolv-modal-edit-protection"></div>
          </evolv-modal-body>
          <evolv-modal-footer>
            <evolv-button class="evolv-modal-edit-go-back" use="secondary" ${utils.dataTrack(dataTrackName('collapsed'))}>Go back</button>
          </evolv-modal-footer>
        </evolv-modal>
      `),
      );
    },
  };

  utils.components = {
    lineEditButton: (text, variant) =>
      render(
        html`<evolv-text-link
          size="small"
          type="standAlone"
          role="button"
          class="evolv-${contextId}-link-button ${variant
            ? `evolv-${contextId}-link-button-${variant}`
            : ''}"
          data-track-ignore="true"
          @click=${utils.events.clickLineEditButton}
          >${text}
        </evolv-text-link>`,
      ),
    trashButton: (isDisabled) =>
      render(
        html`<evolv-button-icon
          name="trash-can"
          class="evolv-${contextId}-icon-button evolv-${contextId}-icon-button-trash"
          data-track-ignore="true"
          ${isDisabled ? 'disabled' : ''}
          @click=${utils.events.clickTrashButton}
        ></evolv-button-icon>`,
      ),
    modalDeviceEditButton: () =>
      render(
        html`<button
          class="evolv-${contextId}-pdp-modal-edit"
          aria-expanded="false"
          data-track="{'type':'link','name':'edit this device:collapsed'}"
          @click=${utils.events.clickModalDeviceEdit}
        >
          <evolv-icon name="phone"></evolv-icon>
          <span>Edit this device</span>
          <evolv-button-icon
            name="down-caret"
            data-track-ignore="true"
          ></evolv-button-icon>
        </button>`,
      ),
    modalPlanEditButton: (lineSection) =>
      render(
        html`<evolv-accordion-header
          handle-align="right"
          data-track-ignore="true"
          @click=${utils.events.clickPlanEdit(lineSection)}
          css=".button-icon-wrap{transform: rotate(-90deg)}"
          >Edit plan & perks
        </evolv-accordion-header>`,
      ),

    modalProtectionEditButton: (lineSection) =>
      render(
        html`<evolv-accordion-header
          handle-align="right"
          data-track-ignore="true"
          @click=${utils.events.clickProtectionEdit(lineSection)}
          css=".button-icon-wrap{transform: rotate(-90deg)}"
          >Edit protection
        </evolv-accordion-header>`,
      ),

    modalRemoveButton: (closeModal, lineSection, variant) =>
      render(
        html`<evolv-accordion-header
          handle-align="right"
          data-track-ignore="true"
          @click=${utils.events.clickRemove(closeModal, lineSection)}
          css=".button-icon-wrap{transform: rotate(-90deg)}"
          >Remove from cart
        </evolv-accordion-header>`,
      ),

    modalCTASection: (vzReturn) =>
      render(
        html`<evolv-modal-footer>
          <evolv-button data-track-ignore="true">Confirm</evolv-button>
          <evolv-button ${utils.dataTrack('go back')} @click=${vzReturn.click}
            >Go back</evolv-button
          >
        </evolv-modal-footer>`,
      ),

    byodModalButton: (type) => {
      const editButtonClass = `evolv-${contextId}-edit-modal-button-${type}`;
      const editButtonId = `evolv-${contextId}-edit-modal-button-${type}-${index}`;
      const dataTrackName = (state) =>
        `evolv-modal-line-edit-${type}-${index}:${state}`;
      return render(html`
        <evolv-text-link
          id="${editButtonId}"
          class="${editButtonClass}"
          role="button"
          type="standAlone"
          ${utils.dataTrack(dataTrackName('expanded'))}
          @click=${utils.events.clickByodModalButton(type)}
        >
          Edit
        </evolv-text-link>
      `);
    },

    accordionDetailsPanel: (detailsHTML, secondNumber) =>
      makeElement(detailsHTML, {
        'a[data-testid="plan-info-link"]': () =>
          secondNumber
            ?.querySelector('a[data-testid="plan-info-link"]')
            ?.click(),
      }),
  };

  utils.app = {
    control: (variable) => {
      const { describe } = window.evolv.utils[contextId];
      describe(contextId, variable, 'v0');
    },

    setupIframeObserver: (modalDialog, iframe, selectorList, variant) => {
      const { body } = iframe.contentDocument || iframe.contentWindow.document;
      window.evolv.utils.ccrec;

      // Define observer library for iframe document
      class ObserverItem {
        constructor(key, selector) {
          this.selector = selector;
          this.elements = [];
          this.onConnect = [];
          this.className = `evolv-${key}`;
        }
      }

      const observerList = {};
      Object.keys(selectorList).forEach((key) => {
        observerList[key] = new ObserverItem(key, selectorList[key]);
      });

      const processItems = () => {
        utils.hasRun.elementConnected = false;
        Object.keys(observerList).forEach((key) => {
          const item = observerList[key];
          const elementsPrevious = item.elements;
          const elementsCurrent = Array.from(
            body.querySelectorAll(item.selector),
          );

          elementsCurrent.forEach((element) => {
            if (!element.classList.contains(item.className)) {
              element.classList.add(item.className);
            }

            if (!elementsPrevious.includes(element)) {
              debug(`iframe collect: ${key}`);
              elementConnected = true;
              item.onConnect.forEach((callback) => callback(element));
            }
          });

          item.elements = elementsCurrent;
        });

        if (utils.hasRun.elementConnected) {
          debouncedProcessItems();
        }
      };

      const debouncedProcessItems = utils.debounce(processItems, 100);
      utils.iframeObserver = new MutationObserver(debouncedProcessItems);

      // Loader

      if (!utils.hasRun.pageTitle) {
        observerList['page-title'].onConnect.push((pageTitle) => {
          // This class hides the loader and resizes the iframe wrapper.
          // If you resize the wrapper before the pageTitle loads the modal
          // goes into a resize loop
          addClass(modalDialog, 'evolv-loaded');
        });
      }

      // Init Mutation Observer

      log('init mutation observer on iframe body');

      utils.iframeObserver.observe(body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      return { observerList };
    },

    // Single edit link
    updateTrashButton: (state, lineRemove) => {
      const isDisabled = lineRemove.hasAttribute('disabled');
      addClass(lineRemove, 'evolv-hide');
      const lineRemoveSibling = lineRemove.nextElementSibling;
      const newButton = utils.components.trashButton(isDisabled);

      if (newButton.outerHTML === lineRemoveSibling?.outerHTML) {
        return;
      }

      if (
        lineRemoveSibling?.classList?.contains(
          `evolv-${contextId}-icon-button-trash`,
        )
      ) {
        log('replace trash button');
        lineRemoveSibling.replaceWith(newButton);
      } else {
        log('insert trash button');
        lineRemove.after(newButton);
      }
    },

    singleEditLink: (variant) => {
      const { templates, components, app } = window.evolv.utils[contextId];

      mut8('line-remove').customMutation((state, lineRemove) => {
        const wrapClass = `evolv-${contextId}-line-remove-wrap`;
        if (lineRemove.getAttribute('aria-label')?.includes('Second Number')) {
          addClass(lineRemove.parentNode, wrapClass);
        } else if (lineRemove.parentNode.getAttribute('type')) {
          wrap(lineRemove, `<div class="${wrapClass}"></div>`);
        }
      });

      // Common trash button mutation
      mut8('line-remove').customMutation(
        utils.app.updateTrashButton,
        utils.app.updateTrashButton,
      );

      // Common line links mutation with contextId-specific selectors
      mut8('line-all-links').customMutation((state, lineAllLinks) => {
        lineAllLinks
          .querySelectorAll(`.mutate-${contextId}-line-remove`)
          .forEach((lineRemove) => {
            if (
              lineRemove.getAttribute('aria-label')?.includes('Second Number')
            ) {
              return;
            }
            const previousSibling = lineRemove.previousElementSibling;
            if (
              previousSibling?.classList?.contains(
                `evolv-${contextId}-link-button-edit`,
              )
            ) {
              return;
            }

            if (!previousSibling) {
              log('insert line edit button');
              lineRemove.before(components.lineEditButton('Edit', variant));
            } else if (
              Array.from(previousSibling.classList).some((className) =>
                className.startsWith(`evolv-${contextId}-edit-modal-button`),
              )
            ) {
              log('replace line edit button');
              previousSibling.replaceWith(
                components.lineEditButton('Edit', variant),
              );
            }
          });
      });

      // Modal setup with conditional tracking and accordion
      mut8('pdp-modal-dialog')
        .inject(templates.PDPModalLoaderOverlay())
        .append();
      mut8('pdp-modal-close').inject(components.modalClose(), false).before();
      mut8('pdp-modal-close').attributes({
        'data-track': false,
        'data-track-ignore': true,
      });
      mut8('pdp-modal').inject(templates.PDPModalHeading()).prepend();

      mut8('pdp-iframe').customMutation((_, iframe) => {
        log('init pdp-iframe');

        const modalDialog = utils.getOutermost(
          iframe,
          'div[class^="ModalDialogWrapper-VDS"]',
        );

        const closeModal = modalDialog.querySelector(
          'button[data-testid="modal-close-button"]',
        );

        const selectorList = {
          'page-title':
            'div[data-testid="pdp-page-title"] h1, div[data-testid="pdp-page-title"] h2',
          'accordion-button': '.accordionButton',
          'accordion-button-collapsed':
            '.accordionButton[aria-expanded="false"]',
          'accordion-button-enabled':
            '.accordionButton:not([aria-expanded="false"]):not([disabled])',
          'confirm-cta-section': 'div[data-testid="continueId"]',
          'confirm-cta': 'button[data-testid="continueButtonId"]',
          input: 'input',
        };

        const lineNumber = utils.lineLastEdited;
        const lineSection = collect
          .get(`${contextId}-line`)
          .elements.find(
            (line) => utils.app.getLineNumber(line) === utils.lineLastEdited,
          );

        if (!lineSection) {
          fail(
            `version: ${config.version}, lineNumber: ${lineNumber}, lineSection: ${lineSection}, elements: ${JSON.stringify(collect.get(`${contextId}-line-name`).elements.map((el) => el.outerHTML))}, authStatus: ${vzdl.user.authStatus}, flow: ${vzdl.page.flow}, products: ${JSON.stringify(vzdl.txn.product.current)}`,
          );
          document
            .querySelector('#portal')
            .classList.add(`evolv-${contextId}-pdp-modal-fail`);
          return;
        }

        function getTrackName(type) {
          const text =
            lineSection
              .querySelector(`.mutate-${contextId}-${type}-name`)
              ?.textContent?.toLowerCase() || type;
          return `${text} edit for line ${lineNumber}`;
        }

        // Insert device edit accordion button
        const iframeWrapper = iframe.parentNode;
        const modal = iframeWrapper.parentNode;
        const modalDeviceEdit = makeElement(`
        <evolv-accordion id="evolv-${contextId}-pdp-modal-accordion" title-size="medium" handle-align="right">
          <evolv-accordion-item>
            <evolv-accordion-header track-name="${getTrackName('line')}">Edit this device</evolv-accordion-header>
            <evolv-accordion-details></evolv-accordion-details>
          </evolv-accordion-item>
        </evolv-accordion>`);
        if (!iframeWrapper.closest(`#evolv-${contextId}-pdp-modal-accordion`)) {
          iframeWrapper.insertAdjacentElement('beforebegin', modalDeviceEdit);
          modalDeviceEdit
            .querySelector('evolv-accordion-details')
            .append(iframeWrapper);
        }

        // Insert remaining modal buttons
        // Insert plan edit button
        if (
          !modal.querySelector(`.evolv-${contextId}-pdp-modal-edit-plan`) &&
          lineSection.querySelector(`.mutate-${contextId}-plan-edit`)
        ) {
          const trackName = getTrackName('plan');
          const modalPlanEditButton = components.modalPlanEditButton(
            lineSection,
            trackName,
          );
          modal.append(modalPlanEditButton);
        }

        // Insert protection edit button
        if (
          !modal.querySelector(
            `.evolv-${contextId}-pdp-modal-edit-protection`,
          ) &&
          lineSection.querySelector(`.mutate-${contextId}-protection-edit`)
        ) {
          const trackName = getTrackName('protection');
          const modalProtectionEditButton =
            components.modalProtectionEditButton(lineSection, trackName);
          modal.append(modalProtectionEditButton);
        }

        // Insert remove button
        // if (!modal.querySelector('.evolv-ccrec-pdp-modal-edit-remove')) {
        //   const modalRemoveButton = components.modalRemoveButton(closeModal, lineSection, variant);
        //   modal.append(modalRemoveButton);
        // }

        // Insert CTA section
        let modalCTASection = modal.querySelector(
          `.evolv-${contextId}-pdp-modal-cta-section`,
        );
        if (!modalCTASection) {
          modalCTASection = utils.components.modalCTASection(closeModal);
          modal.append(modalCTASection);
        }

        // Subscribe to iframe content
        subscribe(
          () => iframe.contentWindow?.document?.body,
          () => !iframe.isConnected,
          100,
        ).then((body) => {
          if (!body) {
            return;
          }
          const { head } =
            iframe.contentDocument || iframe.contentWindow.document;

          // Insert styles into iframe
          if (!head.querySelector('style#evolv-iframe-styles')) {
            log('insert iframe styles');
            const iframeStyles = makeElement(templates.PDPModalIframeStyles());
            head.append(iframeStyles);
          }

          // Launch iFrame Observer

          const { observerList } = app.setupIframeObserver(
            modalDialog,
            iframe,
            selectorList,
            variant,
          );

          observerList['page-title'].onConnect.push((pageTitle) => {
            // Expand all accordions
            let accordionCount = 0;
            let accordionSpammers = [];
            observerList['accordion-button-collapsed'].onConnect.push(
              (accordionButton) => {
                log(
                  `pdp accordion: found '${accordionButton.firstChild.textContent.toLowerCase()}'`,
                );
                const accordionIndex = accordionCount;
                accordionSpammers[accordionIndex] = setInterval(() => {
                  if (
                    accordionButton.isConnected &&
                    accordionButton.getAttribute('aria-expanded') === 'false'
                  ) {
                    log(
                      `pdp accordion: expand '${accordionButton.firstChild.textContent.toLowerCase()}'`,
                    );
                    accordionButton.click();
                  } else {
                    log(
                      `pdp accordion: clear '${accordionButton.firstChild.textContent.toLowerCase()}'`,
                    );
                    clearInterval(accordionSpammers[accordionIndex]);
                  }
                }, 100);
                accordionCount += 1;
              },
            );

            // Disable all accordion buttons
            observerList['accordion-button-enabled'].onConnect.push(
              (accordionButton) => {
                log(
                  `pdp accordion: disable '${accordionButton.firstChild.textContent.toLowerCase()}' button`,
                );
                accordionButton.disabled = true;
              },
            );
          });

          // Add click forwarding to confirm CTA

          observerList['confirm-cta'].onConnect.push((confirmCTA) => {
            log('add click forwarding to confirm CTA');
            modalCTASection
              .querySelector(`.evolv-${contextId}-pdp-modal-cta-confirm`)
              .addEventListener('click', () => confirmCTA.click());
          });
        });
      });
    },

    updateLineHeading: (state, lineColorSizePriceFRP) => {
      const type = lineColorSizePriceFRP.closest(
        'div[type=MOBILE], div[type=DESKTOP]',
      );
      if (!type) {
        return;
      }
      const typeOption = type.getAttribute('type');
      const isMobile = typeOption === 'MOBILE';
      const nameElement = type.querySelector(`.mutate-${contextId}-line-name`);
      const name = nameElement
        ?.querySelector('h1, h2, h3, h4')
        ?.innerHTML?.replaceAll(/class="[\w\s-]+"/g, '');
      const price =
        type.querySelector(`.mutate-${contextId}-line-price`)?.childNodes?.[0]
          ?.data ||
        type.querySelector(`.mutate-${contextId}-line-frp span`)?.textContent;
      const colorSize = type.querySelector(
        `.mutate-${contextId}-line-color-size`,
      )?.textContent;
      const info =
        type.querySelector(`.mutate-${contextId}-line-info`) ||
        getAncestor(nameElement, 4);

      if (!(name && info)) {
        return;
      }

      const additionClass = `.evolv-${contextId}-line-info-addition`;
      const additionTypeClass = `${additionClass}-${isMobile ? 'mobile-top' : 'desktop'}`;
      let addition = info.querySelector(additionTypeClass);
      if (!addition) {
        const additionTemplate = `lineInfo${utils.capitalizeFirstLetter(typeOption)}Addition`;
        info.insertAdjacentHTML(
          'afterbegin',
          utils.templates[additionTemplate](),
        );
        addition = info.querySelector(additionTypeClass);
      }

      const nameSlot = addition.querySelector(`${additionClass}-name`);
      const descSlot = addition.querySelector(`${additionClass}-description`);
      const priceSlot = addition.querySelector(`${additionClass}-price`);

      updateHTML(
        nameSlot,
        `<evolv-title size="small" breakpoint="751px">${name}</evolv-title>`,
      );

      updateHTML(
        descSlot,
        colorSize
          ? `<evolv-title size="xsmall" color="gray44" breakpoint="751px">${colorSize}</evolv-title>`
          : null,
      );
      updateHTML(
        priceSlot,
        price
          ? `<evolv-title size="small" breakpoint="751px">${price}</evolv-title>`
          : null,
      );

      addClass(type, `evolv-${contextId}-has-line-heading`);
      addClass(type, `evolv-${contextId}-${isMobile ? 'max-849' : 'min-850'}`);
    },

    updateCartTile: (state, lineColorSizePriceFRP) => {
      const line = lineColorSizePriceFRP.closest(`.mutate-${contextId}-line`);
      if (!line) {
        return;
      }
      line
        .querySelectorAll('[data-testid="NSE_BYOD_CTA_CONTAINER"]:empty')
        .forEach((empty) => addClass(empty.parentNode, 'evolv-hide'));
      utils.app.updateLineHeading(state, lineColorSizePriceFRP);
    },

    updateCartTitle: (state, cartTitle) => {
      const h1 = cartTitle.querySelector('h1');
      if (h1.textContent === 'Review your order.') {
        h1.textContent = 'Review and place your order.';
      }

      const cartTitleNext = cartTitle.nextElementSibling;

      if (cartTitleNext.id === 'next_step_div') {
        utils.wrap(
          [cartTitle, cartTitleNext],
          `<div class="evolv-${contextId}-cart-title-wrap"></div>`,
        );
      }

      const toAppend =
        cartTitle.closest(`.evolv-${contextId}-cart-title-wrap`) || cartTitle;

      if (
        toAppend.parentElement.classList.contains(
          `mutate-${contextId}-content-wrap`,
        )
      ) {
        const newParent =
          document.querySelector(`.evolv-${contextId}-cart-left`) ||
          collect.get(`${contextId}-content`).elements[0];
        newParent.prepend(toAppend);
      }
    },

    updateEditModal: (state, editLink) => {
      const line = editLink.closest(`.mutate-${contextId}-line`);
      if (!line) {
        return;
      }

      const isPlan = editLink.classList.contains(
        `mutate-${contextId}-plan-edit`,
      );
      const hasDeviceEdit = !!line.querySelector(
        '[data-testid="MiniPdpMainComponentEditButton"]',
      );
      const slotSelector = isPlan
        ? '.evolv-modal-edit-plan'
        : '.evolv-modal-edit-protection';

      if (hasDeviceEdit) {
        return;
      }

      const byodModalButtonWrap = line.querySelectorAll(
        `.mutate-${contextId}-line-remove-wrap`,
      );

      byodModalButtonWrap.forEach((buttonWrap) => {
        utils.modal;
        const type = buttonWrap
          .closest('[type=MOBILE], [type=DESKTOP]')
          .getAttribute('type')
          .toLowerCase();
        const modalButtonClass = `evolv-${contextId}-edit-modal-button-${type}`;

        const byodModalButtonExisting = line.querySelector(
          `.${modalButtonClass}, .evolv-${contextId}-link-button-line-edit`,
        );
        if (!byodModalButtonExisting) {
          const byodModalButtonNew = utils.components.byodModalButton(type);
          const modalNew = byodModalButtonNew.querySelector('.evolv-modal');
          buttonWrap.prepend(byodModalButtonNew);
          utils.modal.instances[utils.modal.index] = new utils.components.Modal(
            modalNew,
            document.activeElement,
            `.evolv-${contextId}-pdp-modal-edit`,
          );
          utils.modal.index += 1;
          addClass(line, `evolv-${contextId}-has-custom-edit-modal`);
        }
        const slot = buttonWrap.querySelector(slotSelector);
        const modalEditButtonExisting = slot.querySelector(
          `.evolv-${contextId}-pdp-modal-edit`,
        );

        if (!modalEditButtonExisting) {
          const modalEditButtonNew = isPlan
            ? utils.components.modalPlanEditButton(line)
            : utils.components.modalProtectionEditButton(line);
          slot.append(modalEditButtonNew);
        }
      });
    },

    relocateBanners: () => {
      collect
        .get(`${contextId}-alert-banner`)
        .subscribe((action, banner, banners) => {
          const bannerArea = document.querySelector(
            `.evolv-${contextId}-banner-area`,
          );
          switch (action) {
            case 0: {
              // Add
              log('alert banner: insert');
              const bannerNew = banner.cloneNode(true);
              banner.dataset.evolvBannerId = utils.bannerIndex;
              bannerNew.dataset.evolvBannerSource = utils.bannerIndex;
              utils.forwardClicks(bannerNew, banner);
              bannerArea.prepend(bannerNew);
              utils.bannerIndex += 1;
              break;
            }
            case 1: {
              // Remove
              log('alert banner: remove');
              const index = banner.dataset.evolvBannerId;
              const bannerNew = bannerArea?.querySelector(
                `.evolv-${contextId}-banner-area [data-evolv-banner-source="${index}"]`,
              );
              bannerNew?.remove();
              break;
            }
            case 2: {
              // Modify
              const index = banner.dataset.evolvBannerId;
              const bannerNew = bannerArea.querySelector(
                `.evolv-${contextId}-banner-area [data-evolv-banner-source="${index}"]`,
              );

              utils.updateElement(bannerNew, banner, (target) => {
                target.removeAttribute('data-evolv-banner-id');
                target.dataset.evolvBannerSource = index;
              });
              break;
            }
          }
        });
    },

    cartRefreshCommon: (contextId, variant = 'v1') => {
      const { namespace, app } = utils;

      describe(contextId, 'c1');
      describe(contextId, 'c1', variant);
      namespace(contextId);
      namespace(contextId, 'c1');
      namespace(contextId, 'c1', variant);

      utils.variant ??= {};
      utils.variant.c1 = variant;
      utils.bannerIndex = 0;

      utils.observeWindowWidth();

      mut8('plan-name').customMutation((state, planName) => {
        addClass(getAncestor(planName, 3), `evolv-${contextId}-plan-name-wrap`);
      });

      app.singleEditLink('v4');

      mut8('global-header').customMutation((state, globalHeader) => {
        new ResizeObserver(() =>
          utils.updateProperty(
            '--evolv-gh-height',
            `${Math.round(globalHeader.getBoundingClientRect().height)}px`,
          ),
        ).observe(globalHeader);
      });

      mut8('order-summary').customMutation((state, orderSummary) => {
        const left = utils.wrap(
          utils.getPrecedingSiblings(orderSummary),
          `<div class="evolv-${contextId}-cart-left"></div>`,
        );

        new ResizeObserver(() =>
          utils.updateProperty(
            '--evolv-cart-top',
            `${left.querySelector('.cart').offsetTop}px`,
          ),
        ).observe(left);
      });

      mut8('cart')
        .inject(`<div class="evolv-${contextId}-banner-area"></div>`)
        .before();

      utils.app.relocateBanners();

      mut8('cart-title').customMutation(app.updateCartTitle);

      mut8('line-image-wrap')
        .child()
        .classes({ [`evolv-${contextId}-margin-0`]: true });

      mut8('line-text')
        .parent()
        .classes({ [`evolv-${contextId}-margin-0`]: true })
        .parent()
        .classes({ [`evolv-${contextId}-line-text-wrap`]: true });

      mut8('account-owner').text('Account Owner');

      mut8('line-remove').customMutation((state, lineRemove) => {
        const type = lineRemove.closest('[type="MOBILE"], [type="DESKTOP"]');
        if (type) {
          type.parentNode.classList.add(`evolv-${contextId}-margin-0`);
        }
      });

      mut8('line-info').customMutation((state, lineInfo) => {
        lineInfo
          .closest('[type="DESKTOP"]')
          ?.classList?.add(`evolv-${contextId}-line-info-row`);
      });

      mut8('line-name').customMutation((state, lineName) => {
        addClass(
          getAncestor(lineName, 4),
          `evolv-${contextId}-line-info-inner`,
        );
      });

      mut8('line-details').customMutation(
        app.updatePerkSection,
        app.updatePerkSection,
      );

      mut8('line-color-size-price-frp').customMutation(
        app.updateCartTile,
        app.updateCartTile,
      );
      mut8('line-color-size-price-frp').customMutation(
        app.updateFinancing,
        app.updateFinancing,
      );
      mut8('line-ships').customMutation(utils.app.updateFinancing);
      mut8('line-fulfilled').customMutation(utils.app.updateFinancing);
      mut8('plan-or-protection-edit').attributes({ 'data-track-ignore': true });

      mut8('shop-phones').customMutation((state, shopPhones) => {
        const typeElement = shopPhones.closest(
          '[type="DESKTOP"], [type="MOBILE"]',
        );
        const type = typeElement.getAttribute('type').toLowerCase();
        const line = shopPhones.closest(`.mutate-${contextId}-line`);
        const lineAddition = utils.app.updateLineAddition(line);
        if (!lineAddition) {
          return;
        }
        const shopPhonesSlot = lineAddition.querySelector(
          `.evolv-${contextId}-line-addition-shop-phones`,
        );
        addClass(line, `evolv-${contextId}-line-shop-phones`);
        addClass(shopPhones, `evolv-${contextId}-${type}`);

        if (type === 'desktop') {
          addClass(typeElement.parentNode, `evolv-${contextId}-hide`);
        }

        shopPhonesSlot.append(shopPhones);
      });

      mut8('cart-title-build').customMutation((state, title) => {
        let element = title;
        const elements = [];

        if (
          element.parentElement.classList.contains(
            `evolv-${contextId}-cart-left`,
          )
        ) {
          return;
        }

        while (element && !element.classList.contains('order')) {
          elements.push(element);
          element = element.nextElementSibling;
        }

        utils.wrap(
          elements,
          `<div class="evolv-${contextId}-cart-left"></div>`,
        );
      });

      mut8('plan-or-protection-edit').customMutation(
        app.updateEditModal,
        app.updateEditModal,
      );

      mut8('line-item-remove').on('click', app.removeDeviceSavingsBanner);

      mut8('accordion-protection-text')
        .parent()
        .classes({ [`evolv-${contextId}-margin-0`]: true });

      mut8('checkout-section').customMutation((state, checkoutSection) => {
        new ResizeObserver(() =>
          utils.updateProperty(
            '--evolv-cta-section-height',
            `${Math.round(checkoutSection.getBoundingClientRect().height)}px`,
          ),
        ).observe(checkoutSection);
      });
    },
  };

  utils.commonSelectors = {
    root: '#root',
    line: `//h2[${containsKey('line-name')}]/ancestor::div[@type]/ancestor::div[5]`,
    'line-text': 'span[id^="Line "][id*="_text"]',
    'line-details': `//div[${containsKey('plan-section')}]/.. | //div[${containsKey('line-content')}]//div[@data-testid="protectionSection"][not(${containsKey('protection-section')})]/.. | //div[${containsKey('line-content')}]//div[@data-testid="test-component"]/..`,
    'plan-section': `//div[${containsKey('plan-text')}]/ancestor::div[4]`,
    'plan-text': '//p[contains(@id, "_plan_text")]/ancestor::div[2]',
    'plan-edit': '//a[@data-testid="prepaid-plan-edit-link"]',
    'plan-item': '//p[contains(@id, "_planName")]/ancestor::div[2]',
    'plan-name': '//p[contains(@id, "_planName")]',
    'plan-price': '//p[contains(@id, "_planPrice")]',
    'plan-auto-pay': `//div[${containsKey('plan-section')}]//p[@data-testid="auto_Pay_Banner_Plan"]/parent::div`,
    'protection-section': `//div[${containsKey('line-content')}]//div[@data-testid="protectionSection"]`,
    'protection-text-wrap': `//p[${containsKey('protection-price')}]/parent::div`,
    'protection-text': `//div[${containsKey('line-content')}]//p[@id="protectionText"]/parent::div`,
    'protection-edit': '//a[@id="edit-device-protection"]/ancestor::div[2]',
    'protection-add': 'div[data-testid="LearnMoreLinkMobile"]',
    'acp-section': '//div[@data-testid="test-component"]',
    'acp-name': '//div[@data-testid="test-component"]//p[text()="AppleCare+"]',
    'acp-price':
      '//div[@data-testid="test-component"]//p[contains(text(), "$")]',
    'acp-remove':
      '//div[@data-testid="test-component"]//a[@aria-label="Remove"]',
    'protection-all-edit-links': anyKey(
      ['protection-edit', 'acp-remove'],
      `//div[contains(@class, "evolv-${contextId}-protection")]`,
    ),
    'content-wrap':
      '//div[contains(concat(" ", normalize-space(@class), " "), " content ")]/parent::div',
    content: '.content',
    'order-summary': '.order',
    'cta-section': '//button[@id="ordersummary-button"]/ancestor::div[4]',

    // Single edit link
    'line-edit': 'a[data-testid="MiniPdpMainComponentEditButton"]',
    'line-remove': 'a[data-testid="show-modal"]',
    'line-remove-wrap':
      '//a[@data-testid="show-modal"]/parent::div[not(@type)]',
    'protection-edit':
      'a[data-testid="edit-device-protection"], a[aria-label="Add device protection"]',
    'line-all-links': `${includesAll('line', ['line-edit', 'line-remove'])}`,
    'pdp-modal-dialog': `//div[${containsKey('pdp-modal')}]/ancestor::div[contains(@class, "ModalDialogWrapper-VDS")][2]`,
    'pdp-modal': `//iframe[${containsKey('pdp-iframe')}]/ancestor::div[@id="miniPdpModal"]//div[@data-testid="modal-body"]`,
    'pdp-iframe':
      '[id^="miniPdpIframe"][src^="/us/smartphones/"], [id^="miniPdpIframe"][src^="/us/tablets/"], [id^="miniPdpIframe"][src^="/us/connected-smartwatches/"], [id^="miniPdpIframe"][src^="/us/internet-devices/"]',

    // Style refresh
    'global-header': '#vz-gh20',
    'alert-banner': `//div[${containsClass(`evolv-${contextId}-banner-area`)}]/preceding::div[contains(@class,"AlertWrapper")]/parent::div[not(@data-evolv-banner-source)]`,
    cart: '.cart',
    'cart-title': `//div[${containsKey('content-wrap')}]/div/h1[@id="expresscart-title-id"]/parent::div`,
    'cart-title-build': `//div[${containsClass('cart')}]/preceding-sibling::div[${containsClass(`evolv-${contextId}-banner-area`)}]/preceding-sibling::div[contains(.,"Build your order.")]`,
    'account-owner': `//div[${containsClass('cart')}]//p[contains(text(), "account owner")]`,
    layout: '#layout',

    'line-image-wrap': '//img[@alt="Line"]/ancestor::div[2]',
    'line-financing': `//div[@type="MOBILE" or @type="DESKTOP"]//p[contains(.,"for 36 months") and not(${containsClass(`evolv-${contextId}-financing-message`)})]`,
    'line-ships': `//div[${containsKey('line')}]//div[@data-testid="unlockDeviceMount"]`,
    'line-fulfilled': `//div[${containsKey('line')}]//div[@data-testid="unlockDeviceMount"]`,
    'line-item-remove': `button[data-testid="remove-item-button"]`,
    'checkout-section': `//button[@data-testid="ordersummary-button"]/ancestor::div[4]`,
  };

  if (window.location.pathname.includes('/sales/nextgen/expresscart')) {
    addClass(document.body, `evolv-${contextId}-expresscart`);
    removeClass(document.body, `evolv-${contextId}-orderreview`);
    utils.isOrderReview = false;
  } else if (window.location.pathname.includes('/sales/nextgen/orderreview')) {
    addClass(document.body, `evolv-${contextId}-order-review`);
    removeClass(document.body, `evolv-${contextId}-express-cart`);
    utils.isOrderReview = true;
  }
}

var index$1 = (config) => {
  function initIntegration() {
    const utils = window.evolv.utils.init('cart-refresh');
    utils.log(`init cart-refresh version ${version}`);
    const webURL = 'web.url';

    function checkURL(key, url) {
      if (!(key === webURL)) return;

      if (/sales\/nextgen\/(expresscart|orderreview)\.html/.test(url)) {
        window.evolv.cartRefresh = cartRefresh;
      }
    }
  
    checkURL(webURL, evolv.context.get(webURL));
    evolv.client.on('context.value.added', checkURL);
    evolv.client.on('context.value.changed', checkURL);
  }
  if (window.evolv?.utils) {
    initIntegration();
  } else {
    window.addEventListener('evolvutilsinit', initIntegration);
  }
};

module.exports = index$1;
