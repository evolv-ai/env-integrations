import Base from './Base';

class ModalTitle extends Base {
  static observedAttributes = [...this.observedAttributes];

  constructor() {
    super();

    this.props = {
      modal: () => this.closest('evolv-modal'),
      bold: () => this.getAttribute('bold') || true,
      breakpoint: () =>
        this.props.modal().breakpoint ||
        this.getAttribute('breakpoint') ||
        null,
      id: () => this.id || this.props.modal().titleId,
      size: () => this.getAttribute('size') || 'large',
    };

    this.styles = () => css`
      .modal-header {
        margin-right: 40px;
      }
    `;

    this.template = () => html`
      <div class="modal-header">
        <evolv-title
          size="${this.size}"
          bold="${this.bold}"
          breakpoint="${this.breakpoint}"
        >
          <slot></slot>
        </evolv-title>
      </div>
    `;
  }
}

export default ModalTitle;
