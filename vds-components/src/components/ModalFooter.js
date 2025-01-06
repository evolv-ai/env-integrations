import vds from '../imports/vds.js';
import Base from './Base';

class ModalFooter extends Base {
  static observedAttributes = [...this.observedAttributes];

  constructor() {
    super();

    this.props = {
      breakpoint: () =>
        this.getAttribute('breakpoint') ||
        this.closest('evolv-modal').breakpoint ||
        vds.breakpoint,
    };

    this.styles = () => css`
      .modal-footer {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 3rem 0.125rem 0.25rem;
      }

      ::slotted(*) {
        flex-basis: 0;
      }

      @media screen and (min-width: ${this.breakpoint}) {
        .modal-footer {
          flex-direction: row;
        }

        ::slotted(*) {
          flex-grow: 1;
        }
      }
    `;

    this.template = () => html`
      <div class="modal-footer">
        <slot></slot>
      </div>
    `;
  }

  contentChangedCallback = (entries) => {
    function setWidth(node) {
      if (node.tagName === 'EVOLV-BUTTON') {
        node.setAttribute('width', '100%');
      }
    }

    if (entries) {
      entries.forEach((entry) => {
        entry.addedNodes.forEach((node) => setWidth(node));
      });
    } else {
      Array.from(this.children).forEach((node) => setWidth(node));
    }
  };
}

export default ModalFooter;
