import vds from '../imports/vds';
import Base from './Base';

class Carousel extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'aspect-ratio',
    'data-track-ignore',
    'gutter',
    'id',
    'layout',
    'peek',
    'next-button-track',
    'pagination-display',
    'prev-button-track',
    'progress-bar-track',
    'tile-height',
    'tile-width',
  ];

  tiles = [];
  scroll = false;
  carousel = this;
  nextObserver;
  prevObserver;

  get viewport() {
    return new DOMRect(
      this.parts.track.scrollLeft,
      0,
      this.parts.carouselInner.offsetWidth,
      this.parts.carouselInner.offsetHeight,
    );
  }

  get nextTile() {
    let i = this.tiles.length - 1;
    let nextTile = this.tiles[i];
    while (i--) {
      if (this.isVisible(this.tiles[i])) {
        return nextTile;
      }
      nextTile = this.tiles[i];
    }
  }

  get prevTile() {
    let firstVisibleIndex;
    let lastVisibleIndex;
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.isVisible(this.tiles[i])) {
        firstVisibleIndex ??= i;
        lastVisibleIndex = i;
      } else if (firstVisibleIndex) {
        break;
      }
    }

    const visibleTileCount = lastVisibleIndex - firstVisibleIndex + 1;
    const prevTileIndex = Math.max(firstVisibleIndex - visibleTileCount, 0);
    return this.tiles[prevTileIndex];
  }

  constructor() {
    super();

    this.carouselIndex = vds.carouselIndex;
    vds.carouselIndex += 1;

    this.props = {
      aspectRatio: () => this.getAttribute('aspect-ratio') || '4/5',
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      dataTrackIgnore: () => this.getAttribute('data-track-ignore') || false,
      gutter: () => this.getAttribute('gutter') || '24',
      id: () =>
        this.getAttribute('id') || `evolv-carousel-${this.carouselIndex}`,
      layout: () => this.getAttribute('layout') || '3',
      maxHeight: () => Math.round(parseInt(this.props.maxWidth()) - 60 / 2),
      maxWidth: () => this.getAttribute('max-width') || 1272,
      nextButtonTrack: () =>
        this.getAttribute('next-button-track') ||
        `next button| ${this.props.id()}`,
      paginationDisplay: () =>
        parseFloat(this.getAttribute('pagination-display')) || 'persistent',
      peek: () => this.getAttribute('peek') || 'standard',
      prevButtonTrack: () =>
        this.getAttribute('prev-button-track') ||
        `prev button | ${this.props.id()}`,
      scrollTrack: () =>
        this.getAttribute('scroll-track') ||
        `progress bar | ${this.props.id()}`,
      tileHeight: () => this.getAttribute('tile-height') || null,
      tileWidth: () => this.getAttribute('tile-width') || null,
    };

    this.onAttributeChanged = () => this.renderChildren();

    this.styles = () => css`
      :host {
        display: block;
      }

      .carousel {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: ${this.props.maxWidth()}px;
        padding: 30px 0;
        gap: 32px;
      }

      .carousel-inner {
        position: relative;
        display: flex;
        width: 100%;
      }

      .track {
        display: flex;
        gap: ${this.props.gutter()}px;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        padding: ${this.props.gutter()}px;
      }

      .track.dragging {
        scroll-snap-type: none;
      }

      .nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3;
      }

      .nav.prev {
        left: 0;
        margin-left: 12px;
      }

      .nav.next {
        right: 0;
        margin-right: 12px;
      }

      .nav-button {
        align-items: center;
        background-color: white;
        border-radius: 50%;
        border: none;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        justify-content: center;
        outline: none;
        padding: 0;
        position: relative;
        text-decoration: none;
        touch-action: manipulation;
        transition: box-shadow 0.1s ease-out;
        width: 1.75rem;
        height: 1.75rem;
        -webkit-tap-highlight-color: transparent;
      }

      .nav-button::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        margin: -1px;
        border-radius: 50%;
        box-shadow:
          rgba(0, 0, 0, 0.12) 0 1px 10px,
          rgba(0, 0, 0, 0.05) 0 2px 4px;
        z-index: -1;
      }

      .nav-button:hover::after {
        box-shadow:
          rgba(0, 0, 0, 0.12) 0 1px 11px,
          rgba(0, 0, 0, 0.05) 0 3px 5px;
      }

      .nav-button:hover {
        outline: none;
        box-shadow: rgb(255, 255, 255) 0 0 0 0.0625rem;
      }

      .nav-hit-area {
        height: 2.75rem;
        width: 2.75rem;
        display: block;
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        text-align: center;
        transform: translate(-50%, -50%);
      }

      .nav-icon {
        position: relative;
        bottom: 0;
        width: 0.75rem;
        height: 0.75rem;
        pointer-events: none;
      }

      .nav-icon.prev {
        right: 0.125rem;
      }

      .nav-icon.next {
        left: 0.125rem;
      }

      .carousel:not([scroll]) .nav-button {
        display: none;
      }

      @media (min-width: ${this.breakpoint}) {
        .nav-button {
          width: 2.5rem;
          height: 2.5rem;
        }

        .nav-icon {
          width: 1rem;
          height: 1rem;
        }
      }
    `;

    this.template = () => html`
      <div class="carousel">
        <div class="carousel-inner">
          <div class="nav prev">
            <button
              class="nav-button prev"
              data-track="${this.prevButtonTrack}"
              aria-label="previous page of tiles"
            >
              <div class="nav-hit-area"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 21.6 21.6"
                width="16"
                height="16"
                class="nav-icon prev"
              >
                <polygon
                  points="14.74336 20.10078 5.44258 10.8 14.74336 1.49922 16.15742 2.91328 8.2707 10.8 16.15742 18.68672 14.74336 20.10078"
                />
              </svg>
            </button>
          </div>
          <div class="track scroll-area">
            <slot></slot>
          </div>
          <div class="nav next">
            <button
              class="nav-button next"
              data-track="${this.prevButtonTrack}"
              aria-label="next page of tiles"
            >
              <div class="nav-hit-area"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 21.6 21.6"
                width="16"
                height="16"
                class="nav-icon next"
              >
                <polygon
                  points="6.85664 20.10127 5.44258 18.68721 13.3293 10.79951 5.44258 2.91279 6.85664 1.49873 16.15742 10.79951 6.85664 20.10127"
                />
              </svg>
            </button>
          </div>
        </div>
        <evolv-scrollbar
          class="pagination"
          orientation="horizontal"
          hover-thickness="8px"
          thumb-hover-color="var(--color-gray-44)"
          data-track="${this.props.scrollTrack()}"
        >
        </evolv-scrollbar>
      </div>
    `;

    this.parts = {
      carousel: '.carousel',
      carouselInner: '.carousel-inner',
      track: '.track',
      scrollArea: '.scroll-area',
      contents: '.contents',
      prev: '.nav-button.prev',
      next: '.nav-button.next',
      pagination: '.pagination',
      scrollThumb: '.carousel-scroll-thumb',
    };

    this.onRender = () => {
      new ResizeObserver(this.detectScroll).observe(this.parts.track);
      this.parts.carousel.addEventListener(
        'evolv:scrollbar-thumb-mousedown',
        () => {
          this.parts.track.classList.add('dragging');
        },
      );

      this.parts.carousel.addEventListener(
        'evolv:scrollbar-thumb-mouseup',
        () => {
          this.parts.track.classList.remove('dragging');
        },
      );

      this.parts.prev.addEventListener('click', this.onPrevClick);
      this.parts.next.addEventListener('click', this.onNextClick);

      this.tiles = [...this.querySelectorAll(':scope > *')];
      this.initNavObserver();

      const { pagination } = this.parts;
      pagination.onTrackClick = this.onScrollbarTrackClick.bind(pagination);
    };

    this.onConnect = () => {
      new ResizeObserver(this.detectScroll).observe(this);
      this.tiles = [...this.querySelectorAll(':scope > *')];
    };
  }

  contentChangedCallback = () => {
    this.initNavObserver();
  };

  tileContainerId = (index) => {
    return `${this.id}-tile-${index}`;
  };

  isVisible = (tile) => {
    const { viewport } = this;
    return (
      tile.offsetLeft >= viewport.left &&
      tile.offsetLeft + tile.clientWidth <= viewport.right
    );
  };

  detectScroll = () => {
    const scrollPrev = this.scroll;
    this.scroll = vds.isScrollable(this.parts.track, 'horizontal');
    if (scrollPrev !== this.scroll) {
      this.parts.pagination.render();
      this.parts.carousel.toggleAttribute('scroll', this.scroll);
    }
  };

  initNavObserver = () => {
    this.prevObserver && this.prevObserver.disconnect();
    this.nextObserver && this.nextObserver.disconnect();

    this.prevObserver = new IntersectionObserver(
      (records) => {
        records.forEach((record) => {
          this.parts.prev.parentNode.toggleAttribute(
            'hidden',
            record.intersectionRatio >= 0.75,
          );
        });
      },
      {
        root: this.parts.carouselInner,
        threshold: 0.75,
      },
    );

    this.nextObserver = new IntersectionObserver(
      (records) => {
        records.forEach((record) => {
          this.parts.next.parentNode.toggleAttribute(
            'hidden',
            record.intersectionRatio >= 0.75,
          );
        });
      },
      {
        root: this.parts.carouselInner,
        threshold: 0.75,
      },
    );

    this.prevObserver.observe(this.tiles[0]);
    this.nextObserver.observe(this.tiles.at(-1));
  };

  onNextClick = () => {
    this.parts.track.scrollTo({
      left: this.nextTile.offsetLeft,
      behavior: 'smooth',
    });
  };

  onPrevClick = () => {
    this.parts.track.scrollTo({
      left: this.prevTile.offsetLeft,
      behavior: 'smooth',
    });
  };

  // Overrides default scrollbar click behavior, so 'this' refers to the scrollbar
  onScrollbarTrackClick = function ({ target, clientX }) {
    const thumbRect = this.parts.thumb.getBoundingClientRect();

    if (clientX < thumbRect.left) {
      this.parts.parent.onPrevClick();
    } else if (clientX > thumbRect.right) {
      this.parts.parent.onNextClick();
    }
  };

  contentChangedCallback = () => {
    this.tileItems = this.querySelectorAll('evolv-tile-container');
    this.tileItems.forEach((tileItem, index) => {
      tileItem.setAttribute('index', index);
    });
  };
}

export default Carousel;
