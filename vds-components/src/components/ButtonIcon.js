import Base from './Base.js';

class ButtonIcon extends Base {
  static observedAttributes = [...this.observedAttributes, 'name', 'size'];

  constructor() {
    super();

    const iconSizes = {
      small: 'medium',
      large: 'large',
    };

    this.props = {
      name: () => this.getAttribute('name') || null,
      size: () => this.getAttribute('size') || 'small',
      iconSize: () => iconSizes[this.props.size()],
    };

    this.styles = () => css`
      .button-icon {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        touch-action: manipulation;
        cursor: pointer;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background-color: transparent;
        transition: box-shadow 0.1s ease-out 0s,
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

      :host([size='large']) button {
        width: 2.75rem;
        height: 2.75rem;
      }

      .button-icon[disabled] {
        pointer-events: none;
        cursor: default;
        background-color: transparent;
        color: var(--color-gray-85);
      }

      ${this.breakpoint
        ? css`
            @media screen and (min-width: ${this.breakpoint}) {
              .button-icon {
                width: 2.75rem;
                height: 2.75rem;
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
