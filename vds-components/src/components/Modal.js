import utils from '../imports/utils';
import vds from '../imports/vds';
import Base from './Base';

class Modal extends Base {
  static observedAttributes = [...this.observedAttributes];

  modalIndex = null;
  hasScrollbar = false;
  delegatesFocus = true;

  constructor() {
    super();

    this.props = {
      activeElement: document.activeElement,
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      duration: () => this.getAttribute('duration') || 400,
      focusFirst: () =>
        this.getAttribute('focus-first') || 'evolv-button, button',
      closeButtonLocation: () =>
        this.getAttribute('close-button-location') || 'top',
      modalOpenClass: 'evolv-modal-open',
      titleId: () => `evolv-modal-${vds.modalIndex}-title`,
      width: () => this.getAttribute('width') || '35rem',
      maxHeight: () => this.getAttribute('max-height') || '70vh',
    };

    this.styles = () => css`
      .backdrop {
        position: fixed;
        display: contents;
        background-color: var(--color-overlay);
        inset: 0;
        opacity: 0;
        transition: opacity ${this.duration}ms ease-in;
        z-index: 998;
      }

      .modal {
        position: fixed;
        inset: 0;
        background-color: white;
        color: black;
        transform: translateY(var(--window-height));
        transition: transform ${this.duration}ms ease-in;
        padding: 16px;
        z-index: 999;
      }

      .close-button-top {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .close-button-bottom {
        ${vds.style.text.body.large()}
        height: 2.75rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        flex-grow: 0;
        border-top: 1px solid var(--color-gray-85);
        padding: 0;
        outline: none;
      }

      :host([open]) .backdrop {
        opacity: 1;
        transition: opacity ${this.duration}ms ease-out;
      }

      :host([open]) .modal {
        transform: translateY(0px);
        transition: transform ${this.duration}ms ease-out;
      }

      .modal-header {
        margin-right: 40px;
      }

      .modal-body {
        margin-top: 1.5rem;
      }

      @media screen and (min-width: ${this.breakpoint}) {
        .backdrop {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal {
          position: static;
          display: flex;
          flex-flow: column;
          width: ${this.width};
          min-height: 14.5rem;
          max-height: ${this.maxHeight};
          border-radius: 0.75rem;
          transform: translateY(71.68px);
          transition: transform ${this.duration}ms
            cubic-bezier(0.25, 0.46, 0.45, 0.94);
          padding: 48px 0px 48px 46px;
        }

        .modal-content {
          padding: 0 48px 0 2px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
      }
    `;

    this.template = () => html`
      <div class="backdrop">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          style="--window-height: ${window.innerHeight}px"
        >
          <div id="focus-trap-start" tabindex="0"></div>
          ${this.closeButtonLocation !== 'bottom'
            ? html`<evolv-button-icon
                name="close"
                class="close-button close-button-top"
              ></evolv-button-icon>`
            : ''}
          <div class="modal-content">
            <slot></slot>
          </div>
          ${this.closeButtonLocation === 'bottom'
            ? html`<button class="unbutton close-button close-button-bottom">
                Close
              </button>`
            : ''}
          <div id="focus-trap-end" tabindex="0"></div>
        </div>
      </div>
    `;

    this.parts = {
      backdrop: '.backdrop',
      modal: '.modal',
      modalContent: '.modal-content',
      closeButton: '.close-button',
      focusable: () =>
        [
          this.shadow.querySelector('.close-button'),
          ...this.querySelectorAll(vds.focusable),
          this.shadow.querySelector('.closeButtonTooltip'),
        ].filter((elements) => elements),
      focusTrapStart: '#focus-trap-start',
      focusTrapEnd: '#focus-trap-end',
    };

    this.onConnect = this.open;

    this.onRender = () => {
      this.setAttribute('role', 'dialog');
      this.setAttribute('aria-modal', 'true');
      this.setAttribute('aria-labelledby', this.titleId);
      window.addEventListener('resize', this.onWindowResize);
      this.parts.backdrop.addEventListener('click', this.onBackdropClick);
      this.parts.closeButton?.addEventListener('click', this.close);
      this.parts.focusTrapStart.addEventListener('focus', this.trapFocus);
      this.parts.focusTrapEnd.addEventListener('focus', this.trapFocus);

      if (vds.isScrollable(this.parts.modalContent)) {
        this.isScrollable = true;
        this.addEventListener('keydown', this.onKeydown);
      }

      setTimeout(() => {
        (
          this.querySelector(this.focusFirst) ||
          this.shadow.querySelector(this.focusFirst)
        )?.focus();
      }, 0);
    };

    this.onDisconnect = () =>
      window.removeEventListener('resize', this.onWindowResize);

    this.modalIndex = vds.modalIndex;
    vds.modalIndex += 1;
  }

  onWindowResize = () => {
    utils.updateProperty(
      'window-height',
      `${window.innerHeight}px`,
      this.parts.modal
    );
  };

  open = () => {
    this.toggleAttribute('open', true);
    vds.disableBodyScroll();
  };

  close = (event) => {
    this.toggleAttribute('open', false);
    setTimeout(() => this.remove(), this.duration);
    this.activeElement.focus();
    vds.enableBodyScroll();
  };

  onBackdropClick = ({ target }) => {
    if (target === this.parts.backdrop) {
      this.close();
    }
  };

  onKeydown = (event) => {
    const { modalContent } = this.parts;

    const scrollTopNew = vds.keyScrolling(event, modalContent);

    if (scrollTopNew !== null) {
      modalContent.scrollTo({
        top: scrollTopNew,
        behavior: 'smooth',
      });
      event.preventDefault();
    }
  };

  trapFocus = ({ target }) => {
    const { focusable } = this.parts;
    switch (target.id) {
      case 'focus-trap-start':
        focusable[focusable.length - 1].focus();
        break;
      case 'focus-trap-end':
        focusable[0].focus();
        break;
      default:
        break;
    }
  };

  trapStartOnFocus = () => {
    this.parts.focusable[length - 1].focus();
    console.log('focus trap start');
  };

  trapEndOnFocus = () => {
    this.parts.focusable[0].focus();
    console.log('focus trap end');
  };
}

export default Modal;
