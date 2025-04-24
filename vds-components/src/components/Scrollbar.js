import Base from './Base';
import utils from '../imports/utils';
import vds from '../imports/vds.js';

class Scrollbar extends Base {
  static observedAttributes = [
    'hover-thickness',
    'length',
    'orientation',
    'scroll-area-selector',
    'thickness',
    'thumb-color',
    'thumb-hover-color',
    ...this.observedAttributes,
  ];

  bodyObserver = null;
  events = {};
  isHorizontal = false;
  scrollToThumbRatio = null;
  thumbStart = null;
  thumbStartMax = null;
  thumbLength = null;
  thumbToScrollRatio = null;
  hasUpdatedParentStyles = false;

  constructor() {
    super();

    this.props = {
      orientation: () =>
        this.getAttribute('orientation') === 'horizontal'
          ? 'horizontal'
          : 'vertical',
      scrollAreaSelector: () => this.getAttribute('scroll-area') || null,
      startPosition: () =>
        this.props.orientation() === 'horizontal' ? 'left' : 'top',
      length: () => this.getAttribute('length') || null,
      thickness: () => this.getAttribute('thickness') || '4px',
      hoverThickness: () => this.getAttribute('hover-thickness') || '4px',
      thumbColor: () =>
        this.getAttribute('thumb-color') || 'var(--color-gray-44)',
      thumbHoverColor: () =>
        this.getAttribute('thumb-hover-color') || 'var(--color-gray-20)',
    };

    this.styles = () => css`
      :host {
        --thickness: ${this.thickness};
        --border-radius: calc(var(--thickness) / 2);
      }

      :host(:not([scroll])) {
        display: none;
      }

      .scrollbar {
        display: flex;
        align-items: center;
        justify-content: center;
        ${this.either('width|height')}: ${this.hoverThickness};
      }

      .scrollbar-track {
        position: relative;
        ${this.either('width|height')}: var(--thickness);
        ${this.length ? `${this.either('height|width')}: ${this.length}` : ''};
        min-${this.either('height|width')}: 96px;
        border-radius: var(--border-radius);
        background-color: var(--color-gray-85);
        transition: ${this.either('width|height')} 100ms linear, border-radius 100ms linear;
        cursor: pointer;
      }

      .scrollbar-track:hover {
        --thickness: ${this.hoverThickness};
        --border-radius: calc(var(--thickness) / 2);
      }

      .scrollbar-thumb {
        position: absolute;
        ${this.either('height|width')}: var(--thumb-length);
        ${this.either('width|height')}: var(--thickness);
        background-color: ${this.thumbColor};
        display: block;
        ${this.either('right|top')}: 0;
        cursor: grab;
        border-radius: var(--border-radius);
        transform: translate${this.either('Y|X')}(var(--thumb-start));
        transition: ${this.either('width|height')} 100ms linear, border-radius 100ms linear;
      }

      .scrollbar-thumb:hover {
        background-color: ${this.thumbHoverColor};
      }

      .scrollbar-track[mousedown] .scrollbar-thumb {
        cursor: grabbing;
      }

      .scrollbar-track::before,
      .scrollbar-thumb::before {
        content: '';
        position: absolute;
        ${this.either('top|left')}: 0;
        ${this.either('bottom|right')}: 0;
        ${this.either('left|bottom')}: -22px;
        ${this.either('width|height')}: 48px;
      }
    `;

    this.scrollAreaStyles = () => css`
      ${this.scrollAreaSelector || '.scroll-area'} {
        overflow-${this.either('y|x')}: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      ${this.scrollAreaSelector || '.scroll-area'}::-webkit-scrollbar {
        display: none;
      }
    `;

    this.template = html`
      <div class="scrollbar">
        <div class="scrollbar-track">
          <div class="scrollbar-thumb"></div>
        </div>
      </div>
    `;

    this.parts = {
      parent: () => this.getRootNode().host,
      scrollArea: () =>
        !this.scrollAreaSelector
          ? this.getRootNode()?.querySelector('.scroll-area')
          : this.getRootNode()?.querySelector(this.scrollAreaSelector) ||
            document.querySelector(this.scrollAreaSelector),
      track: '.scrollbar-track',
      thumb: '.scrollbar-thumb',
    };

    this.events = {
      scrollBarTrackClickStart: new Event('evolv:scrollbar-track-click-start', {
        bubbles: true,
      }),
      scrollBarTrackClickEnd: new Event('evolv:scrollbar-track-click-end', {
        bubbles: true,
      }),
      scrollBarThumbMousedown: new Event('evolv:scrollbar-thumb-mousedown', {
        bubbles: true,
      }),
      scrollBarThumbMouseup: new Event('evolv:scrollbar-thumb-mouseup', {
        bubbles: true,
      }),
    };

    this.onRender = () => {
      if (
        this.parts.scrollArea &&
        vds.isScrollable(this.parts.scrollArea, this.orientation)
      ) {
        this.thumbStart = 0;
        this.updateLengths();
        this.onContentScroll();
        this.enableOnContentScroll();
        this.enableOnTrackClick();
        this.enableOnThumbMousedown();
        new ResizeObserver(this.updateLengths).observe(this.parts.scrollArea);
        new ResizeObserver(this.updateLengths).observe(this.parts.track);
      }
    };

    this.onDisconnect = () => {
      this.disableOnThumbMouseup();
    };
  }

