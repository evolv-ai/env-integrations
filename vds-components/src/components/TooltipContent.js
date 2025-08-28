import vds from '../imports/vds.js';
import utils from '../imports/utils.js';
import Base from '../components/Base.js';

class TooltipContent extends Base {
  static observedAttributes = [...this.observedAttributes];

  bodyObserver = null;
  hasScrollbar = false;
  disableOnContentScroll = false;

  constructor() {
    super();

    this.index = this.dataset.tooltipIndex;
    this.tooltip = document.querySelector(
      `evolv-tooltip[data-tooltip-index="${this.index}"]`,
    );

    this.props = {
      borderRadius: () => this.tooltip.contentBorderRadius,
      breakpoint: () => this.tooltip.breakpoint,
      detectTouchDevice: () => this.tooltip.detectTouchDevice,
      gap: () => this.tooltip.contentGap,
      hoverDelay: () => this.tooltip.hoverDelay,
      isModal: () => this.tooltip.isModal,
      isTouchDevice: () => this.tooltip.isTouchDevice,
      maxHeight: () => this.tooltip.contentMaxHeight,
      modalDuration: () => this.tooltip.modalDuration,
      contentTitle: () => this.tooltip.contentTitle,
      width: () => this.tooltip.contentWidth,
      windowPaddingMobile: () => this.tooltip.windowPaddingMobile,
      windowPaddingDeskTab: () => this.tooltip.windowPaddingDeskTab,
      zIndex: () => this.tooltip.zIndex,
    };

    this.styles = () => css`
      .content-outer {
        --gap: ${this.gap};
        --width: ${this.width};
        --window-padding: 20px;
        position: absolute;
        top: calc(var(--button-top) - var(--gap) - var(--height));
        left: calc(
          var(--button-left) + (var(--button-width) - var(--width)) / 2 +
            var(--offset-x)
        );
        display: flex;
        opacity: 0;
        background-color: rgb(255, 255, 255);
        box-sizing: border-box;
        border-radius: 4px;
        border: 0.0625rem solid rgb(0, 0, 0);
        bottom: var(--offset-y);
        color: #000000;
        max-height: ${this.maxHeight};
        min-height: 2.5rem;
        outline: none;
        text-align: left;
        transition: opacity 0ms linear ${this.hoverDelay}ms;
        width: var(--width);
        z-index: ${this.zIndex};
      }

      .content-outer::before {
        content: '';
        position: absolute;
        display: flex;
        left: calc(50% - var(--offset-x));
        bottom: -0.3rem;
        color: black;
        background: white;
        height: 0.53125rem;
        width: 0.53125rem;
        border-right: 0.0625rem solid black;
        border-bottom: 0.0625rem solid black;
        transform: translateX(-50%) rotate(45deg);
        transition: opacity 0ms linear ${this.hoverDelay}ms;
        z-index: 999;
        opacity: 0;
      }

      .content {
        display: flex;
        width: 100%;
        padding: 0.75rem 0;
      }

      .content-inner {
        display: flex;
        position: relative;
        width: 100%;
        padding: 0 0.75rem;
      }

      .title {
        display: block;
        font-family: var(--font-family-etx);
        font-size: 0.75rem;
        line-height: 1rem;
        font-weight: 700;
        margin-bottom: 4px;
      }

      evolv-modal-title .title {
        ${vds.style.text.body.large()}
        font-weight: 700;
      }

      .close {
        display: none;
      }

      :host([mousedown]) {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      :host([expanded]) .content-outer,
      :host([expanded]) .content-outer::before,
      :host([hover]) .content-outer,
      :host([hover]) .content-outer::before {
        opacity: 1;
      }

      :host([expanded]) .content-outer,
      :host([expanded]) .content-outer::before {
        transition: unset;
        display: flex;
      }

      :host([below]) .content-outer {
        top: calc(var(--button-top) + var(--button-height) + var(--gap));
      }

      :host([below]) .content-outer::before {
        bottom: auto;
        top: -0.307rem;
        transform: translateX(-50%) rotate(225deg);
      }
    `;

    this.template = () =>
      this.isModal
        ? html`
            <evolv-modal
              class="modal"
              duration="${this.modalDuration}"
              hide-close-button="true"
              breakpoint="0px"
              width="18.5rem"
              max-height="19rem"
              close-button-location="bottom"
              css="${css`
                .modal {
                  padding: 0;
                }
                .modal-content {
                  padding: 0 16px 16px;
                  margin: 16px 0 0;
                }
              `}"
            >
              ${this.contentTitle
                ? `
                  <evolv-modal-title size="small">
                    ${this.contentTitle}
                  </evolv-modal-title>`
                : ''}
              <evolv-modal-body
                css="${css`
                  .modal-body {
                    margin-top: 8px;
                  }
                `}"
              >
                <slot></slot>
              </evolv-modal-body>
            </evolv-modal>
          `
        : html`
            <div class="content-outer">
              <div
                class="content text-body-sm"
                aria-live="assertive"
                aria-relevant="all"
              >
                <div class="content-inner">
                  <div class="scroll-area text-body-small">
                    ${this.contentTitle
                      ? `<span class="title">${this.contentTitle}</span>`
                      : ''}
                    <slot></slot>
                  </div>
                  <evolv-scrollbar></evolv-scrollbar>
                </div>
                <button class="close unbutton">Close</button>
              </div>
            </div>
          `;

    this.parts = {
      content: '.content',
      scrollBar: 'evolv-scrollbar',
      scrollArea: '.scroll-area',
      modal: '.modal',
    };

    this.onConnect = () => {
      if (!this.isModal) {
        this.observeBodySize();
      }
    };

    this.onRender = () => {
      if (this.isModal) {
        this.toggleAttribute('modal', true);
      } else {
        this.positionContent();
        this.parts.scrollBar.addEventListener(
          'evolv:scrollbar-thumb-mousedown',
          () => {
            this.disableOnContentScroll = true;
            this.tooltip.disableClick = true;
          },
        );
        this.parts.scrollBar.addEventListener(
          'evolv:scrollbar-thumb-mouseup',
          () => {
            this.tooltip.disableClick = false;
            this.disableOnContentScroll = false;
          },
        );
      }

      if (this.parts.modal) {
        this.parts.modal.onDisconnect = () => this.tooltip.removeContent();
      }

      if (this.parts.scrollBar.hasAttribute('scroll')) {
        this.hasScrollbar = true;
      }
    };

    this.onDisconnect = () => this.bodyObserver?.disconnect();
  }

