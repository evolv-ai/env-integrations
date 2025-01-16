import vds from '../imports/vds.js';
import Title from './Title.js';

class ModalTitle extends Title {
  static observedAttributes = [...this.observedAttributes];

  constructor() {
    super();

    this.props = {
      breakpoint: () =>
        this.getAttribute('breakpoint') ||
        this._props.modal().breakpoint ||
        vds.breakpoint ||
        '768px',
      id: () => this.id || this._props.modal().titleId,
      modal: () => this.closest('evolv-modal'),
      size: () => this.getAttribute('size') || 'large',
    };

    this.styles = () => css`
      .modal-title {
        margin-right: 40px;
      }
    `;

    this.template = () => html`
      <${this.primitive} class="title modal-title">
        <slot></slot>
      </${this.primitive}>
    `;
  }
}

export default ModalTitle;
