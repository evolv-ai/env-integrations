import vds from '../imports/vds.js';
import Base from './Base';

class AccordionHeader extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'duration',
    'handle-align',
    'padding',
    'padding-tablet',
    'title-bold',
    'title-size',
  ];

  constructor() {
    super();

    const buttonIconSizes = {
      small: 'small',
      medium: 'large',
      large: 'large',
    };

    this.accordion = this.closest('evolv-accordion');
    this.accordionItem = this.closest('evolv-accordion-item');
    this.idOriginal = this.id;

    this.props = {
      accordionItemIndex: () => this.accordionItem?.index,
      breakpoint: () =>
        this.getAttribute('breakpoint') ||
        this.accordion?.breakpoint ||
        '768px',
      buttonIconSize: () => buttonIconSizes[this.props.titleSize()] || 'small',
      duration: () =>
        this.getAttribute('duration') || this.accordion?.duration || 330,
      handleAlign: () =>
        this.getAttribute('handle-align') ||
        this.accordion?.getAttribute('handle-align') ||
        'left',
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
    };

    this.styles = () => css`
      :host {
        display: block;
      }

      :host(:not([accordion-item-index='0'])) button {
        border-top: 1px solid var(--color-gray-85);
      }

      .header-button {
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
        outline: var(--outline-focus);
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
        transition: transform ${this.duration}ms ease;
      }

      :host([aria-expanded='true']) evolv-button-icon {
        transform: translateY(-50%) rotate(180deg);
      }

      ::slotted([slot='right']) {
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

    this.template = () => html`
      <button class="header-button unbutton handle-align-${this.handleAlign}">
        <evolv-title
          ${this.titleSize ? `size="${this.titleSize}"` : ''}
          ${this.titleBold ? `bold="${this.titleBold}"` : ''}
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

    this.parts = {
      headerButton: '.header-button',
    };

    this.onRender = () => {
      if (this.accordionItemIndex) {
        this.setAttribute('accordion-item-index', this.accordionItemIndex);
        this.setAttribute(
          'aria-controls',
          this.accordion.accordionDetailsId(this.accordionItemIndex)
        );
      }
    };
  }
}

export default AccordionHeader;
