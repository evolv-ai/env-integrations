import Base from "./Base";

class ModalBody extends Base {
  static observedAttributes = [...this.observedAttributes];

  constructor() {
    super();

    this.styles = () => css`
      .modal-body {
        display: block;
        margin-top: 1.5rem;
      }
    `

    this.template = () => html`
      <evolv-body class="modal-body" size="large">
        <slot></slot>
      </evolv-body>
    `
  }
}

export default ModalBody;