import utils from '../imports/utils.js';
import vds from '../imports/vds.js';
import Base from './Base';

class AccordionDetails extends Base {
  static observedAttributes = [...this.observedAttributes];

  heightObserver = null;

  constructor() {
    super();

    this.accordion = this.closest('evolv-accordion');
    this.accordionItem = this.closest('evolv-accordion-item');

    this.props = {
      accordionItemIndex: () => this.accordionItem?.index,
      breakpoint: () =>
        this.getAttribute('breakpoint') ||
        this.accordion?.breakpoint ||
        '768px',
      duration: () =>
        parseFloat(this.getAttribute('duration')) ||
        this.accordion?.duration ||
        330,
      id: () =>
        this.accordion?.accordionDetailsId(this.props.accordionItemIndex()),
      padding: () => this.accordion?.padding || '1.5rem',
      paddingTablet: () => this.accordion?.paddingTablet || '2rem',
      heightProp: '--height',
    };

    this.styles = () => css`
      :host {
        transition: all ${this.duration}ms ease;
        overflow: hidden;
      }

      div {
        padding: 0 0 ${this.padding};
      }

      slot,
      ::slotted(*) {
        ${vds.style.text.body.large()}
      }

      @media screen and (min-width: ${this.breakpoint}) {
        div {
          padding-bottom: ${this.paddingTablet};
        }
      }
    `;

    this.template = () => html`
      <div class="accordion-details" role="region">
        <slot></slot>
      </div>
    `;

    this.parts = {
      details: '.accordion-details',
    };

    this.onRender = () => {
      this.setAttribute(
        'aria-labelledby',
        this.accordion?.accordionHeaderId(this.accordionItemIndex)
      );

      this.observeHeight();
    };
  }

  observeHeight = () => {
    this.heightObserver = new ResizeObserver(this.updateDetailsHeight);
    this.heightObserver.observe(this.parts.details);
  };

  updateDetailsHeight = () => {
    utils.updateProperty(
      this.heightProp,
      `${this.parts.details.scrollHeight}px`,
      this
    );
  };
}

export default AccordionDetails;