  observeBodySize = () => {
    this.bodyObserver = new ResizeObserver(this.positionContent).observe(
      document.body,
    );
  };

  positionContent = () => {
    const { content } = this.parts;
    if (!content) {
      return;
    }
    // const bodyTop = utils.getOffsetRect(document.body).top;
    const buttonRect = utils.getOffsetRect(this.tooltip.parts.button);
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const borderRadius = utils.cssSizeToValue(this.borderRadius);
    const gap = utils.cssSizeToValue(this.gap);
    const height = content.getBoundingClientRect().height;
    const width = utils.cssSizeToValue(this.width);
    const left = buttonCenterX - width / 2;
    const right = buttonCenterX + width / 2;
    const caretWidth = 12;
    const windowWidth = window.innerWidth;
    const breakpoint = utils.cssSizeToValue(this.breakpoint);
    const windowPadding =
      windowWidth < breakpoint
        ? utils.cssSizeToValue(this.windowPaddingMobile)
        : utils.cssSizeToValue(this.windowPaddingDeskTab);
    const topBound = buttonRect.top - gap - height - windowPadding;
    const leftBound = left - windowPadding;
    const rightBound = right + windowPadding;
    const maxOffset = (width - caretWidth) / 2 - borderRadius;
    let offsetX = 0;

    if (leftBound < 0) {
      offsetX = Math.min(0 - leftBound, maxOffset);
    } else if (rightBound > windowWidth) {
      offsetX = -Math.min(rightBound - windowWidth, maxOffset);
    }

    this.toggleAttribute('below', topBound < 0);
    utils.updateProperty(
      '--button-left',
      `${Math.round(buttonRect.left)}px`,
      this,
    );
    utils.updateProperty(
      '--button-top',
      `${Math.round(buttonRect.top)}px`,
      this,
    );
    utils.updateProperty(
      '--button-height',
      `${Math.round(buttonRect.height)}px`,
      this,
    );
    utils.updateProperty(
      '--button-width',
      `${Math.round(buttonRect.width)}px`,
      this,
    );
    utils.updateProperty('--gap', `${Math.round(gap)}px`, this);
    utils.updateProperty('--height', `${Math.round(height)}px`, this);
    utils.updateProperty('--offset-x', `${offsetX.toFixed(2)}px`, this);
  };
}

export default TooltipContent;
