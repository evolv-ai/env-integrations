import vds from '../imports/vds.js';
import utils from '../imports/utils.js';
import Base from '../components/Base.js';

class TooltipContent extends Base {
  static observedAttributes = [...this.observedAttributes];

  bodyObserver = null;
  hasScrollbar = false;
  disableOnContentScroll = false;
  scrollToThumbRatio = null;
  thumbTop = null;
  thumbTopMax = null;
  thumbHeight = null;
  thumbToScrollRatio = null;

  constructor() {
    super();

    this.index = this.dataset.tooltipIndex;
    this.tooltip = document.querySelector(
      `evolv-tooltip[data-tooltip-index="${this.index}"]`
    );

    this.props = {
      borderRadius: () => this.tooltip.contentBorderRadius,
      breakpoint: () => this.tooltip.breakpoint,
      gap: () => this.tooltip.contentGap,
      hoverDelay: () => this.tooltip.hoverDelay,
      isTouchDevice: () => utils.isTouchDevice(),
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

      .content-scroll {
        overflow-y: scroll;
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

      :host([scroll]:not([touch])) .content-scroll::-webkit-scrollbar {
        display: none; /* For Chrome, Safari, and Opera */
      }

      :host([scroll]) .content-scroll {
        scrollbar-width: none; /* For Firefox */
        -ms-overflow-style: none; /* For Internet Explorer and Edge */
      }

      :host([scroll]) .scrollbar-track {
        position: absolute;
        width: 4px;
        background-color: var(--color-gray-85);
        display: block;
        top: 0px;
        right: 4px;
        bottom: 0px;
        cursor: pointer;
        border-radius: 2px;
      }

      :host([scroll]) .scrollbar-thumb {
        position: absolute;
        height: var(--thumb-height);
        width: 4px;
        background-color: var(--color-gray-44);
        display: block;
        right: 0;
        cursor: grab;
        border-radius: 2px;
        transform: translateY(var(--thumb-top));
      }

      :host([scroll][mousedown]) .scrollbar-thumb {
        cursor: grabbing;
      }

      :host([scroll]) .scrollbar-track::before,
      :host([scroll]) .scrollbar-thumb::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: -22px;
        width: 48px;
      }

      :host([scroll]) .scrollbar-thumb:hover {
        background-color: black;
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
      this.isTouchDevice
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
                  <div class="content-scroll text-body-small">
                    ${this.contentTitle
                      ? `<span class="title">${this.contentTitle}</span>`
                      : ''}
                    <slot></slot>
                  </div>
                  <div class="scrollbar-track">
                    <div class="scrollbar-thumb"></div>
                  </div>
                </div>
                <button class="close unbutton">Close</button>
              </div>
            </div>
          `;

    this.parts = {
      content: '.content',
      scrollElement: '.content-scroll',
      scrollbarTrack: '.scrollbar-track',
      scrollbarThumb: '.scrollbar-thumb',
      modal: '.modal',
    };

    this.onConnect = () => {
      this.observeBodySize();
    };

    this.onRender = () => {
      if (this.isTouchDevice) {
        this.toggleAttribute('touch', true);
      } else {
        this.hasScrollbar = vds.isScrollable(this.parts.scrollElement);
        this.toggleAttribute('scroll', this.hasScrollbar);
        this.positionContent();

        if (this.hasScrollbar) {
          this.initScrollbar();
        }
      }

      if (this.parts.modal) {
        this.parts.modal.onDisconnect = () => this.tooltip.removeContent();
      }
    };

    this.onDisconnect = () => this.bodyObserver?.disconnect();
  }

  observeBodySize = () => {
    this.bodyObserver = new ResizeObserver(this.positionContent).observe(
      document.body
    );
  };

  positionContent = () => {
    const { content } = this.parts;
    if (!content) {
      return;
    }
    const bodyTop = utils.getOffsetRect(document.body).top;
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
    const topBound = bodyTop + buttonRect.top - gap - height - windowPadding;
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
      this
    );
    utils.updateProperty(
      '--button-top',
      `${Math.round(buttonRect.top - bodyTop)}px`,
      this
    );
    utils.updateProperty(
      '--button-height',
      `${Math.round(buttonRect.height)}px`,
      this
    );
    utils.updateProperty(
      '--button-width',
      `${Math.round(buttonRect.width)}px`,
      this
    );
    utils.updateProperty('--gap', `${Math.round(gap)}px`, this);
    utils.updateProperty('--height', `${Math.round(height)}px`, this);
    utils.updateProperty('--offset-x', `${offsetX.toFixed(2)}px`, this);
  };

  initScrollbar = () => {
    const { offsetHeight, scrollHeight } = this.parts.scrollElement;
    this.thumbHeight = Math.round((offsetHeight * offsetHeight) / scrollHeight);
    this.thumbTop = 0;
    this.thumbTopMax = offsetHeight - this.thumbHeight;
    this.thumbToScrollRatio = scrollHeight / offsetHeight;
    this.scrollToThumbRatio = 1 / this.thumbToScrollRatio;
    utils.updateProperty('--thumb-height', `${this.thumbHeight}px`, this);
    this.onContentScroll();
    this.parts.scrollElement.addEventListener('scroll', this.onContentScroll);
    this.parts.scrollbarTrack.addEventListener(
      'click',
      this.onScrollbarTrackClick
    );
    this.parts.scrollbarThumb.addEventListener(
      'mousedown',
      this.onScrollbarThumbMousedown
    );
    document.body.addEventListener('mouseup', this.onScrollbarThumbMouseup);
  };

  onContentScroll = () => {
    if (this.disableOnContentScroll) {
      return;
    }

    this.thumbTop = Math.round(
      this.parts.scrollElement.scrollTop * this.scrollToThumbRatio
    );
    utils.updateProperty('--thumb-top', `${this.thumbTop}px`, this);
  };

  onScrollbarTrackClick = ({ clientY }) => {
    const trackRect = this.parts.scrollbarTrack.getBoundingClientRect();
    this.tooltip.disableClick = true;
    setTimeout(() => {
      this.tooltip.disableClick = false;
    }, 0);
    const scrollTop = Math.round(
      (clientY - trackRect.y - this.thumbHeight / 2) * this.thumbToScrollRatio
    );
    this.parts.scrollElement.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  onScrollbarThumbMousedown = () => {
    this.disableOnContentScroll = true;
    this.tooltip.disableClick = true;
    this.thumbMousemoveListener = document.body.addEventListener(
      'mousemove',
      this.onScrollbarThumbMousemove
    );
    this.toggleAttribute('mousedown', true);
  };

  onScrollbarThumbMouseup = () => {
    setTimeout(() => {
      this.disableOnContentScroll = false;
      this.tooltip.disableClick = false;
    }, 0);
    document.body.removeEventListener(
      'mousemove',
      this.onScrollbarThumbMousemove
    );
    this.toggleAttribute('mousedown', false);
  };

  onScrollbarThumbMousemove = ({ movementY }) => {
    if (!movementY) {
      return;
    }

    let thumbTopNew = this.thumbTop + movementY;

    if (thumbTopNew < 0) {
      thumbTopNew = 0;
    } else if (thumbTopNew > this.thumbTopMax) {
      thumbTopNew = this.thumbTopMax;
    }

    if (thumbTopNew === this.thumbTop) {
      return;
    }

    this.thumbTop = thumbTopNew;
    this.style.setProperty('--thumb-top', `${thumbTopNew}px`);
    this.parts.scrollElement.scrollTop = thumbTopNew * this.thumbToScrollRatio;
  };
}

export default TooltipContent;
