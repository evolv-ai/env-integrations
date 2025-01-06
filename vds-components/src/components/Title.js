import Typography from './Typography.js';

class Title extends Typography {
  static observedAttributes = [...this.observedAttributes, 'size'];

  constructor() {
    super();

    const primitives = {
      'xsmall': 'h4',
      'small': 'h3',
      'medium': 'h2',
      'large': 'h2',
      'xlarge': 'h1',
      '2xlarge': 'h1'
    }

    this.props = {
      size: () => this.getAttribute('size') || 'small',
      primitive: () => this.getAttribute('primitive')
        || primitives[this.props.size()]
        || 'h3',
    }

    this.template = () => html`
      <${this.primitive} class="title">
        <slot></slot>
      </${this.primitive}>
    `;
  }
}

export default Title;