import Base from './Base';

class AccordionItem extends Base {
  static observedAttributes = [...this.observedAttributes];

  constructor() {
    super();

    this.accordion = this.closest('evolv-accordion');
    this.accordionIndex = this.accordion?.accordionIndex;
    this.accordionItemIndex = this.getAttribute('index');

    this.props = {
      index: () => this.getAttribute('index'),
    };
  }
}

export default AccordionItem;
