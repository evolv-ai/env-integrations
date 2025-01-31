import vds from '../imports/vds.js';
import Base from './Base';

class ModalTitle extends Base {
  static observedAttributes = [...this.observedAttributes, 'id', 'size', 'bold', 'primitive'];

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
      bold: () => this.getAttribute('bold') || true,
      primitive: () => this.getAttribute('primitive') || 'h2',
    };

    this.styles = () => css`
      .modal-title {
        margin-right: 40px;
      }
    `;

    this.template = () => html`
      <evolv-title class="modal-title" size=${this.size} bold=${this.bold} primitive="${this.primitive}">
        <slot></slot>
      </evolv-title>
    `;
  }
}

export default ModalTitle;
