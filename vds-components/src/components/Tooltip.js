import vds from '../imports/vds.js';
import utils from '../imports/utils.js';
import Base from '../components/Base.js';

class Tooltip extends Base {
  static observedAttributes = [...this.observedAttributes];

  disableClick = false;
  hoverTimer = null;
  tooltipIndex = null;

  constructor() {
    super();

    this.props = {
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      buttonSize: () => {
        if (this.props.type() === 'inline') {
          return '1em';
        } else {
          return this.props.size() === 'small' ? '1rem' : '1.25rem';
        }
      },
      color: () => this.getAttribute('color') || 'inherit',
      content: () => utils.makeElement(this.props.contentHTML()),
      contentBorderRadius: '0.25rem',
      contentGap: '.625rem',
      contentHTML: () => html`
        <evolv-tooltip-content
          id="${this.props.contentId()}"
          data-tooltip-index="${this.tooltipIndex}"
        >
          ${this.innerHTML}
        </evolv-tooltip-content>
      `,
      contentId: () => `tooltip-content-${this.tooltipIndex}`,
      contentMaxHeight: () =>
        this.getAttribute('content-max-height') || '12.75rem',
      contentTitle: () =>
        this.getAttribute('content-title') ||
        this.getAttribute('title') ||
        null,
      contentWidth: () => '14rem',
      detectTouchDevice: () =>
        this.getAttribute('detect-touch-device') !== 'false',
      hoverDelay: () => parseInt(this.getAttribute('hover-delay')) || 400,
      isModal: () =>
        this.props.detectTouchDevice()
          ? this.props.isTouchDevice()
          : !window.matchMedia(`(min-width: ${this.breakpoint})`).matches,
      isTouchDevice: () => utils.isTouchDevice(),
      modalDuration: () => this.getAttribute('modal-duration') || 400,
      size: () => this.getAttribute('size') || 'medium',
      type: () => this.getAttribute('type') || 'inline',
      windowPaddingMobile: '20px',
      windowPaddingDeskTab: '32px',
      zIndex: '999',
    };

    this.styles = () => css`
      .button-wrap {
        position: relative;
        display: inline-block;
        width: ${this.buttonSize};
        height: ${this.buttonSize};
      }

      #tooltip-button {
        position: absolute;
        left: 50%;
        bottom: -0.12em;
        display: flex;
        font-size: inherit;
        -webkit-box-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        align-items: center;
        padding: 0px;
        margin: 0px;
        cursor: pointer;
        color: inherit;
        -webkit-tap-highlight-color: transparent;
        box-sizing: border-box;
        text-align: center;
        text-decoration: none;
        touch-action: manipulation;
        pointer-events: auto;
        vertical-align: middle;
        outline: none;
        background-color: transparent;
        border-radius: 50%;
        border: none;
        background-clip: padding-box;
        transform: translateX(-50%);
        transition: all 0.1s ease-out 0s;
      }

      #tooltip-button:hover {
        background-color: rgba(111, 113, 113, 0.06);
        box-shadow: rgba(111, 113, 113, 0.06) 0px 0px 0px 0.188rem;
      }

      #tooltip-button:focus-visible {
        outline: var(--outline-focus);
      }

      .tooltip-hit-area {
        height: 2.75rem;
        width: 2.75rem;
        display: inline-block;
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    `;

    this.template = () => html`
      <span class="button-wrap">
        <button
          class="unbutton"
          id="tooltip-button"
          name="info"
          aria-expanded="false"
          aria-controls="tooltip-contents"
        >
          <div class="tooltip-hit-area"></div>
          <evolv-icon name="info" size="${this.buttonSize}"></evolv-icon>
        </button>
      </span>
    `;

    this.parts = {
      button: '#tooltip-button',
    };

    this.onRender = () => {
      utils.addClass(document.body, 'evolv-tooltip-present', true);
      this.parts.button.addEventListener('click', this.onClick);
      this.parts.button.addEventListener('mouseenter', this.onMouseenter);
      this.parts.button.addEventListener('mouseleave', this.onMouseleave);
      this.parts.button.addEventListener('keydown', this.onKeydown);
      this.observePositionY();
      this.dataset.tooltipIndex = this.tooltipIndex;
    };

    this.tooltipIndex = vds.tooltipIndex;
    vds.tooltipIndex += 1;
  }

  observePositionY = () => {
    const rootMarginTop = -Math.round(
      utils.cssSizeToValue(this.contentGap) +
        utils.cssSizeToValue(this.contentMaxHeight),
    );

    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.content.toggleAttribute(
            'below',
            !entry.isIntersecting &&
              entry.boundingClientRect?.top < entry.rootBounds?.top,
          );
        });
      },
      {
        rootMargin: `${rootMarginTop}px 0px 0px 0px`,
        threshold: [1],
      },
    ).observe(this.parts.button);
  };

  insertContent = () => {
    this.parts.button.setAttribute('aria-expanded', 'true');
    this.updateProp('content');
    if (!this.props.isModal()) {
      this.content.addEventListener('mouseenter', this.onMouseenter);
      this.content.addEventListener('mouseleave', this.onMouseleave);
      this.content.addEventListener('click', this.onClick);
    }
    document.body.append(this.content);
  };

  removeContent = () => {
    this.parts.button.setAttribute('aria-expanded', 'false');
    document.body.removeEventListener(
      'mouseup',
      this.content.onScrollbarThumbMouseup,
    );

    this.content.remove();
  };

  onClick = ({ target }) => {
    if (this.disableClick) {
      return;
    }

    if (!this.content.isConnected) {
      this.insertContent();
    }

    if (!this.content.hasAttribute('expanded')) {
      this.content.toggleAttribute('expanded', true);
    } else {
      this.removeContent();
    }
  };

  onKeydown = (event) => {
    if (!(this.content.isConnected && this.content.hasScrollbar)) {
      return;
    }

    const { scrollArea } = this.content.parts;
    const scrollTopNew = vds.keyScrolling(event, scrollArea);

    if (scrollTopNew !== null) {
      scrollArea.scrollTo({
        top: scrollTopNew,
        behavior: 'smooth',
      });
      event.preventDefault();
    }
  };

  onMouseenter = () => {
    if (this.props.isModal()) {
      return;
    }

    if (!this.content.isConnected) {
      this.insertContent();
    }

    clearTimeout(this.hoverTimer);
    setTimeout(() => {
      this.content.toggleAttribute('hover', true);
    }, 0);
  };

  onMouseleave = () => {
    if (this.props.isModal()) {
      return;
    }

    this.content.toggleAttribute('hover', false);
    if (!this.content.hasAttribute('expanded')) {
      this.hoverTimer = setTimeout(() => {
        this.removeContent();
      }, this.hoverDelay);
    }
  };
}

export default Tooltip;
