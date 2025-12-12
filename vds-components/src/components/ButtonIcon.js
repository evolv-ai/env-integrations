import Base from './Base.js';

class ButtonIcon extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'name',
    'size',
    'size-tablet',
  ];

  constructor() {
    super();

    const buttonSizes = {
      small: '2rem',
      large: '2.75rem',
    };

    const buttonPadding = {
      small: '0.375rem',
      large: '0.625rem',
    };

    const iconSizes = {
      small: 'medium',
      large: 'large',
    };

    this.props = {
      iconSize: () =>
        ['small', 'large'].some((size) => size === this.props.size())
          ? iconSizes[this.props.size()]
          : this.props.size(),
      name: () => this.getAttribute('name') || null,
      size: () => this.getAttribute('size') || 'small',
      sizeTablet: () => this.getAttribute('size-tablet') || 'large',
    };

    this.styles = () => css`
      .button-icon {
        --button-size: ${Object.keys(buttonSizes).some(
          (size) => size === this.size,
        )
          ? `${buttonSizes[this.size]}`
          : this.size};
        --padding: ${Object.keys(buttonPadding).some(
          (size) => size === this.size,
        )
          ? `${buttonPadding[this.size]}`
          : `calc(${this.size}/3)`};
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        touch-action: manipulation;
        cursor: pointer;
        padding: var(--padding);
        border-radius: 50%;
        background-color: transparent;
        transition:
          box-shadow 0.1s ease-out 0s,
          background-color 0.1s ease-out 0s;
      }

      .button-icon:hover {
        outline: none;
        box-shadow: var(--color-ghost);
        background-color: var(--color-ghost);
      }

      .button-icon:hover:active {
        box-shadow: var(--color-ghost) 0px 0px 0px;
      }

      .button-icon:focus-visible {
        outline: var(--outline-focus);
        outline-offset: var(--outline-offset-focus);
      }

      :host([size='large']) .button-icon {
        width: 2.75rem;
        height: 2.75rem;
      }

      :host([disabled]) {
        pointer-events: none;
        cursor: default;
      }

      :host([disabled]) .button-icon {
        background-color: transparent;
        color: var(--color-gray-85);
      }

      ${this.breakpoint
        ? css`
            @media screen and (min-width: ${this.breakpoint}) {
              .button-icon {
                width: ${this.sizeTablet === 'large'
                  ? '2.75rem'
                  : this.sizeTablet};
                height: ${this.sizeTablet === 'large'
                  ? '2.75rem'
                  : this.sizeTablet};
              }
            }
          `
        : ''}
    `;

    this.template = () => html`
      <button class="button-icon unbutton">
        <evolv-icon
          name="${this.name}"
          size="${this.iconSize}"
          breakpoint="${this.breakpoint}"
        >
          <slot></slot>
        </evolv-icon>
      </button>
    `;
  }
}

export default ButtonIcon;
