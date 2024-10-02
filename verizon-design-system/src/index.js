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
    const { log, debug } = utils;
    const { $mu } = window.evolv;

    window.evolv.vds ??= {};
    const { vds } = window.evolv;
    let hasRun = false;

    vds.VZBase = class VZBase extends HTMLElement {
      constructor(config = {}) {
        super();
  
        const designTokens = `:host {
          --evolv-font-family-etx: Verizon-NHG-eTX, Helvetica, Arial, sans-serif;
          --evolv-font-family-eds: Verizon-NHG-eDS, Helvetica, Arial, sans-serif;
          --evolv-color-gray-11: #1b1d1f;
          --evolv-color-gray-20: #333333;
          --evolv-color-gray-44: #6f7171;
          --evolv-color-gray-65: #a7a7a7;
          --evolv-color-gray-85: #d8dada;
          --evolv-color-gray-95: #f6f6f6;
        }`
  
        this.mixins = {
          bodyText: {
            sm: () => `
              font-family: var(--evolv-font-family-etx);
              font-size: 0.75rem;
              line-height: 1rem;
              font-weight: 400;
              letter-spacing: normal;
              margin: 0;`,
            lg: () => `
              font-family: var(--evolv-font-family-eds);
              font-size: 1rem;
              line-height: 1.25rem;
              font-weight: 400;
              letter-spacing: 0.03125rem;
              margin: 0;`
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
          
          ${ /* this.textSize ? this.textBody[this.textSize] : */ ''}
        </style>`
      }
    }

    vds.Title = class Title extends vds.VZBase {
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

          :host([color="white"]) > * {
            color: white;
          }

          :host([bold="true"]) > * {
            font-weight: 700;
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

          @media screen and (min-width: ${this.breakpoint}) {
            :host([size="small"]) > * {
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
            color: var(--evolv-color-gray-44);
            border-bottom: 1px solid var(--evolv-color-gray-44);
            box-shadow: var(--evolv-color-gray-44) 0px 1px;
          }
          
          a:hover {
            box-shadow: black 0px 1px;
          }

          :host(:focus-visible),
          :host(:focus:not(:hover)) {
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

            :host(:focus-visible) button,
            :host(:focus:not(:hover)) button {
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

            :host([size=small]) button:focus:not(:hover)::before {
              border-radius: 2rem;
            }

            :host([use=secondary]) button {
              background-color: transparent;
              color: black;
            }

            button[disabled] {
              pointer-events: none;
              cursor: default;
              border: 0.0625rem solid var(--evolv-color-gray-85);
              background-color: transparent;
              color: var(--evolv-color-gray-85);
            }

            :host([use=secondary]) button[disabled] {
              color: var(--evolv-color-gray-85);
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

      // Register web components
      const components = {
        'evolv-title': vds.Title,
        'evolv-text-link': vds.TextLink,
        'evolv-button': vds.Button,
      }
      
      Object.keys(components).forEach(name => {
        $mu(name, `vds-${name}`).customMutation((state, element) => {
          if (!hasRun) {
            log(`init verizon design system version ${version}`);
            hasRun = true;
          }

          if (!customElements.get(name)) {
            debug(`init <${name}>`);
            customElements.define(name, components[name]);
          }
        })
      });
  });
};
