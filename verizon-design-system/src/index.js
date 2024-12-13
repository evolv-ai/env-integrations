import { version } from '../package.json';

export default (config) => {
  function init() {
    if (window.evolv?.vds) {
      return;
    }

    const utils = window.evolv.utils.init('verizon-design-system');
    const { log, debug, makeElement } = utils;
    log('init verizon design system version', version);

    window.evolv.vds ??= {};
    const { vds } = window.evolv;

    vds.version = version;
    vds.accordionIndex = 0;
    vds.accordionItemIndex = 0;
    vds.accordions = [];
    vds.tooltipIndex = 0;

    utils.toCamelCase = (string) => {
      return string.replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) =>
        chr.toUpperCase()
      );
    };

    utils.capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    utils.remToPx = (remString) => {
      const rems = parseFloat(remString);
      const oneRem = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize
      );
      return rems * oneRem;
    };

    utils.cssToValue = (cssString) => {
      const unit = cssString.match(/\d+\.?\d*(px|rem)/i)?.[1];
      const value = parseFloat(cssString);
      if (unit === 'px') {
        return value;
      } else if (unit === 'rem') {
        return utils.remToPx(cssString);
      } else {
        return NaN;
      }
    }

    utils.cleanString = (value) => {
      let valueCurrent;
      if (value === null || typeof value === 'undefined') {
        valueCurrent = '';
      } else if (typeof value !== 'string') {
        valueCurrent = value.toString();
      } else {
        valueCurrent = value;
      }

      return valueCurrent;
    };

    utils.updateProperty = (
      property,
      value,
      element = document.documentElement
    ) => {
      if (!element || !property) {
        return;
      }
      const valuePrevious = element.style.getPropertyValue(property);
      const valueCurrent = utils.cleanString(value);

      if (valueCurrent == valuePrevious) {
        return;
      }

      element.style.setProperty(property, valueCurrent);
    };

    utils.isTouchDevice = () => {
      return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
    }

    utils.getOffsetRect = (element) => {
      const box = element.getBoundingClientRect();
      const body = document.body;
      const documentElement = document.documentElement;

      const scrollTop = documentElement.scrollTop || body.scrollTop;
      const scrollLeft = documentElement.scrollLeft || body.scrollLeft;

      const clientTop = documentElement.clientTop || body.clientTop;
      const clientLeft = documentElement.clientLeft || body.clientLeft;

      const top = Math.round(box.top + scrollTop - clientTop);
      const bottom = top + box.height;
      const left = Math.round(box.left + scrollLeft - clientLeft);
      const right = left + box.width;
      const { width, height } = box;

      return { top, bottom, left, right, width, height }
    }

    vds.VZBase = class VZBase extends HTMLElement {
      constructor(config = {}) {
        super();

        const designTokens = `:host {
          --font-family-etx: Verizon-NHG-eTX, Helvetica, Arial, sans-serif;
          --font-family-eds: Verizon-NHG-eDS, Helvetica, Arial, sans-serif;
          --color-gray-11: #1b1d1f;
          --color-gray-20: #333333;
          --color-gray-44: #6f7171;
          --color-gray-65: #a7a7a7;
          --color-gray-85: #d8dada;
          --color-gray-95: #f6f6f6;
          --color-red: #ee0000;
          --color-overlay: rgba(0, 0, 0, 0.3);
          --border-gray: 0.0625rem solid var(--color-gray-85);
        }`;

        this.mixins = {
          bodyText: {
            sm: () => `
              font-family: var(--font-family-etx);
              font-size: 0.75rem;
              line-height: 1rem;
              font-weight: 400;
              letter-spacing: normal;
              margin: 0;
              padding: 0;
              `,
            lg: () => `
              font-family: var(--font-family-eds);
              font-size: 1rem;
              line-height: 1.25rem;
              font-weight: 400;
              letter-spacing: 0.03125rem;
              margin: 0;
              padding: 0;`,
          },
        };

        this.shadow = this.attachShadow({ mode: 'open' });

        this.shadow.innerHTML = `<style>
          ${designTokens}

          :host,
          :host::before,
          :host::after {
            box-sizing: border-box;
          }

          :host *,
          :host *::before,
          :host *::after {
            box-sizing: inherit;
          }

          [hidden] {
            display: none;
          }

          .unbutton {
            background: none;
            border: none;
            ${this.mixins.bodyText.lg()}
          }

          .text-body-sm {
            ${this.mixins.bodyText.sm()}
          }

          .body-text-lg {
            ${this.mixins.bodyText.lg()}
          }

        </style>`;
      }
    };

    vds.ColorOptionBase = class ColorOptionBase extends vds.VZBase {
      constructor() {
        super();

        const style = `
          :host > * {
            color: inherit;
          }
            
          :host([color="white"]) {
            color: white;
          }

          :host([color="black"]) {
            color: black;
          }

          :host([color="red"]) {
            color: var(--color-red);
          }
          
          :host([color="gray11"]) {
            color: var(--color-gray-11);
          }

          :host([color="gray20"]) {
            color: var(--color-gray-20);
          }

          :host([color="gray44"]) {
            color: var(--color-gray-44);
          }
        
          :host([color="gray65"]) {
            color: var(--color-gray-65);
          }

          :host([color="gray85"]) {
            color: var(--color-gray-85);
          }

          :host([color="gray95"]) {
            color: var(--color-gray-95);
          }`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
      }
    };

    vds.Title = class Title extends vds.ColorOptionBase {
      constructor() {
        super();

        this.size = this.getAttribute('size') || 'small';
        this.primitive = this.getAttribute('primitive') || null;
        this.breakpoint = this.getAttribute('breakpoint') || '768px';

        if (this.size && !this.primitive) {
          switch (this.size) {
            case '2xlarge':
              this.primitive = 'h1';
              break;
            case 'xlarge':
              this.primitive = 'h1';
              break;
            case 'large':
              this.primitive = 'h2';
              break;
            case 'medium':
              this.primitive = 'h2';
              break;
            case 'small':
              this.primitive = 'h3';
            case 'xsmall':
              this.primitive = 'h4';
            default:
          }
        }

        const style = `
          :host > * {
            ${this.mixins.bodyText.lg()}
            text-decoration: none;
          }

          :host([size="xsmall"]) > * {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }

          :host([size="medium"]) > * {
            font-size: 1.25rem;
            line-height: 1.5rem;
          }

          :host([size="large"]) > * {
            font-size: 1.5rem;
            line-height: 1.75;
          }

          :host([size="xlarge"]) > * {
            font-size: 2rem;
            font-weight: 300;
            line-height: 2.25rem;
            letter-spacing: 0.015625rem;
          }

          :host([size="2xlarge"]) > * {
            font-size: 2.5rem;
            font-weight: 300;
            line-height: 2.5rem;
          }

          :host([bold="true"]) > * {
            font-weight: 700;
          }

          @media screen and (min-width: ${this.breakpoint}) {
            :host > * {
              font-size: 1.25rem;
              line-height: 1.5rem;
            }

            :host([size="xsmall"]) > * {
              font-size: 1rem;
              line-height: 1.25rem;
            }

            :host([size="medium"]) > * {
              font-size: 1.5rem;
              line-height: 1.75rem;
            }

            :host([size="large"]) > * {
              font-size: 2rem;
              font-weight: 300;
              line-height: 2.25rem;
              letter-spacing: 0.015625rem;
            }

            :host([size="xlarge"]) > * {
              font-size: 3rem;
              line-height: 3rem;
            }

            :host([size="2xlarge"]) > * {
              font-size: 4rem;
              line-height: 4rem;
            }

            :host([bold="true"]) > * {
              font-weight: 700;
            }
          }`;

        const template = `<${this.primitive}>
          <slot></slot>
        </${this.primitive}>`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);
      }
    };

    vds.Icon = class Icon extends vds.ColorOptionBase {
      constructor() {
        super();

        this.name = this.getAttribute('name') || 'empty';
        this.type = this.getAttribute('type') || 'standAlone';
        this.size = this.getAttribute('size') || null;
        this.iconTitle =
          this.getAttribute('title') ||
          `${utils.capitalizeFirstLetter(this.name.replaceAll('-', ' '))} icon`;
        this.ariaHidden = this.getAttribute('aria-hidden') === 'true';
        this.breakpoint = this.getAttribute('breakpoint') || '768px';

        const style = `
          :host {
            --icon-size: 1rem;
          }

          div {
            display: flex;
            justify-content: center;
            align-items: center;
            height: var(--icon-size);
            width: var(--icon-size);
            /* min-height: var(--icon-size); */
            /* min-width: var(--icon-size); */
          }

          svg {
            height: var(--icon-size);
            width: var(--icon-size);
            /* min-height: var(--icon-size); */
            /* min-width: var(--icon-size); */
          }

          :host([size="medium"]) {
            --icon-size: 1.25rem;
          }

          :host([size="large"]) div {
            --icon-size: 1.5rem;
          }

          :host([size="xlarge"]) div {
            --icon-size: 1.75rem;
          }

          ${
            !['small', 'medium', 'large', 'xlarge', null]
              .some(iconSize => iconSize === this.size)
                ? `:host([size]) div {
                    --icon-size: ${this.size}
                  }`
                : ''
          }

          :host([type="inline"]) div {
            --icon-size: .9em;
            display: inline-block;
            position: relative;
            height: .8em;
          }

          :host([type="inline"]) svg {
            position: absolute;
            bottom: -.1em;
          }

          ${
            this.breakpoint
              ? `
                @media screen and (min-width: ${this.breakpoint}) {
                :host([breakpoint]) {
                  --icon-size: 1.25rem;
                }

                :host([size="medium"][breakpoint]) {
                  --icon-size: 1.5rem;
                }

                :host([size="large"][breakpoint]) {
                  --icon-size: 1.75rem;
                }

                :host([size="xlarge"][breakpoint]) {
                  --icon-size: 2rem;
                }
              }`
              : ''
          }
        `;

        const icons = {
          empty: ``,
          pencil: `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.86568 0.685059L1.53234 12.6202L0.717529 17.3147L4.87494 15.0091L13.2823 3.07395L9.86568 0.685059ZM4.18975 14.2128L2.11568 15.3702L2.48605 13.0184L8.0416 5.08321L9.75457 6.27765L4.18975 14.2128ZM8.65271 4.23135L10.1157 2.1295L11.8286 3.33321L10.3564 5.4258L8.65271 4.23135Z" fill="currentColor"/>
          </svg>`,
          'down-caret': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17.9555L2 7.95554L2.91111 7.04443L12 16.1333L21.0889 7.04443L22 7.95554L12 17.9555Z" fill="currentColor"/>
          </svg>`,
          'right-arrow': `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8956 25.6666L12.8365 24.6168L22.796 14.7421H2.3335V13.2578H22.796L12.8365 3.38312L13.8956 2.33331L25.6668 14L13.8956 25.6666Z" fill="currentColor"/>
          </svg>`,
          'trash-can': `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.71481 25.6666H21.2981V8.16665H6.71481V25.6666ZM8.16667 9.63146H19.8333V24.2148H8.16667V9.63146ZM16.9167 5.24998V2.33331H11.0833V5.24998H5.25V6.71479H22.75V5.24998H16.9167ZM15.4648 5.24998H12.5481V3.79813H15.4648V5.24998ZM10.6815 21.2981H12.1333V12.5481H10.6815V21.2981ZM15.8667 21.2981H17.3185V12.5481H15.8667V21.2981Z" fill="currentColor"/>
          </svg>`,
          phone: `<svg width="15" height="24" viewBox="0 0 15 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0V24H15V0H0ZM13.5 18.75H1.5V1.5H13.5V18.75ZM1.5 22.5V20.25H6.00001V21.75H9.00002V20.25H13.5V22.5H1.5Z" fill="currentColor"/>
          </svg>
          `,
          'phone-plan': `<svg width="15" height="24" viewBox="0 0 15 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0V24H15V0H0ZM13.5 18.75H1.5V1.5H13.5V18.75ZM1.5 22.5V20.25H6.00001V21.75H9.00002V20.25H13.5V22.5H1.5Z" fill="currentColor"/>
            <path d="M9.74389 12.7133H11.5V6.75H9.74389V12.7133Z" fill="currentColor"/>
            <path d="M6.62271 8.24999H8.37881V12.75H6.62271V8.24999Z" fill="currentColor"/><path d="M3.5 9.75001H5.25609V12.7133H3.5V9.75001Z" fill="currentColor"/>
          </svg>`,
          'phone-protection': `<svg width="15" height="24" viewBox="0 0 15 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M3 6V9.37402C3.07574 10.8026 3.53105 12.1858 4.32031 13.3828C5.10955 14.5799 6.20448 15.5486 7.49316 16.1895C8.78454 15.5471 9.88225 14.5772 10.6738 13.3779C11.4653 12.1786 11.9226 10.7929 12 9.36133V6H3ZM4.5 7.5H10.5V9.31055C10.4354 10.4754 10.0665 11.6029 9.42578 12.5801V12.5811C8.92847 13.3389 8.24737 13.9397 7.49316 14.4375C6.74194 13.9411 6.06365 13.3418 5.56836 12.5859C4.92961 11.6112 4.56316 10.487 4.5 9.3252V7.5ZM0 0V24H15V0H0ZM1.5 1.5H13.5V18.75H1.5V1.5ZM1.5 20.25H6V21.75H9V20.25H13.5V22.5H1.5V20.25Z"/>
          </svg>`,
          info: `
            <svg role="img" width="16" height="16" aria-hidden="false" aria-label="info icon" viewBox="0 0 21.6 21.6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M19.8,10.8a9,9,0,1,0-9,9A9.01054,9.01054,0,0,0,19.8,10.8Zm-1.12488,0A7.87513,7.87513,0,1,1,10.8,2.92486,7.88411,7.88411,0,0,1,18.67509,10.8ZM11.625,7.45852H9.95v-1.675h1.675ZM9.95834,9.11662H11.65v6.6999H9.95834Z" />
            </svg>`,
          close: `<svg width="16" height="16" viewBox="0 0 21.6 21.6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M11.59,10.8l7.11,7.1-.8.8-7.1-7.11L3.7,18.7l-.8-.8L10,10.8,2.9,3.7l.8-.8L10.8,10,17.9,2.9l.8.8Z"></path>
          </svg>`,
        };

        const template = `
          <div>
            ${icons[this.name]}
            <slot></slot>
          </div>`;

        const icon = makeElement(template);
        this.svg = icon.querySelector('svg');

        if (this.title && svg) {
          this.svg.insertAdjacentHTML(
            'afterbegin',
            `<title>${this.title}</title>`
          );
        }

        if (this.ariaHidden) {
          this.svg.setAttribute('aria-hidden', 'true');
        } else {
          this.svg.setAttribute('role', 'img');
        }

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.after(icon);
      }
    };

    vds.ButtonIcon = class ButtonIcon extends vds.VZBase {
      constructor() {
        super();

        this.name = this.getAttribute('name') || 'empty';
        this.disabled = this.getAttribute('disabled') || false;
        this.size = this.getAttribute('size') || 'small';
        this.breakpoint = this.getAttribute('breakpoint') || '768px';
        this.color = this.getAttribute('color') || 'black';

        switch (this.size) {
          case 'large':
            this.iconSize = 'large';
            break;
          case 'small':
          default:
            this.iconSize = 'medium';
        }

        const style = `
          button {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            touch-action: manipulation;
            cursor: pointer;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background-color: transparent;
            transition: box-shadow 0.1s ease-out 0s, background-color 0.1s ease-out 0s;
          }

          button:hover {
            outline: none;
            box-shadow: rgba(111, 113, 113, 0.06) 0px 0px 0px;
            background-color: rgba(111, 113, 113, 0.06);
          }

          button:hover:active {
            box-shadow: rgba(111, 113, 113, 0.06) 0px 0px 0px;
          }

          button:focus-visible {
            outline: 0.0625rem dashed black;
            outline-offset: 0.25rem;
          }

          :host([size="large"]) button {
            width: 2.75rem;
            height: 2.75rem;
          }

          button[disabled] {
            pointer-events: none;
            cursor: default;
            background-color: transparent;
            color: var(--color-gray-85);
          }

          ${
            this.breakpoint
              ? `
            @media screen and (min-width: ${this.breakpoint}) {
              button {
                width: 2.75rem;
                height: 2.75rem;
              }

              :host([size="large"]) button {
                width: 3.75rem;
                height: 3.75rem;
              }
            }`
              : ''
          }
          
        `;

        const template = `
          <button class="unbutton">
            <evolv-icon 
              name="${this.name}"
              size="${this.iconSize}"
              breakpoint="${this.breakpoint}"
              color: "${this.color}"
            >
              <slot></slot>
            </evolv-icon>
          </button>
        `;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);
      }

      attributeChangedCallback(attribute, oldValue, newValue) {
        const button = this.shadow.querySelector('button');
        switch (attribute) {
          case 'disabled':
            button.toggleAttribute('disabled', this.hasAttribute('disabled'));
            break;
          default:
        }
      }
    };

    vds.TextLink = class TextLink extends vds.VZBase {
      constructor() {
        super();

        this.size = this.getAttribute('size') || 'large';
        this.href = this.getAttribute('href') || null;
        this.type = this.getAttribute('type') || 'inline';
        this.ariaLabel = this.getAttribute('aria-label');
        this.tabindex = this.getAttribute('tabindex');

        const style = `
          a, :host([type=inline]) a {
            font-family: inherit;
            font-size: inherit;
            line-height: inherit;
            font-weight: inherit;
            letter-spacing: inherit;
            border-bottom-width: 0.0625rem;
            border-bottom-style: solid;
            cursor: pointer;
            position: relative;
            text-decoration: none;
            touch-action: manipulation;
            transition: opacity 0.15s ease-in 0s;
            pointer-events: auto;
            -webkit-tap-highlight-color: transparent;
            outline: none;
            color: inherit;
            border-color: inherit;
          }
    
          :host([type=standAlone]) a {
            color: black;
            border-color: black;
          }
    
          :host([type=standAlone]) a,
          :host([type=standAlone][size=small]) a {
            ${this.mixins.bodyText.sm()}
          }
    
          :host([type=standAlone][size=large]) a {
            ${this.mixins.bodyText.lg()}
          }

          a:active {
            color: var(--color-gray-44);
            border-bottom: 1px solid var(--color-gray-44);
            box-shadow: var(--color-gray-44) 0px 1px;
          }
          
          a:hover {
            box-shadow: black 0px 1px;
          }

          :host(:focus-visible),
            outline: black dashed 0.0625rem;
            outline-offset: 0.125rem;
            border-radius: 2px;
          }
    
          .hit-area {
            box-sizing: content-box;
            cursor: pointer;
            display: inline;
            height: 2.75rem;
            left: 50%;
            outline: none;
            position: absolute;
            text-align: center;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
          }
          
          .text {
            position: relative;
          }

          @media screen and (min-width: 751px) {
            :host([type=standAlone]) a,
            :host([type=standAlone][size=small]) a {
              ${this.mixins.bodyText.lg()}
            }
          }`;

        const template = `<a ${this.href ? `href="${this.href}"` : ''}>
          <span class="hit-area"></span>
          <span class="text">
            <slot></slot>
          </span>
        </a>`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);
      }

      connectedCallback() {
        if (!this.tabindex) {
          this.setAttribute('tabindex', '0');
        }
      }
    };

    vds.Button = class Button extends vds.VZBase {
      static observedAttributes = ['width', 'disabled'];

      constructor() {
        super();
        this.width = this.getAttribute('width') || null;
        this.disabled = this.getAttribute('disabled') === 'true' || false;

        const style = `
          button {
            ${this.mixins.bodyText.lg()}
            pointer-events: auto;
            padding: 0px;
            margin: 0px;
            border-radius: 2.75rem;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: center;
            justify-content: center;
            height: auto;
            position: relative;
            text-align: center;
            text-decoration: none;
            touch-action: manipulation;
            vertical-align: middle;
            width: auto;
            min-width: 4.75rem;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            white-space: nowrap;
            font-weight: 700;
            background-color: rgb(0, 0, 0);
            border: 0.0625rem solid rgb(0, 0, 0);
            color: rgb(255, 255, 255);
          }

          button:active {
            color: rgb(255, 255, 255);
            border-color: rgb(111, 113, 113);
            box-shadow: rgb(111, 113, 113) 0px 0px 0px 0.0625rem;
            background-color: rgb(111, 113, 113);
          }

          :host(:focus-visible) button {
            outline: black dashed 0.0625rem;
            outline-offset: 0.125rem;
          }

          button:hover:not(:active) {
            outline: none;
            box-shadow: rgb(0, 0, 0) 0px 0px 0px 0.0625rem;
            transition: all 0.1s ease-out 0s;
          }

          .hit-area {
            height: 2.75rem;
            width: 100%;
            left: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            text-align: center;
            top: 50%;
            content: "";
            display: inline-block;
          }

          .text {
            position: relative;
            max-width: 100%;
            box-sizing: border-box;
            display: inline-block;
            vertical-align: middle;
            -webkit-box-align: center;
            background: transparent;
            -webkit-box-pack: center;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            -webkit-tap-highlight-color: transparent;
            pointer-events: none;
            padding: calc(-1px + 0.75rem) 1.5rem;
          }

          .text:focus {
            outline: none;
          }

          .text:hover {
            outline: none;
          }
          
          :host([display=block]) button {
            display: block;
          }

          :host([display=inline-block]) button {
            display: inline-block;
          }

          :host([size=small]) button {
            ${this.mixins.bodyText.sm()}
            font-weight: 700
            border-radius: 2rem;
            min-width: revert;
          }

          :host([size=small]) button:focus-visible::before {
            border-radius: 2rem;
          }

          :host([use=secondary]) button {
            background-color: transparent;
            color: black;
          }

          button[disabled] {
            pointer-events: none;
            cursor: default;
            border: 0.0625rem solid var(--color-gray-85);
            background-color: transparent;
            color: var(--color-gray-85);
          }

          :host([use=secondary]) button[disabled] {
            color: var(--color-gray-85);
          }
        `;

        const template = `<button ${this.disabled ? 'disabled' : ''} ${
          this.width ? `style="width: ${this.width};"` : ''
        }>
          <span class=hit-area></span>
          <span class=text>
            <slot></slot>
          </span>
        </button>`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);
      }

      attributeChangedCallback(name, oldValue, newValue) {
        const button = this.shadow.querySelector('button');
        switch (name) {
          case 'disabled':
            button.toggleAttribute('disabled', this.hasAttribute('disabled'));
            break;
          case 'width':
            button.style.width = newValue;
            break;
          default:
        }
      }
    };

    vds.AccordionHeader = class AccordionHeader extends vds.VZBase {
      constructor() {
        super();

        this.accordion = this.closest('evolv-accordion') || null;
        this.accordionItem = this.closest('evolv-accordion-item') || null;
        this.accordionItemIndex =
          this.accordionItem?.getAttribute('index') || null;
        this.breakpoint =
          this.getAttribute('breakpoint') ||
          this.accordion?.getAttribute('breakpoint') ||
          '768px';
        this.durationCSS =
          this.getAttribute('duration') || this.accordion?.durationCSS;
        this.handleAlign =
          this.getAttribute('handle-align') ||
          this.accordion?.getAttribute('handle-align') ||
          'left';
        this.id =
          this.id || this.accordion?.accordionHeaderId(this.accordionItemIndex);
        this.padding =
          this.getAttribute('padding') || this.accordion?.padding || '1.5rem';
        this.paddingTablet =
          this.getAttribute('padding-tablet') ||
          this.accordion?.paddingTablet ||
          '2rem';
        this.titleSize = this.accordion?.getAttribute('title-size') || null;
        this.titleBold = this.accordion?.getAttribute('title-bold') || null;
        this.titleColor =
          this.accordion?.getAttribute('title-color') || 'black';

        const buttonIconSizes = {
          small: 'small',
          medium: 'large',
          large: 'large',
        };

        this.buttonIconSize = buttonIconSizes[this.titleSize];

        const style = `
          :host(:not([index="0"])) button {
            border-top: 1px solid var(--color-gray-85);
          }

          .header-button {
            display: block;
            width: 100%;
            display: flex;
            overflow: visible;
            text-align: left;
            align-items: center;
            gap: 1rem;
            padding: ${this.padding} 0;    
          }

          .header-button:hover {
            outline: none;
          }

          .header-button:focus-visible {
            outline: 0.0625rem dashed black;
            outline-offset: -1px;
          }

          .button-icon-wrap {
            position: relative;
            display: inline-block;
            width: 2rem;
            margin-right: auto;
            flex-shrink: 0;
          }

          .handle-align-right .button-icon-wrap {
            margin-right: 0;
            margin-left: auto;
          }

          evolv-button-icon {
            position: absolute;
            transform: translateY(-50%);
            transition: transform ${this.durationCSS} ease;
          }

          :host([aria-expanded="true"]) evolv-button-icon {
            transform: translateY(-50%) rotate(180deg);
          }

          ::slotted([slot="right"]) {
            text-align: right;
            justify-self: flex-end;
          }

          @media screen and (min-width: ${this.breakpoint}) {
            .header-button {
              padding: ${this.paddingTablet} 0;
            }

            .button-icon-wrap {
              width: 2.5rem;
            }
          }
        `;

        const template = `
          <button class="header-button unbutton handle-align-${
            this.handleAlign
          }">
            <evolv-title
              ${this.titleSize ? `size="${this.titleSize}"` : ''}
              ${this.titleBold ? `bold="${this.titleBold}"` : ''}
              color="${this.titleColor}"
              breakpoint="${this.breakpoint}"
            ><slot></slot></evolv-title>
            <div class="button-icon-wrap">
              <evolv-button-icon 
                ${this.buttonIconSize ? `size="${this.buttonIconSize}"` : ''}
                name="down-caret"
                tabindex="-1"
                breakpoint="${this.breakpoint}"
              ></evolv-icon>
            </div>
            <slot name="right"></slot>
          </button>
        `;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);
      }

      connectedCallback() {
        if (this.accordionItemIndex) {
          this.setAttribute('index', this.accordionItemIndex);
          this.setAttribute(
            'aria-controls',
            this.accordion.accordionDetailsId(this.accordionItemIndex)
          );
        }
      }
    };

    vds.AccordionDetails = class AccordionDetails extends vds.VZBase {
      constructor() {
        super();

        this.accordion = this.closest('evolv-accordion') || null;
        this.accordionItem = this.closest('evolv-accordion-item');
        this.accordionItemIndex = this.accordionItem?.accordionItemIndex;
        this.breakpoint = this.accordion?.breakpoint || '768px';
        this.durationCSS = this.accordion?.durationCSS || '0.33s';
        this.id = this.accordion?.accordionDetailsId(this.accordionItemIndex);
        this.padding = this.accordion?.padding || '1.5rem';
        this.paddingTablet = this.accordion?.paddingTablet || '2rem';
        this.detailsHeightProp = '--details-height';

        this.updateDetailsHeight = this.updateDetailsHeight.bind(this);

        const style = `
          :host {
            --duration: ${this.durationCSS};
            transition: all var(--duration) ease;
            overflow: hidden;
          }

          div {
            padding: 0 0 ${this.padding};
          }

          @media screen and (min-width: ${this.breakpoint}) {
            div {
              padding-bottom: ${this.paddingTablet};
            }
          }
        `;

        const template = `
          <div>
            <slot></slot>
          </div>`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);
      }

      connectedCallback() {
        this.setAttribute(
          'aria-labelledby',
          this.accordion.accordionHeaderId(this.accordionItemIndex)
        );

        const contents = this.shadow.querySelector('div');
        const observer = new ResizeObserver(this.updateDetailsHeight);
        observer.observe(contents);
      }

      get detailsHeightPrevious() {
        return this.style.getPropertyValue(this.detailsHeightProp);
      }

      get detailsHeightCurrent() {
        return `${this.scrollHeight}px`;
      }

      updateDetailsHeight() {
        const { detailsHeightPrevious, detailsHeightCurrent } = this;
        if (detailsHeightCurrent === detailsHeightPrevious) {
          return;
        }
        this.style.setProperty(this.detailsHeightProp, detailsHeightCurrent);
      }
    };

    vds.AccordionItem = class AccordionItem extends vds.VZBase {
      constructor() {
        super();

        this.accordionIndex = vds.accordionIndex;
        this.accordionItemIndex = vds.accordionItemIndex;

        const style = `
          
        `;

        const template = `
          <div>
              <slot></slot>
          </div>`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);

        vds.accordionItemIndex += 1;
      }

      connectedCallback() {
        this.setAttribute('slot', 'accordion');
        this.setAttribute('index', this.accordionItemIndex);
      }
    };

    vds.Accordion = class Accordion extends vds.VZBase {
      constructor() {
        super();

        this.accordionIndex = vds.accordionIndex;
        this.id = this.getAttribute('id') || `accordion-${this.accordionIndex}`;

        this.adobeTrack =
          this.getAttribute('adobe-track') === 'false' ? false : true;
        this.trackName = this.getAttribute('track-name') || null;
        this.durationCSS = this.getAttribute('duration') || '0.33s';
        this.durationJS = parseFloat(this.durationCSS) * 1000 || 330;
        this.openFirst = this.getAttribute('open-first') === 'true';
        this.padding = this.getAttribute('padding') || '1.5rem';
        this.paddingTablet = this.getAttribute('padding-tablet') || '2rem';
        this.type = this.getAttribute('type') === 'single' ? 'single' : 'multi';

        this.accordionItems = [];
        this.accordionDetails = [];
        this.accordionHeaders = [];

        this.trackValue = this.trackValue.bind(this);
        this.onSlotChange = this.onSlotChange.bind(this);
        this.accordionHeaderId = this.accordionHeaderId.bind(this);
        this.accordionDetailsId = this.accordionDetailsId.bind(this);
        this.accordionClick = this.accordionClick.bind(this);
        this.navigate = this.navigate.bind(this);
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);

        const style = `
        `;
        const template = `
          <div>
            <slot name="accordion"></slot>
          </div>`;

        vds.accordionIndex += 1;
        vds.accordionItemIndex = 0;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);

        const slot = this.shadow.querySelector('slot');
        slot.addEventListener('slotchange', this.onSlotChange);
      }

      trackValue(index, expanded) {
        const header = this.accordionHeaders[index];
        const trackName =
          header.getAttribute('track-name') ||
          (this.trackName ? `${`${this.trackName} ${index}`}` : null) ||
          `${this.id}-${index}`;
        return `{'type':'link','name':'${trackName}:${
          expanded ? 'expanded' : 'collapsed'
        }'}`;
      }

      accordionHeaderId(index) {
        return `${this.id}-header-${index}`;
      }

      accordionDetailsId(index) {
        return `${this.id}-details-${index}`;
      }

      expand(index) {
        const item = this.accordionItems[index];
        const header = this.accordionHeaders[index];
        const details = this.accordionDetails[index];
        item.setAttribute('expanded', 'true');
        header.setAttribute('aria-expanded', 'true');
        details.toggleAttribute('active', true);
        details.style.display = 'block';

        if (this.adobeTrack) {
          header.dataset.track = this.trackValue(index, false);
        }

        setTimeout(() => {
          details.updateDetailsHeight();
          details.style.maxHeight = `var(${details.detailsHeightProp})`;
          details.style.opacity = '1';
        }, 0);
      }

      collapse(index) {
        const item = this.accordionItems[index];
        const header = this.accordionHeaders[index];
        const details = this.accordionDetails[index];
        item.setAttribute('expanded', 'false');
        header.setAttribute('aria-expanded', 'false');
        details.toggleAttribute('active', false);
        details.style.maxHeight = '0';
        details.style.opacity = '0';

        if (this.adobeTrack) {
          header.dataset.track = this.trackValue(index, true);
        }

        setTimeout(() => {
          if (item.getAttribute('expanded') === 'false') {
            details.style.display = 'none';
          }
        }, this.durationJS);
      }

      accordionClick(e) {
        // Store index of item being clicked
        const index = this.accordionHeaders.indexOf(e.currentTarget);

        // Determine if opening or closing
        const method =
          this.accordionHeaders[index].getAttribute('aria-expanded') === 'true'
            ? 'collapse'
            : 'expand';

        // Loop through headers
        this.accordionHeaders.forEach((accordionHeader, accordionItemIndex) => {
          if (accordionItemIndex === index && method === 'expand') {
            this.expand(accordionItemIndex);
          } else if (accordionItemIndex === index && method === 'collapse') {
            this.collapse(accordionItemIndex);
          } else if (accordionItemIndex !== index && this.type === 'single') {
            this.collapse(accordionItemIndex);
          }
        });
      }

      navigate(e) {
        // Store key value of keypress
        const key = e.which.toString();

        // 38 = Up, 40 = Down
        // 33 = Page Up, 34 = Page Down
        const ctrlModifier = e.ctrlKey && key.match(/33|34/);

        // Up/Down arrow and Control + Page Up/Page Down keyboard operations
        if (key.match(/38|40/) || ctrlModifier) {
          const index = this.accordionHeaders.indexOf(e.currentTarget);
          const direction = key.match(/34|40/) ? 1 : -1;
          const length = this.accordionHeaders.length;
          const newIndex = (index + length + direction) % length;
          this.accordionHeaders[newIndex].shadow
            .querySelector('button')
            .focus();

          e.preventDefault();
        } else if (key.match(/35|36/)) {
          // 35 = End, 36 = Home keyboard operations
          switch (key) {
            // Go to first accordion
            case '36':
              this.accordionHeaders[0].focus();
              break;
            // Go to last accordion
            case '35':
              this.accordionHeaders[this.accordionHeaders.length - 1].focus();
              break;
          }
          e.preventDefault();
        }
      }

      initEvents() {
        this.accordionHeaders.forEach((accordionHeader, index) => {
          if (!accordionHeader || accordionHeader.dataset.init === 'true') {
            return;
          }

          accordionHeader.addEventListener('click', this.accordionClick);
          accordionHeader.addEventListener('keydown', this.navigate);

          const accordionDetails = this.accordionDetails[index];
          accordionDetails.style.display = 'none';

          if (index === 0 && this.openFirst) {
            this.expand(index);
          } else {
            this.collapse(index);
          }
        });
      }

      onSlotChange(e) {
        const slot = e.target;
        this.accordionItems = slot.assignedNodes();
        this.accordionItems.forEach((accordionItem, index) => {
          this.accordionHeaders[index] = accordionItem.querySelector(
            'evolv-accordion-header'
          );
          this.accordionDetails[index] = accordionItem.querySelector(
            'evolv-accordion-details'
          );
        });
        this.initEvents();
      }
    };

    vds.TooltipContent = class TooltipContent extends vds.VZBase{
      constructor() {
        super();

        this.index = this.dataset.tooltipIndex;
        this.tooltip = document.querySelector(`evolv-tooltip[data-tooltip-index="${this.index}"]`);
        this.borderRadius = this.tooltip.contentBorderRadius;
        this.breakpoint = this.tooltip.breakpoint;
        this.delay = this.tooltip.delay;
        this.disableOnScroll = false;
        this.gap = this.tooltip.contentGap;
        this.maxHeight = this.tooltip.contentMaxHeight;
        this.contentTitle = this.tooltip.contentTitle;
        this.width = this.tooltip.contentWidth;
        this.zIndex = this.tooltip.zIndex;

        this.onScroll = this.onScroll.bind(this);
        this.onThumbMousedown = this.onThumbMousedown.bind(this);
        this.onMouseup = this.onMouseup.bind(this);
        this.onThumbMousemove = this.onThumbMousemove.bind(this);

        const style = `
          .content-outer {
            --gap: ${this.gap};
            --width: ${this.width};
            --window-padding: 20px;
            position: absolute;
            top: calc(var(--button-top) - var(--gap) - var(--height));
            left: calc(var(--button-left) + (var(--button-width) - var(--width)) / 2 + var(--offset-x));
            display: flex;
            opacity: 0;
            background-color: rgb(255, 255, 255);
            box-sizing: border-box;
            border-radius: 4px;
            border: 0.0625rem solid rgb(0, 0, 0);
            bottom: var(--offset-y);
            color: #000000;
            max-height: ${this.maxHeight};
            min-height: 2.5rem;
            outline: none;
            text-align: left;
            /* transform: translateX(calc(-50% + var(--offset-x) + (var(--sign-offset-x) * (var(--window-padding) - 2px)))); */
            transition: opacity 0ms linear ${this.delay}ms;
            width: var(--width);
            z-index: ${this.zIndex};
          }

          .content-outer::before {
            content: "";
            position: absolute;
            display: flex;
            left: calc(50% - var(--offset-x));
            bottom: -.3rem;
            color: black;
            background: white;
            height: 0.53125rem;
            width: 0.53125rem;
            border-right: 0.0625rem solid black;
            border-bottom: 0.0625rem solid black;
            transform: translateX(-50%) rotate(45deg);
            transition: opacity 0ms linear ${this.delay}ms;
            z-index: 999;
            opacity: 0;
          }

          .content {
            display: flex;
            padding: 0.75rem 0;
          }

          .content-inner {
            display: flex;
            position: relative;
            padding: 0 0.75rem;
          }

          .content-scroll {
            overflow-y: scroll;
          }

          .title {
            display: block;
            font-family: var(--font-family-etx);
            font-size: .75rem;
            line-height: 1rem;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .close {
            display: none;
          }

          :host([scroll]:not([touch])) .content-scroll::-webkit-scrollbar {
            display: none; /* For Chrome, Safari, and Opera */
          }

          :host([scroll]:not([touch])) .content-scroll {
            scrollbar-width: none; /* For Firefox */
            -ms-overflow-style: none; /* For Internet Explorer and Edge */
          }

          :host([scroll]:not([touch])) .scrollbar-track {
            position: absolute;
            width: 4px;
            background-color: var(--color-gray-85);
            display: block;
            top: 0px;
            right: 4px;
            bottom: 0px;
            cursor: pointer;
            border-radius: 2px;
            // overflow: hidden;
          }

          :host([scroll]:not([touch])) .scrollbar-thumb {
            position: absolute;
            height: var(--thumb-height);
            width: 4px;
            background-color: var(--color-gray-44);
            display: block;
            /* top: var(--thumb-top); */
            right: 0;
            cursor: pointer;
            border-radius: 2px;
            transform: translateY(var(--thumb-top));
          }

          :host([scroll]:not([touch])) .scrollbar-thumb::before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: -22px;
            z-index: 1;
            width: 48px;
          }

          :host([scroll]:not([touch])) .scrollbar-thumb:hover {
            background-color: black;
          }

          :host([mousedown]) {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          :host([expanded]) .content-outer,
          :host([expanded]) .content-outer::before,
          :host([hover]) .content-outer,
          :host([hover]) .content-outer::before {
            opacity: 1;
          }

          :host([expanded]) .content-outer,
          :host([expanded]) .content-outer::before {
            display: flex;
          }

          :host([below]) .content-outer {
            top: calc(var(--button-top) + var(--button-height) + var(--gap));
          }
          
          :host([below]) .content-outer::before {
            bottom: auto;
            top: -.307rem;
            transform: translateX(-50%) rotate(225deg);
          }

          :host([touch]) .content-outer {
            display: flex;
            align-items: center;
            justify-content: center;
            max-height: unset;
            min-weight: unset;
            width: auto;
            background-color: var(--color-overlay);
            inset: 0px;
            position: fixed;
            padding: 1rem;
            border: none;
            z-index = ${this.zIndex};
          }
            
          :host([touch]) .content-outer::before {
            display: none;
          }

          :host([touch]) .content {
            display: flex;
            flex-direction: column;
            width: 18.5rem;
            min-height: 6rem;
            max-height: 19.5rem;
            background-color: white;
            border-radius: 12px;
            padding: 1rem 0 0;
          }

          :host([touch]) .content-inner {
            padding: 0 0 0 1rem;
            overflow-y: auto;
          }

          :host([touch]) .content-scroll {
            padding: 0 1rem 1rem 0;
            overflow: unset;
            height: fit-content;
          }

          :host([touch]) .title {
            font-family: var(--font-family-eds);
            font-size: 1.25rem;
            line-height: 1.5rem;
            margin-bottom: 8px;
          }

          :host([touch]) .close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 2.75rem;
            text-align: center;
            border-top: var(--border-gray);
          }

          :host([touch]) .scrollbar-track {
            display: none;
          }
        `

        const template = `
          <div class="content-outer">
            <div class="content text-body-sm" aria-live="assertive" aria-relevant="all">
              <div class="content-inner">
                <div class="content-scroll">
                  ${ this.contentTitle ? `<span class="title">${this.contentTitle}</span>` : ''}
                  <slot></slot>
                </div>
                <div class="scrollbar-track">
                  <div class="scrollbar-thumb"></div>
                </div>
              </div>
              <button class="close unbutton text-body-sm">Close</button>
            </div>
          </div>
        `

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);

        this.scrollElement = this.shadow.querySelector('.content-scroll');
        this.thumbMousemoveListener = null;
        this.scrollbarTrack = this.shadow.querySelector('.scrollbar-track');
        this.scrollbarThumb = this.shadow.querySelector('.scrollbar-thumb');
        this.scrolls = false;
        this.thumbTop = null;
        this.thumbTopMax = null;
        this.thumbHeight = null;
        this.scrollToThumbRatio = null;
        this.thumbToScrollRatio = null;
      }

      initScrollbar() {
        const {offsetHeight, scrollHeight} = this.scrollElement;
        this.thumbHeight = Math.round(offsetHeight * offsetHeight / scrollHeight);
        this.thumbTop = 0;
        this.thumbTopMax = offsetHeight - this.thumbHeight;
        this.thumbToScrollRatio = scrollHeight / offsetHeight;
        this.scrollToThumbRatio = 1 / this.thumbToScrollRatio;
        utils.updateProperty('--thumb-height', `${this.thumbHeight}px`, this);
        this.onScroll();
        this.scrollElement.addEventListener('scroll', this.onScroll);
        this.scrollbarThumb.addEventListener('mousedown', this.onThumbMousedown);
        document.body.addEventListener('mouseup', this.onMouseup);
      }

      connectedCallback() {
        this.toggleAttribute('touch', utils.isTouchDevice());

        this.scrolls = this.scrollElement.scrollHeight > this.scrollElement.offsetHeight;
        this.toggleAttribute('scroll', this.scrolls);
        
        if (this.scrolls) {
          this.initScrollbar();
        }
      }

      onScroll() {
        if (this.disableOnScroll) {
          return;
        }

        const { offsetHeight, scrollTop, scrollHeight } = this.scrollElement;
        this.thumbTop = Math.round(scrollTop * this.scrollToThumbRatio);
        utils.updateProperty('--thumb-top', `${this.thumbTop}px`, this);
      }

      onThumbMousedown() {
        this.disableOnScroll = true;
        this.tooltip.disableClick = true;
        this.thumbMousemoveListener = this.scrollbarThumb.addEventListener('mousemove', this.onThumbMousemove);
        this.toggleAttribute('mousedown', true);
      }
      
      onMouseup() {
        setTimeout(() => {
          this.disableOnScroll = false;
          this.tooltip.disableClick = false}
        , 0)
        this.scrollbarThumb.removeEventListener('mousemove', this.onThumbMousemove);
        this.toggleAttribute('mousedown', false);
      }

      onThumbMousemove({movementY}) {
        if (!movementY) {
          return
        }

        let thumbTopNew = this.thumbTop + movementY;

        if (thumbTopNew < 0) {
          thumbTopNew = 0;
        } else if (thumbTopNew > this.thumbTopMax) {
          thumbTopNew = this.thumbTopMax;
        }

        if (thumbTopNew === this.thumbTop) {
          return;
        }

        this.thumbTop = thumbTopNew;
        this.style.setProperty('--thumb-top', `${thumbTopNew}px`);

        this.scrollElement.scrollTop = thumbTopNew * this.thumbToScrollRatio;
      }
    }

    vds.Tooltip = class Tooltip extends vds.ColorOptionBase {
      constructor() {
        super();

        this.breakpoint = this.getAttribute('breakpoint') || '768px';
        this.delay = parseInt(this.getAttribute('delay')) || 500;
        this.color = this.getAttribute('color') || 'inherit';
        this.contentTitle = this.getAttribute('content-title') || this.getAttribute('title') || null;
        
        this.contentId = `tooltip-content-${vds.tooltipIndex}`;
        this.contentBorderRadius = '4px';
        this.contentGap = '.625rem';
        this.contentMaxHeight = '12.75rem';
        this.contentWidth = '14rem';
        this.size = this.getAttribute('size') || '0.9em';
        this.windowPadding = '32px';
        this.zIndex = '999';
        this.disableClick = false;

        this.buttonWidth = this.size; // Todo: add sizes

        this.positionContent = this.positionContent.bind(this);
        this.observePositionY = this.observePositionY.bind(this);
        this.insertContent = this.insertContent.bind(this);
        this.removeContent = this.removeContent.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseenter = this.onMouseenter.bind(this);
        this.onMouseleave = this.onMouseleave.bind(this);

        const style = `
          .button-wrap {
            position: relative;
            display: inline-block;
            width: ${this.buttonWidth};
            height: ${this.buttonWidth};
          }
          
          #tooltip-button {
            position: absolute;
            bottom: -.09em;
            display: flex;
            font-size: inherit;
            -webkit-box-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            align-items: center;
            padding: 0px;
            margin: 0px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
            text-align: center;
            text-decoration: none;
            touch-action: manipulation;
            pointer-events: auto;
            vertical-align: middle;
            outline: none;
            background-color: transparent;
            border-radius: 50%;
            border: none;
            background-clip: padding-box;
            transition: all 0.1s ease-out 0s;
          }

          #tooltip-button:hover {
            background-color: rgba(111, 113, 113, 0.06);
            box-shadow: rgba(111, 113, 113, 0.06) 0px 0px 0px 0.188rem;
          }

          .tooltip-hit-area {
            height: 2.75rem;
            width: 2.75rem;
            display: inline-block;
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        `;

        const template = `
          <span class="button-wrap">
            <button class="unbutton" id="tooltip-button" name="info" aria-expanded="false" aria-controls="tooltip-contents">
              <div class="tooltip-hit-area"></div>
              <evolv-icon name="info" size=".9em" color="${this.color}"></evolv-icon>
            </button>
          </span>`;

        const styleElement = this.shadow.querySelector('style');
        styleElement.textContent += style;
        styleElement.insertAdjacentHTML('afterend', template);

        this.button = this.shadow.querySelector('button');
        this.content = utils.makeElement(this.contentHTML);
        this.hoverTimeout = null;
      }

      connectedCallback() {
        document.body.style.position = 'relative';
        this.button.addEventListener('click', this.onClick);
        this.button.addEventListener('mouseenter', this.onMouseenter);
        this.button.addEventListener('mouseleave', this.onMouseleave);
        this.observePositionY();
        this.dataset.tooltipIndex = vds.tooltipIndex;
        vds.tooltipIndex += 1;
      }

      get contentHTML() {
        return `
          <evolv-tooltip-content
            id="${this.contentId}"
            data-tooltip-index="${this.dataset.tooltipIndex}" 
            width="${this.contentWidth}" max-height="${this.contentMaxHeight}" 
            delay="${this.delay}" 
            z-index="${this.zIndex}"
          >
            ${this.innerHTML}
          </evolv-tooltip-content>`;
      }

      positionContent() {
        const buttonRect = utils.getOffsetRect(this.button);
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const contentBorderRadius = utils.cssToValue(this.contentBorderRadius);
        const contentGap = utils.remToPx(this.contentGap);
        const contentMaxHeight = utils.remToPx(this.contentMaxHeight);
        const contentWidth = utils.remToPx(this.contentWidth);
        const contentLeft = buttonCenterX - contentWidth / 2;
        const contentRight = buttonCenterX + contentWidth / 2;
        const contentCaretWidth = 12;
        const windowWidth = window.innerWidth;
        const breakpoint = utils.cssToValue(this.breakpoint);
        const windowPadding = utils.cssToValue(this.windowPadding)
        const topBound = buttonRect.top - contentGap - contentMaxHeight - windowPadding;
        const leftBound = contentLeft - windowPadding;
        const rightBound = contentRight + windowPadding;
        const maxOffset = (contentWidth - contentCaretWidth) / 2 - contentBorderRadius;
        let offsetX = 0;

        if (leftBound < 0) {
          offsetX = Math.min(0 - leftBound, maxOffset);
        } else if (rightBound > windowWidth) {
          offsetX = -Math.min(rightBound - windowWidth, maxOffset);
        }

        this.content.toggleAttribute('below', topBound < 0);
        utils.updateProperty('--button-left', `${Math.round(buttonRect.left)}px`, this.content);
        utils.updateProperty('--button-top', `${Math.round(buttonRect.top)}px`, this.content);
        utils.updateProperty('--button-height', `${Math.round(buttonRect.height)}px`, this.content);
        utils.updateProperty('--button-width', `${Math.round(buttonRect.width)}px`, this.content);
        utils.updateProperty('--gap', `${Math.round(utils.remToPx(this.contentGap))}px`);
        utils.updateProperty('--height', `${Math.round(utils.remToPx(this.contentMaxHeight))}px`, this.content);
        utils.updateProperty('--offset-x', `${Math.round(offsetX)}px`, this.content);
      }

      observePositionY() {
        const rootMarginTop = -Math.round(utils.remToPx(this.contentGap) + utils.remToPx(this.contentMaxHeight));

        new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // console.log(entry);
              this.content.toggleAttribute(
                'below',
                !entry.isIntersecting &&
                  entry.boundingClientRect.top < entry.rootBounds.top
              );
            });
          },
          {
            rootMargin: `${rootMarginTop}px 0px 0px 0px`,
            threshold: [1]
          }
        ).observe(this.button);
      }

      insertContent() {
        this.button.setAttribute('aria-expanded', 'true');
        this.content = utils.makeElement(this.contentHTML);
        this.positionContent();
        this.content.addEventListener('click', this.onClick);
        this.content.addEventListener('mouseenter', this.onMouseenter);
        this.content.addEventListener('mouseleave', this.onMouseleave);
        document.body.append(this.content)
      }

      removeContent() {
        this.button.setAttribute('aria-expanded', 'false');
        document.body.removeEventListener(this.content.onMouseup);
        this.content?.remove();
      }

      onClick() {
        if (this.disableClick) {
          return;
        }

        if (!this.content.isConnected) {
          this.insertContent();
        }

        if (!this.content.hasAttribute('expanded')) {
          this.content.toggleAttribute('expanded', true);
        } else {
          // this.content.toggleAttribute('expanded', false);
          this.removeContent();
        }
      }

      onMouseenter() {
        if (utils.isTouchDevice()) {
          return;
        }

        if (!this.content.isConnected) {
          this.insertContent();
        }
        clearTimeout(this.hoverTimeout);
        setTimeout(() => {
          this.content.toggleAttribute('hover', true);
        }, 0);
      }

      onMouseleave() {
        if (utils.isTouchDevice()) {
          return;
        }

        this.content.toggleAttribute('hover', false);
        if (!this.content.hasAttribute('expanded')) {
          this.hoverTimeout = setTimeout(
            () => {
              this.removeContent();
            },
            this.delay
          );
        }
      }
    };

    // Register web components
    const components = {
      'evolv-title': vds.Title,
      'evolv-icon': vds.Icon,
      'evolv-button-icon': vds.ButtonIcon,
      'evolv-text-link': vds.TextLink,
      'evolv-button': vds.Button,
      'evolv-accordion': vds.Accordion,
      'evolv-accordion-item': vds.AccordionItem,
      'evolv-accordion-header': vds.AccordionHeader,
      'evolv-accordion-details': vds.AccordionDetails,
      'evolv-tooltip': vds.Tooltip,
      'evolv-tooltip-content': vds.TooltipContent,
    };

    Object.keys(components).forEach((name) => {
      if (!customElements.get(name)) {
        customElements.define(name, components[name]);
      }
    });
  }

  if (window.evolv?.utils) {
    init();
  } else {
    document.documentElement.addEventListener('evolvutilsinit', init);
  }
};
