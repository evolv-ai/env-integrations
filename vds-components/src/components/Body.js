import Typography from './Typography.js';

class Body extends Typography {
  static observedAttributes = [...this.observedAttributes, 'strikethrough'];

  constructor() {
    super();

    this.template = () => html`
      <${this.primitive} class="body">
        <slot></slot>
      </${this.primitive}>
    `;
  }
}

export default Body;