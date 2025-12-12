import vds from '../imports/vds.js';
import Base from './Base';

class AccordionHeader extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'duration',
    'handle-align',
    'handle-size',
    'padding',
    'padding-tablet',
    'title-bold',
    'title-size',
    'title-primitive',
  ];

  constructor() {
    super();

    const handleSizes = {
      small: 'small',
      medium: 'large',
      large: 'large',
    };

    const handleWidths = {
      small: '1.25rem',
      large: '1.5rem',
    };

    const handlePadding = {
      small: '0.375rem',
      large: '0.625rem',
    };

    function isHandleSizeNamed(handleSize) {
      return Object.keys(handleWidths).some((width) => width === handleSize);
    }

    this.accordion = this.closest('evolv-accordion');
    this.accordionItem = this.closest('evolv-accordion-item');
    this.idOriginal = this.id;

    this.props = {
      accordionItemIndex: () => this.accordionItem?.index,
      breakpoint: () =>
        this.getAttribute('breakpoint') ||
        this.accordion?.breakpoint ||
        '768px',
      duration: () =>
        this.getAttribute('duration') || this.accordion?.duration || 330,
      gap: () =>
        this.accordion?.getAttribute('header-gap') ??
        this.getAttribute('gap') ??
        '1rem',
      gapTablet: () =>
        this.getAttribute('gap-tablet') ??
        this.accordion?.getAttribute('header-gap-tablet') ??
        '1.25rem',
      handleAlign: () =>
        this.getAttribute('handle-align') ||
        this.accordion?.getAttribute('handle-align') ||
        'left',
      handleSize: () =>
        this.getAttribute('handle-size') ||
        this.accordion?.getAttribute('handle-size') ||
        handleSizes[this.props.titleSize()] ||
        'small',
      handleSizeTablet: () =>
        this.getAttribute('handle-size-tablet') ||
        this.accordion?.getAttribute('handle-size-tablet') ||
        'large',
      id: () =>
        this.idOriginal ||
        this.accordion?.accordionHeaderId(this.props.accordionItemIndex()),
      padding: () =>
        this.getAttribute('padding') || this.accordion?.padding || '1.5rem',
      paddingTablet: () =>
        this.getAttribute('padding-tablet') ||
        this.accordion?.paddingTablet ||
        '2rem',
      titleSize: () => this.accordion?.getAttribute('title-size') || null,
      titleBold: () => this.accordion?.getAttribute('title-bold') || null,
      titlePrimitive: () =>
        this.accordion?.getAttribute('title-primitive') || null,
    };

    this.styles = () => css`
      :host {
        display: block;
      }

      :host(:not([accordion-item-index='0'])) button {
        border-top: 1px solid var(--color-gray-85);
      }

      .header-button {
        ${isHandleSizeNamed(this.handleSize)
          ? css`
              --handle-width: ${handleWidths[this.handleSize]};
              --handle-padding: ${handlePadding[this.handleSize]};
            `
          : css`
              --handle-width: ${this.handleSize};
              --handle-padding: calc(var(--handle-width) / 3);
            `}
        --gap: ${this.gap};
        width: 100%;
        display: flex;
        overflow: visible;
        text-align: left;
        align-items: center;
        padding: ${this.padding} 0;
      }

      .header-button:hover {
        outline: none;
      }

      .header-button:focus-visible {
        outline: var(--outline-focus);
        outline-offset: -1px;
      }

      .text-wrap {
        display: flex;
        align-items: baseline;
      }

      .button-icon-wrap {
        width: calc(var(--handle-width) + 2 * var(--handle-padding));
        position: relative;
        display: inline-block;
        margin-right: auto;
        flex-shrink: 0;
      }

      evolv-button-icon {
        position: absolute;
        transform: translateY(-50%);
        transition: transform ${this.duration}ms ease;
      }

      :host([aria-expanded='true']) evolv-button-icon {
        transform: translateY(-50%) rotate(180deg);
      }

      .left-slot-wrap {
        margin-left: var(--gap);
      }

      ::slotted([slot='right']) {
        text-align: right;
        justify-self: flex-end;
      }

      .handle-align-right .left-slot-wrap {
        margin-left: auto;
      }

      .handle-align-right .button-icon-wrap {
        margin-left: calc(var(--gap) - var(--handle-padding));
        margin-right: 0;
      }

      @media screen and (min-width: ${this.breakpoint}) {
        .header-button {
          --gap: ${this.gapTablet};
          padding: ${this.paddingTablet} 0;
        }

        .button-icon-wrap {
          ${isHandleSizeNamed(this.handleSizeTablet)
            ? css`
                --handle-width: ${handleWidths[this.handleSizeTablet]};
              `
            : css`
                --handle-width: ${this.handleSizeTablet};
              `}
        }
      }
    `;

    this.template = () => html`
      <button class="header-button unbutton handle-align-${this.handleAlign}">
        <evolv-title
          ${this.titleBold ? `bold="${this.titleBold}"` : ''}
          ${this.titlePrimitive ? `primitive="${this.titlePrimitive}"` : ''}
          ${this.titleSize ? `size="${this.titleSize}"` : ''}
          breakpoint="${this.breakpoint}"
        >
          <slot></slot>
        </evolv-title>
        <span class="left-slot-wrap"><slot name="left"></slot></span>
        <span class="button-icon-wrap">
          <evolv-button-icon
            ${this.handleSize ? `size="${this.handleSize}"` : ''}
            name="down-caret"
            tabindex="-1"
            breakpoint="${this.breakpoint}"
          ></evolv-icon>
        </span>
        <slot name="right"></slot>
      </button>
    `;

    this.parts = {
      headerButton: '.header-button',
    };

    this.onRender = () => {
      if (this.accordionItemIndex) {
        this.setAttribute('accordion-item-index', this.accordionItemIndex);
        this.setAttribute(
          'aria-controls',
          this.accordion.accordionDetailsId(this.accordionItemIndex),
        );
      }
    };
  }
}

export default AccordionHeader;
