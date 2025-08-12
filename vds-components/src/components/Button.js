import vds from '../imports/vds.js';
import Base from './Base';

class Button extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'background-color',
    'disabled',
    'text-color',
    'text-content',
    'use',
    'width',
  ];

  constructor() {
    super();

    this.props = {
      color: () =>
        vds.handleNamedColor(this.getAttribute('color')) ||
        'var(--color-primary)',
      disabled: () =>
        this.getAttribute('disabled') === '' ||
        this.getAttribute('disabled') === 'true',
      textColor: () => {
        const attribute = this.getAttribute('text-color');
        const use = this._props.use();

        if (attribute) {
          return attribute;
        } else if (use === 'secondary') {
          return this._props.color();
        }

        return 'var(--color-inverse)';
      },
      use: () => this.getAttribute('use') || 'primary',
      width: () => this.getAttribute('width') || 'auto',
    };

    this.styles = () => css`
      :host {
        --border-radius-large: 2.75rem;
        --border-radius-small: 2rem;
        --color-text: ${this.textColor};
        --color-button: ${this.color};
        display: inline-block;
        border-radius: var(--border-radius-large);
      }

      .button {
        ${vds.style.text.body.large()}
        pointer-events: auto;
        padding: 0px;
        margin: 0px;
        border-radius: var(--border-radius-large);
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
        width: ${this.width};
        min-width: 4.75rem;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        white-space: nowrap;
        font-weight: 700;
        letter-spacing: normal;
        background-color: var(--color-button);
        border: 0.0625rem solid var(--color-button);
        color: var(--color-text);
      }

      .button:active {
        color: var(--color-inverse);
        border-color: rgb(111, 113, 113);
        box-shadow: rgb(111, 113, 113) 0px 0px 0px 0.0625rem;
        background-color: rgb(111, 113, 113);
      }

      .button:hover:not(:active) {
        outline: none;
        box-shadow: var(--color-button) 0px 0px 0px 0.0625rem;
        transition: all 0.1s ease-out 0s;
      }

      .button:focus-visible {
        outline: var(--outline-focus);
        outline-offset: var(--outline-offset-focus);
      }

      .hit-area {
        height: 2.75rem;
        width: 100%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        text-align: center;
        top: 50%;
        content: '';
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

      :host([display='block']) .button {
        display: block;
      }

      :host([display='inline-block']) .button {
        display: inline-block;
      }

      :host([size='small']) {
        border-radius: var(--border-radius-small);
      }

      :host([size='small']) .button {
        font-family: var(--font-family-etx);
        font-size: 0.75rem;
        line-height: 1rem;
        border-radius: var(--border-radius-small);
        min-width: revert;
      }

      :host([size='small']) .text {
        padding: calc(-1px + 0.5rem) 1rem;
      }

      :host([size='small']) .button:focus-visible::before {
        border-radius: var(--border-radius-small);
      }

      :host([use='secondary']) .button {
        background-color: transparent;
        color: var(--color-button);
      }

      .button[disabled] {
        pointer-events: none;
        cursor: default;
        border-color: var(--color-gray-85);
        background-color: var(--color-gray-85);
      }

      :host[use='secondary'] .button[disabled] {
        background-color: transparent;
        color: var(--color-gray-85);
      }

      ${this.breakpoint
        ? css`
            @media screen and (min-width: ${this.breakpoint}) {
              :host[size='small'] {
                border-radius: var(--border-radius-large);
              }

              :host([size='small']) .button {
                font-family: var(--font-family-eds);
                font-size: 1rem;
                line-height: 1.25rem;
                min-width: 4.75rem;
                border-radius: var(--border-radius-large);
                background-color: var(--color-button);
              }

              :host([size='small']) .button:focus-visible::before {
                border-radius: var(--border-radius-large);
              }

              :host([size='small']) .text {
                padding: calc(-1px + 0.75rem) 1.5rem;
              }
            }
          `
        : ''}
    `;

    this.template = () => html`
      <button class="button" ${this.disabled ? 'disabled' : ''}>
        <span class="hit-area"></span>
        <span class="text">
          <slot></slot>
        </span>
      </button>
    `;
  }
}

export default Button;
