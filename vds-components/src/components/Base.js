import vds from '../imports/vds.js';
import utils from '../imports/utils.js';

class Base extends HTMLElement {
  static observedAttributes = ['breakpoint', 'color', 'css', 'surface'];

  _onAttributeChangeds = [];
  _onConnects = [];
  _onDisconnects = [];
  _onRenders = [];
  _props = {};
  _partSelectors = {};
  _parts = {};
  _styles = [];
  delegatesFocus = true;
  hasConnected = false;
  prefersReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
  template = '';

  constructor() {
    super();

    this.props = {
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || null,
      color: () =>
        this.getAttribute('color') ||
        (this._props.surface() ? 'var(--color-primary)' : 'inherit'),
      css: () => this.getAttribute('css') || null,
      surface: () => this.getAttribute('surface') || null,
    };

    this.styles = () => css`
      @media (prefers-reduced-motion: reduce) {
        :host,
        * {
          transition-duration: 0s !important;
        }
      }

      :host-context([surface='dark']) {
        --color-primary: white;
        --color-secondary: black;
      }

      :host {
        --font-family-etx: Verizon-NHG-eTX, Helvetica, Arial, sans-serif;
        --font-family-eds: Verizon-NHG-eDS, Helvetica, Arial, sans-serif;
        ${Object.keys(vds.colorTokens)
          .map(
            (colorToken) =>
              mixin`--color-${colorToken}: ${vds.colorTokens[colorToken]};`
          )
          .join('')}
        --color-overlay: rgba(0, 0, 0, 0.8);
        --color-ghost: ${this.surface === 'dark'
          ? 'rgba(143, 145, 145, 0.18)'
          : 'rgba(111, 113, 113, 0.06)'};
        --color-primary: ${this.surface === 'dark' ? 'white' : 'black'};
        --color-inverse: ${this.surface === 'dark' ? 'black' : 'white'};
        --outline-focus: var(--color-primary) dashed 0.0625rem !important;
        --outline-offset-focus: 0.125rem;
        --border-gray: 0.0625rem solid var(--color-gray-85);
        color: inherit;
        outline: none !important;
      }

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

      :host > * {
        color: ${vds.handleNamedColor(this.color)};
      }

      ${Object.keys(vds.colorTokens)
        .map(
          (colorToken) => css`
            :host([color='${colorToken}']) {
              color: var(--color-${colorToken});
            }
          `
        )
        .join('')}

      [hidden] {
        display: none;
      }

      .unbutton {
        background: none;
        border: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .text-body-small {
        ${vds.style.text.body.small()}
      }

      .text-body-large,
      .unbutton {
        ${vds.style.text.body.large()}
      }
    `;

    this.template = html`
      <div>
        <slot></slot>
      </div>
    `;

    this.shadow = this.attachShadow({
      mode: 'open',
      delegatesFocus: this.delegatesFocus,
    });
  }

  connectedCallback() {
    this.hasConnected = true;
    this.render();
    this._onConnects.forEach((onConnect) => onConnect());
  }

  attributeChangedCallback(...attributes) {
    if (!this.hasConnected) {
      return;
    }

    this.render();

    this._onAttributeChangeds.forEach((onAttributeChanged) =>
      onAttributeChanged()
    );
  }

  disconnectedCallback() {
    this._onDisconnects.forEach((onDisconnect) => onDisconnect());
  }

  contentChangedCallback = null;

  get props() {
    return this._props;
  }

  get parts() {
    return this._parts;
  }

  set props(propsNew) {
    this._props = { ...this._props, ...propsNew };
  }

  set parts(partSelectorsNew) {
    this._partSelectors = { ...this._partSelectors, ...partSelectorsNew };
  }

  set styles(style) {
    this._styles.push(style);
  }

  set onRender(callback) {
    this._onRenders.push(callback);
  }

  set onConnect(callback) {
    this._onConnects.push(callback);
  }

  set onDisconnect(callback) {
    this._onDisconnects.push(callback);
  }

  set onAttributeChanged(callback) {
    this._onAttributeChangeds.push(callback);
  }

  updateValue(key, value, target) {
    if (value !== target[key]) {
      target[key] = value;
    }
  }

  updateProp = (key) => {
    this.updateValue(key, utils.functionOrValue(this._props[key]), this);
  };

  updateProps = () => {
    Object.keys(this._props).forEach((key) => this.updateProp(key));
  };

  updateParts = () => {
    Object.keys(this._partSelectors).forEach((key) =>
      this.updateValue(
        key,
        utils.functionOrSelector(this._partSelectors[key], this.shadow),
        this._parts
      )
    );
  };

  render = () => {
    this.updateProps();
    this.shadow.innerHTML = html`
      <style>
        ${[...this._styles, this.css]
          .map((style) => utils.functionOrValue(style))
          .join('')}
      </style>
      ${utils.functionOrValue(this.template)}
    `;
    this.updateParts();

    if (this.contentChangedCallback) {
      this.contentChangedCallback();
      this.observeContent();
    }

    this._onRenders.forEach((onRender) => onRender());
  };

  renderChildren = () => {
    Array.from(this.querySelectorAll('*'))
      .filter((element) => element?.__proto__ instanceof Base)
      .filter(
        (component, index, componentList) =>
          !componentList.some((c) => c !== component && c.contains(component))
      )
      .forEach((component) => {
        component.render();
        component.renderChildren();
      });
  };

  observeContent = () => {
    new MutationObserver(this.contentChangedCallback).observe(this, {
      childList: true,
    });
  };
}

export default Base;