  either = (name) => {
    const index = this.orientation === 'vertical' ? 0 : 1;
    return name.split('|')[index];
  };

  enableOnContentScroll = () => {
    this.parts.scrollArea.addEventListener('scroll', this.onContentScroll);
  };

  disableOnContentScroll = () => {
    this.parts.scrollArea.removeEventListener('scroll', this.onContentScroll);
  };

  enableOnTrackClick = () => {
    this.parts.track.addEventListener('click', this.onTrackClick);
  };

  disableOnTrackClick = () => {
    this.parts.track.removeEventListener('click', this.onTrackClick);
  };

  enableOnThumbMousedown = () => {
    this.parts.thumb.addEventListener('mousedown', this.onThumbMousedown);
  };

  enableOnThumbMouseup = () => {
    document.body.addEventListener('mouseup', this.onThumbMouseup);
  };

  disableOnThumbMouseup = () => {
    document.body.removeEventListener('mouseup', this.onThumbMouseup);
  };

  onContentScroll = () => {
    const { scrollTop, scrollLeft } = this.parts.scrollArea;
    const scrollStart =
      this.orientation === 'horizontal' ? scrollLeft : scrollTop;

    this.thumbStart = Math.round(scrollStart * this.scrollToThumbRatio);
    utils.updateProperty(
      '--thumb-start',
      `${this.thumbStart}px`,
      this.parts.track,
    );
  };

  onTrackClick = (event) => {
    const clientCoord = event[this.either('clientY|clientX')];
    const trackRect = this.parts.track.getBoundingClientRect();
    this.dispatchEvent(this.events.scrollBarTrackClickStart);
    setTimeout(() => {
      this.dispatchEvent(this.events.scrollBarTrackClickEnd);
    }, 0);
    const scrollStart = Math.round(
      (clientCoord - trackRect[this.either('y|x')] - this.thumbLength / 2) *
        this.thumbToScrollRatio,
    );
    const options = { behavior: 'smooth' };
    options[this.startPosition] = scrollStart;

    this.parts.scrollArea.scrollTo(options);
  };

  onTrackHover = () => {
    if (this.hoverExpand) {
      this.parts.track.classList.add('hover');
    }
  };

  onThumbMousedown = () => {
    this.disableOnContentScroll();
    this.disableOnTrackClick();
    this.parts.track.toggleAttribute('mousedown', true);
    this.dispatchEvent(this.events.scrollBarThumbMousedown);
    this.enableOnThumbMouseup();
    document.body.addEventListener('mousemove', this.onThumbMousemove);
  };

  onThumbMouseup = () => {
    setTimeout(() => {
      this.enableOnContentScroll();
      this.enableOnTrackClick();
      this.dispatchEvent(this.events.scrollBarThumbMouseup);
      this.disableOnThumbMouseup;
    }, 0);
    document.body.removeEventListener('mousemove', this.onThumbMousemove);
    this.parts.track.toggleAttribute('mousedown', false);
  };

  onThumbMousemove = ({ movementX, movementY }) => {
    const movement = this.isHorizontal ? movementX : movementY;
    const scrollProp = this.isHorizontal ? 'scrollLeft' : 'scrollTop';

    if (!movement) {
      return;
    }

    let thumbStartNew = this.thumbStart + movement;

    if (thumbStartNew < 0) {
      thumbStartNew = 0;
    } else if (thumbStartNew > this.thumbStartMax) {
      thumbStartNew = this.thumbStartMax;
    }

    if (thumbStartNew === this.thumbStart) {
      return;
    }

    utils.updateProperty(
      '--thumb-start',
      `${thumbStartNew}px`,
      this.parts.track,
    );

    this.parts.scrollArea[scrollProp] = thumbStartNew * this.thumbToScrollRatio;

    this.thumbStart = thumbStartNew;
  };

  updateLengths = utils.throttle(() => {
    console.log('updateLengths');
    this.isHorizontal = this.orientation === 'horizontal';

    const { offsetWidth, offsetHeight, scrollWidth, scrollHeight } =
      this.parts.scrollArea;
    const offsetLength = this.isHorizontal ? offsetWidth : offsetHeight;
    const scrollLength = this.isHorizontal ? scrollWidth : scrollHeight;
    const trackLength = this.isHorizontal
      ? this.parts.track.offsetWidth
      : this.parts.track.offsetHeight;
    const overflowDirection = this.isHorizontal ? 'x' : 'y';

    this.thumbLength = Math.round((offsetLength * trackLength) / scrollLength);
    this.thumbStartMax = trackLength - this.thumbLength;
    this.thumbToScrollRatio = scrollLength / trackLength;
    this.scrollToThumbRatio = 1 / this.thumbToScrollRatio;

    this.toggleAttribute('scroll', true);
    if (!this.hasUpdatedParentStyles) {
      this.parts.parent.styles = this.scrollAreaStyles();
      this.parts.parent.renderStyle();
      this.hasUpdatedParentStyles = true;
    }

    this.thumbLength &&
      isFinite(this.thumbLength) &&
      utils.updateProperty(
        '--thumb-length',
        `${this.thumbLength}px`,
        this.parts.track,
      );
  });
}

export default Scrollbar;
