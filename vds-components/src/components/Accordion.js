import vds from '../imports/vds';
import Base from './Base';

class Accordion extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'id',
    'disable-track',
    'track-name',
    'duration',
    'open-first',
    'padding',
    'padding-tablet',
    'type',
  ];

  accordionItems = [];
  accordionDetails = [];
  accordionHeaders = [];

  constructor() {
    super();

    this.accordionIndex = vds.accordionIndex;
    vds.accordionIndex += 1;

    this.props = {
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      disableTrack: () =>
        this.getAttribute('disable-track') === 'true' ? true : false,
      duration: () => parseFloat(this.getAttribute('duration')) || 330,
      id: () => this.getAttribute('id') || `accordion-${this.accordionIndex}`,
      openFirst: () => this.getAttribute('open-first') === 'true',
      padding: () => this.getAttribute('padding') || '1.5rem',
      paddingTablet: () => this.getAttribute('padding-tablet') || '2rem',
      trackName: () => this.getAttribute('track-name') || null,
      type: () => (this.getAttribute('type') === 'single' ? 'single' : 'multi'),
    };

    this.styles = () => css`
      :host {
        display: block;
      }
    `;

    this.onAttributeChanged = () => this.renderChildren();
  }

  trackValue = (index, expanded) => {
    const header = this.accordionHeaders[index];
    const trackName =
      header.getAttribute('track-name') ||
      (this.trackName ? `${`${this.trackName} ${index}`}` : null) ||
      `${this.id}-${index}`;
    return `{'type':'link','name':'${trackName}:${
      expanded ? 'expand' : 'collapse'
    }'}`;
  };

  accordionHeaderId = (index) => {
    return `${this.id}-header-${index}`;
  };

  accordionDetailsId = (index) => {
    return `${this.id}-details-${index}`;
  };

  expand = (index) => {
    const item = this.accordionItems[index];
    const header = this.accordionHeaders[index];
    const details = this.accordionDetails[index];
    item.setAttribute('expanded', 'true');
    header.setAttribute('aria-expanded', 'true');
    details.toggleAttribute('active', true);
    details.style.display = 'block';

    if (!this.disableTrack) {
      header.dataset.track = this.trackValue(index, false);
    }

    setTimeout(() => {
      details.updateDetailsHeight();
      details.style.height = `var(${details.heightProp})`;
      details.style.opacity = '1';
    }, 0);
  };

  collapse = (index) => {
    const item = this.accordionItems[index];
    const header = this.accordionHeaders[index];
    const details = this.accordionDetails[index];
    item.setAttribute('expanded', 'false');
    header.setAttribute('aria-expanded', 'false');
    details.toggleAttribute('active', false);
    details.style.height = '0';
    details.style.opacity = '0';

    if (!this.disableTrack) {
      header.dataset.track = this.trackValue(index, true);
    }

    setTimeout(() => {
      if (item.getAttribute('expanded') === 'false') {
        details.style.display = 'none';
      }
    }, this.duration);
  };

  onClick = (event) => {
    // Store index of item being clicked
    const index = this.accordionHeaders.indexOf(event.currentTarget);

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
  };

  onKeydown = (event) => {
    const index = this.accordionHeaders.indexOf(event.currentTarget);
    const key = event.which;
    const { keyCode } = vds;
    const { length } = this.accordionHeaders;
    let indexNew = null;

    switch (key) {
      case keyCode['UP']:
        indexNew = (index + length - 1) % length;
        break;
      case keyCode['DOWN']:
        indexNew = (index + length + 1) % length;
        break;
      case keyCode['HOME']:
        indexNew = 0;
        break;
      case keyCode['END']:
        indexNew = length - 1;
        break;
      default:
        break;
    }

    if (indexNew !== null) {
      this.accordionHeaders[indexNew].focus();
      event.preventDefault();
    }
  };

  initEvents = () => {
    this.accordionHeaders.forEach((accordionHeader, index) => {
      if (!accordionHeader || accordionHeader.dataset.init === 'true') {
        return;
      }

      const accordionDetails = this.accordionDetails[index];
      accordionHeader.addEventListener('click', this.onClick);
      accordionHeader.addEventListener('keydown', this.onKeydown);
      accordionDetails.style.display = 'none';

      if (index === 0 && this.openFirst) {
        this.expand(index);
      } else if (this.prefersReducedMotion) {
        this.expand(index);
      } else {
        this.collapse(index);
      }

      accordionHeader.dataset.init = 'true';
    });
  };

  contentChangedCallback = () => {
    this.accordionItems = this.querySelectorAll('evolv-accordion-item');
    this.accordionItems.forEach((accordionItem, index) => {
      accordionItem.setAttribute('index', index);
      this.accordionHeaders[index] = accordionItem.querySelector(
        'evolv-accordion-header'
      );
      this.accordionDetails[index] = accordionItem.querySelector(
        'evolv-accordion-details'
      );
    });
    this.initEvents();
  };
}

export default Accordion;