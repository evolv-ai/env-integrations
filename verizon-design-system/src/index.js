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

  waitFor(() => window.evolv?.utils?.init('verizon-design-system')).then(utils => {
    const { log, debug, makeElement } = utils;

    window.evolv.vds ??= {};
    const { vds } = window.evolv;

    if (vds.init) { return }

    vds.init = () => {
      log('init verizon design system version', version);
      vds.version = version;
      vds.accordionIndex = 0;
      vds.accordionItemIndex = 0;
      vds.accordions = [];
  
      utils.toCamelCase = (string) => {
        return string.replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
      }
  
      utils.capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
          }`
    
          this.mixins = {
            bodyText: {
              sm: () => `
                font-family: var(--font-family-etx);
                font-size: 0.75rem;
                line-height: 1rem;
                font-weight: 400;
                letter-spacing: normal;
                margin: 0;
                padding: 0;`,
              lg: () => `
                font-family: var(--font-family-eds);
                font-size: 1rem;
                line-height: 1.25rem;
                font-weight: 400;
                letter-spacing: 0.03125rem;
                margin: 0;
                padding: 0;`
            },
          }
    
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
  
            .unbutton {
              background: none;
              border: none;
              ${this.mixins.bodyText.lg()}
            }
          </style>`;
        }
      }
      
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
            }`
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
        }
      }
  
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
              default:
            }
          }
  
          const style = `
            :host > * {
              ${this.mixins.bodyText.lg()}
              text-decoration: none;
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
            }
          `
  
          const template = `<${this.primitive}>
            <slot></slot>
          </${this.primitive}>`
      
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
        }
      }
  
      vds.Icon = class Icon extends vds.ColorOptionBase {
        constructor() {
          super();
  
          this.name = this.getAttribute('name') || 'empty';
          this.iconTitle = this.getAttribute('title')
            || `${utils.capitalizeFirstLetter(this.name.replaceAll('-', ' '))} icon`;
          this.ariaHidden = (this.getAttribute('aria-hidden') === 'true');
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
              min-height: var(--icon-size);
              min-width: var(--icon-size);
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
            }
          `
  
          const icons = {
            empty: ``,
            pencil: `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.86568 0.685059L1.53234 12.6202L0.717529 17.3147L4.87494 15.0091L13.2823 3.07395L9.86568 0.685059ZM4.18975 14.2128L2.11568 15.3702L2.48605 13.0184L8.0416 5.08321L9.75457 6.27765L4.18975 14.2128ZM8.65271 4.23135L10.1157 2.1295L11.8286 3.33321L10.3564 5.4258L8.65271 4.23135Z" fill="currentColor"/>
            </svg>`,
            'down-caret': `<svg width="24" height="25" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.9555L2 7.95554L2.91111 7.04443L12 16.1333L21.0889 7.04443L22 7.95554L12 17.9555Z" fill="currentColor"/>
            </svg>`,
            'right-arrow': `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8956 25.6666L12.8365 24.6168L22.796 14.7421H2.3335V13.2578H22.796L12.8365 3.38312L13.8956 2.33331L25.6668 14L13.8956 25.6666Z" fill="currentColor"/>
            </svg>`,
            'trash-can': `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.71481 25.6666H21.2981V8.16665H6.71481V25.6666ZM8.16667 9.63146H19.8333V24.2148H8.16667V9.63146ZM16.9167 5.24998V2.33331H11.0833V5.24998H5.25V6.71479H22.75V5.24998H16.9167ZM15.4648 5.24998H12.5481V3.79813H15.4648V5.24998ZM10.6815 21.2981H12.1333V12.5481H10.6815V21.2981ZM15.8667 21.2981H17.3185V12.5481H15.8667V21.2981Z" fill="currentColor"/>
            </svg>`,
            phone:  `<svg width="15" height="24" viewBox="0 0 15 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0V24H15V0H0ZM13.5 18.75H1.5V1.5H13.5V18.75ZM1.5 22.5V20.25H6.00001V21.75H9.00002V20.25H13.5V22.5H1.5Z" fill="currentColor"/>
            </svg>
            `,
            'phone-plan': `<svg width="15" height="24" viewBox="0 0 15 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0V24H15V0H0ZM13.5 18.75H1.5V1.5H13.5V18.75ZM1.5 22.5V20.25H6.00001V21.75H9.00002V20.25H13.5V22.5H1.5Z" fill="currentColor"/>
              <path d="M9.74389 12.7133H11.5V6.75H9.74389V12.7133Z" fill="currentColor"/>
              <path d="M6.62271 8.24999H8.37881V12.75H6.62271V8.24999Z" fill="currentColor"/><path d="M3.5 9.75001H5.25609V12.7133H3.5V9.75001Z" fill="currentColor"/>
            </svg>`,
            'phone-protection': `<svg width="15" height="24" viewBox="0 0 15 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6V9.37402C3.07574 10.8026 3.53105 12.1858 4.32031 13.3828C5.10955 14.5799 6.20448 15.5486 7.49316 16.1895C8.78454 15.5471 9.88225 14.5772 10.6738 13.3779C11.4653 12.1786 11.9226 10.7929 12 9.36133V6H3ZM4.5 7.5H10.5V9.31055C10.4354 10.4754 10.0665 11.6029 9.42578 12.5801V12.5811C8.92847 13.3389 8.24737 13.9397 7.49316 14.4375C6.74194 13.9411 6.06365 13.3418 5.56836 12.5859C4.92961 11.6112 4.56316 10.487 4.5 9.3252V7.5ZM0 0V24H15V0H0ZM1.5 1.5H13.5V18.75H1.5V1.5ZM1.5 20.25H6V21.75H9V20.25H13.5V22.5H1.5V20.25Z" fill="currentColor"/>
            </svg>`,
            info:  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.6666 6.99998C13.6666 5.68144 13.2756 4.39251 12.5431 3.29618C11.8105 2.19985 10.7693 1.34537 9.55114 0.840786C8.33297 0.336202 6.99253 0.204179 5.69932 0.461414C4.40611 0.718649 3.21823 1.35359 2.28588 2.28594C1.35353 3.21829 0.718588 4.40617 0.461353 5.69938C0.204118 6.99259 0.336141 8.33303 0.840725 9.5512C1.34531 10.7694 2.19979 11.8106 3.29612 12.5431C4.39245 13.2757 5.68138 13.6666 6.99992 13.6666C8.7674 13.6646 10.4619 12.9615 11.7117 11.7117C12.9615 10.462 13.6645 8.76746 13.6666 6.99998ZM12.8333 6.99998C12.8333 8.15373 12.4912 9.28156 11.8502 10.2409C11.2092 11.2002 10.2982 11.9478 9.23226 12.3894C8.16634 12.8309 6.99344 12.9464 5.86186 12.7213C4.73029 12.4962 3.69087 11.9406 2.87505 11.1248C2.05923 10.309 1.50365 9.26959 1.27857 8.13801C1.05349 7.00644 1.16901 5.83353 1.61053 4.76761C2.05205 3.70169 2.79974 2.79064 3.75904 2.14965C4.71834 1.50867 5.84618 1.16654 6.99992 1.16655C8.5465 1.16831 10.0292 1.78348 11.1228 2.87708C12.2164 3.97067 12.8316 5.4534 12.8333 6.99998H12.8333ZM7.61103 4.52481H6.37029V3.28407H7.61103V4.52481ZM6.37647 5.75303H7.62955V10.7159H6.37647V5.75303Z" fill="currentColor"/>
            </svg>`,
            close:  `<svg viewBox="0 0 21.6 21.6" fill="none">
              <path d="M11.59,10.8l7.11,7.1-.8.8-7.1-7.11L3.7,18.7l-.8-.8L10,10.8,2.9,3.7l.8-.8L10.8,10,17.9,2.9l.8.8Z" stroke="none" fill="currentColor"></path>
            </svg>`
          }
  
          const template = `
            <div>
              ${icons[this.name]}
              <slot></slot>
            </div>`;
  
          const icon = makeElement(template);
          this.svg = icon.querySelector('svg');
  
          if (this.title && svg) {
            this.svg.insertAdjacentHTML('afterbegin', `<title>${this.title}</title>`);
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
      }
  
      vds.ButtonIcon = class ButtonIcon extends vds.VZBase {
        constructor() {
          super();
  
          this.name = this.getAttribute('name') || 'empty';
          this.disabled = this.getAttribute('disabled') || false;
          this.size = this.getAttribute('size') || 'small';
          this.breakpoint = this.getAttribute('breakpoint') || '768px';
  
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
          `
  
          const template = `
            <button class="unbutton">
              <evolv-icon 
                name="${ this.name }"
                size="${ this.iconSize }"
                breakpoint="${ this.breakpoint }"
              >
                <slot></slot>
              </evolv-icon>
            </button>
          `
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
        }
  
        attributeChangedCallback(attribute, oldValue, newValue) {
          const button = this.shadow.querySelector('button')
          switch (attribute) {
            case 'disabled':
              button.toggleAttribute('disabled', this.hasAttribute('disabled'));
              break;
            default:
          }
        }
      }
      
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
          </a>`
    
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
        }
  
        connectedCallback() {
          if (!this.tabindex) {
            this.setAttribute('tabindex', '0');
          }
        }
      }
  
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
          `
  
          const template = `<button ${this.disabled ? 'disabled' : ''} ${this.width ? `style="width: ${this.width};"` : ''}>
            <span class=hit-area></span>
            <span class=text>
              <slot></slot>
            </span>
          </button>`
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
        }
  
        attributeChangedCallback(name, oldValue, newValue) {
          const button = this.shadow.querySelector('button')
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
      }
  
      vds.AccordionHeader = class AccordionHeader extends vds.VZBase {
        constructor() {
          super();
  
          this.accordion = this.closest('evolv-accordion') || null;
          this.accordionItem = this.closest('evolv-accordion-item') || null;
          this.accordionItemIndex = this.accordionItem?.getAttribute('index') || null;
          this.breakpoint = this.getAttribute('breakpoint') || this.accordion?.getAttribute('breakpoint') || '768px';
          this.durationCSS = this.getAttribute('duration') || this.accordion?.durationCSS;
          this.handleAlign = this.getAttribute('handle-align') || this.accordion?.getAttribute('handle-align') || 'left';
          this.id = this.id || this.accordion?.accordionHeaderId(this.accordionItemIndex);
          this.titleSize = this.accordion?.getAttribute('title-size') || null;
          this.titleBold = this.accordion?.getAttribute('title-bold') || null;
          this.padding = this.getAttribute('padding') || this.accordion?.padding || '1.5rem';
          this.paddingTablet = this.getAttribute('padding-tablet') || this.accordion?.paddingTablet || '2rem';
  
          const buttonIconSizes = {
            'small': 'small',
            'medium': 'large',
            'large': 'large'
          }
  
          this.buttonIconSize = buttonIconSizes[this.titleSize];
  
          const style = `
            button {
              width: 100%;
              display: flex;
              overflow: visible;
              text-align: left;
              align-items: center;
              gap: 1rem;
            }
  
            button:not([index="0"]) {
              border-top: 1px solid var(--color-gray-85);
            }
  
            button:hover {
              outline: none;
            }
  
            button:focus-visible {
              outline: 0.0625rem dashed black;
              outline-offset: -1px;
            }
  
            .title-wrap {
              padding: ${this.padding} 0;    
            }
  
            .button-icon-wrap {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 2rem;
              margin-right: auto;
            }
  
            .handle-align-right .button-icon-wrap {
              margin-right: 0;
              margin-left: auto;
            }
  
            evolv-button-icon {
              transition: transform ${this.durationCSS} ease;
            }
  
            :host([aria-expanded="true"]) evolv-button-icon {
              transform: rotate(180deg);
            }
  
            ::slotted([slot="right"]) {
              text-align: right;
              justify-self: flex-end;
            }
  
            @media screen and (min-width: ${this.breakpoint}) {
              button {
                padding: ${this.paddingTablet};
              }
  
              .button-icon-wrap {
                flex-basis: 2.5rem;
              }
            }
          `
  
          const template = `<button class="unbutton handle-align-${this.handleAlign}">
            <div class="title-wrap">
              <evolv-title
                ${this.titleSize ? `size="${this.titleSize}"` : ''}
                ${this.titleBold ? `bold="${this.titleBold}"` : ''}
                breakpoint="${this.breakpoint}"
              ><slot></slot></evolv-title>
            </div>
            <div class="button-icon-wrap">
              <evolv-button-icon 
                ${this.buttonIconSize ? `size="${this.buttonIconSize}"` : ''}
                name="down-caret"
                tabindex="-1"
                breakpont="${this.breakpoint}"
              ></evolv-icon>
            </div>
            <slot name="right"></slot>
          </button>`
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
        }
  
        connectedCallback() {
          if (this.accordionItemIndex) {
            this.setAttribute('index', this.accordionItemIndex);
            this.setAttribute('aria-controls', this.accordion.accordionDetailsId(this.accordionItemIndex));
          }
        }
      }
  
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
          `
  
          const template = `
            <div>
              <slot></slot>
            </div>`
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
        }
  
        connectedCallback() {
          const details = this.shadow.querySelector('div');
          // new ResizeObserver(() => {
          //   const heightPrevious = details.getAttribute('details-height');
          //   const heightCurrent = Math.round(details.getBoundingClientRect().height).toString();
          //   if (!heightPrevious || (!(heightCurrent !== '0') && (heightCurrent !== heightPrevious))) {
          //     this.setAttribute('details-height', heightCurrent);
          //   }
          // }).observe(details);
          this.setAttribute('aria-labelledby', this.accordion.accordionHeaderId(this.accordionItemIndex));
        }
      }
  
      vds.AccordionItem = class AccordionItem extends vds.VZBase {
        constructor() {
          super();
  
          this.accordionIndex = vds.accordionIndex;
          this.accordionItemIndex = vds.accordionItemIndex;
  
          const style = `
            
          `
  
          const template = `
            <div>
                <slot></slot>
            </div>`
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
  
          vds.accordionItemIndex += 1;
        }
  
        connectedCallback() {
          this.setAttribute('slot', 'accordion');
          this.setAttribute('index', this.accordionItemIndex);
        }
      }
  
      vds.Accordion = class Accordion extends vds.VZBase {
        constructor() {
          super();
  
          this.accordionIndex = vds.accordionIndex;
          this.id = this.getAttribute('id') || `accordion-${this.accordionIndex}`;
  
          this.adobeTrack = this.getAttribute('adobe-track') === 'false' ? false : true;
          this.durationCSS = this.getAttribute('duration') || '0.33s';
          this.durationJS = (parseFloat(this.durationCSS) * 1000) || 330;
          this.openFirst = (this.getAttribute('open-first') === 'true');
          this.padding = this.getAttribute('padding')
            || '1.5rem';
          this.paddingTablet = this.getAttribute('padding-tablet')
            || '2rem';
          this.type = this.getAttribute('type') === 'single' ? 'single' : 'multi';
  
          this.accordionItems = [];
          this.accordionDetails = [];
          this.accordionHeaders = [];
  
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
            </div>`
  
          vds.accordionIndex += 1;
          vds.accordionItemIndex = 0;
  
          const styleElement = this.shadow.querySelector('style');
          styleElement.textContent += style;
          styleElement.insertAdjacentHTML('afterend', template);
  
          const slot = this.shadow.querySelector('slot');
          slot.addEventListener('slotchange', this.onSlotChange);
        }
  
        trackValue(index, expanded) {
          return `{'type':'link','name':'${this.id}-${index}:${expanded ? 'expanded' : 'collapsed'}'}`;
        }
  
        accordionHeaderId (index) {
          return `${this.id}-header-${index}`
        }
  
        accordionDetailsId (index) {
          return `${this.id}-details-${index}`
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
            details.style.maxHeight = `${details.scrollHeight}px`;
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
          const method = (this.accordionHeaders[index].getAttribute('aria-expanded') === 'true' ? 'collapse' : 'expand');
  
          // Loop through headers
          this.accordionHeaders.forEach((accordionHeader, accordionItemIndex) => {
            if (accordionItemIndex === index && method === 'expand') {
              this.expand(accordionItemIndex);
            } else if (accordionItemIndex === index && method === 'collapse') {
              this.collapse(accordionItemIndex);
            } else if (accordionItemIndex !== index && this.type === 'single') {
              this.collapse(accordionItemIndex);
            }
          })
        }
  
        navigate(e) {
          // Store key value of keypress
          const key = e.which.toString();
            
          // 38 = Up, 40 = Down
          // 33 = Page Up, 34 = Page Down
          const ctrlModifier = (e.ctrlKey && key.match(/33|34/));
  
          // Up/Down arrow and Control + Page Up/Page Down keyboard operations
          if (key.match(/38|40/) || ctrlModifier) {
            const index = this.accordionHeaders.indexOf(e.currentTarget);
            const direction = (key.match(/34|40/)) ? 1 : -1;
            const length = this.accordionHeaders.length;
            const newIndex = (index + length + direction) % length;
            this
              .accordionHeaders[newIndex]
              .shadow
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
            if (!accordionHeader || accordionHeader.dataset.init === 'true' ) { return }
  
            accordionHeader.addEventListener('click', this.accordionClick);
            accordionHeader.addEventListener('keydown', this.navigate);

            const accordionDetails = this.accordionDetails[index];
            // const detailsHeight = accordionDetails.getBoundingClientRect().height;
            // accordionDetails.setAttribute('details-height', detailsHeight);
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
            this.accordionHeaders[index] = accordionItem.querySelector('evolv-accordion-header');
            this.accordionDetails[index] = accordionItem.querySelector('evolv-accordion-details');
          });
          this.initEvents();
        }
      }
  
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
      }
      
      Object.keys(components).forEach(name => {
        if (!customElements.get(name)) {
          customElements.define(name, components[name]);
        }
      })
    }
  });
};
