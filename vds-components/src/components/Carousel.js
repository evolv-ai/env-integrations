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
    'previous-button-track',
    'progress-bar-track',
    'tile-height',
    'tile-width',
  ];

  tileItems = [];

  constructor() {
    super();

    this.carouselIndex = vds.carouselIndex;
    vds.carouselIndex += 1;
    this.previousArrow = `evolv-icon {transform:rotate(90deg)}`;
    this.nextArrow = `evolv-icon {transform:rotate(270deg)}`;

    this.props = {
      aspectRatio: () => this.getAttribute('aspect-ratio') || '4/5',
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      dataTrackIgnore: () => this.getAttribute('data-track-ignore') || false,
      gutter: () => this.getAttribute('gutter') || '24',
      id: () => this.getAttribute('id') || `carousel${this.carouselIndex}`,
      layout: () => this.getAttribute('layout') || '3',
      maxHeight: () => Math.round(parseInt(this.props.maxWidth()) - 60 / 2),
      maxWidth: () => this.getAttribute('max-width') || 1272,
      nextButtonTrack: () =>
        this.getAttribute('next-button-track') ||
        `next button| ${this.props.id()}`,
      paginationDisplay: () =>
        parseFloat(this.getAttribute('pagination-display')) || 'persistent',
      peek: () => this.getAttribute('peek') || 'standard',
      previousButtonTrack: () =>
        this.getAttribute('previous-button-track') ||
        `previous button | ${this.props.id()}`,
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
      .carousel-container {
        position: relative;
        max-width: ${this.props.maxWidth()}px;
        padding: 30px 20px;
        margin: auto;
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .carousel-wrapper {
        overflow: hidden;
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
      }

      .carousel {
        display: flex;
        gap: ${this.props.gutter()}px;
        transition: transform 0.3s ease-in-out;
        touch-action: pan-y;
        will-change: transform;
      }

      .carousel-nav-button {
        align-items: center;
        background-clip: padding-box;
        background-color: rgb(255, 255, 255);
        border-radius: 50%;
        border: none;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 0.0625rem;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        justify-content: center;
        margin: 0px;
        outline: none;
        padding: 0px;
        pointer-events: auto;
        position: absolute;
        text-align: center;
        text-decoration: none;
        touch-action: manipulation;
        top: 50%;
        transition: 0.1s ease-out;
        transform: translateY(-50%);
        vertical-align: middle;
        z-index: 10;
      }
      .carousel-nav-button:hover {
        outline: none;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 0.0625rem;
      }
      .carousel-nav-button.previous {
        left: 0;
      }
      .carousel-nav-button.next {
        right: 0;
      }
      .carousel-scroll {
        margin-top: 10px;
        width: 96px;
        height: 8px;
        background: #ccc;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        position: relative;
      }
      .carousel-scroll-thumb {
        width: 24px;
        height: 100%;
        background: #888;
        border-radius: 4px;
        cursor: grab;
        position: absolute;
        left: 0;
        transition: left 0.3s ease-in-out;
      }
    `;

    this.template = () => html`
      <div class="carousel-container">
        <evolv-button-icon
          name="down-caret"
          size="large"
          css="${this.previousArrow}"
          class="carousel-nav-button previous"
          data-track="${this.props.previousButtonTrack()}"
        ></evolv-button-icon>
        <div class="carousel-wrapper">
          <div class="carousel">
            <slot></slot>
          </div>
        </div>
        <evolv-button-icon
          name="down-caret"
          size="large"
          css="${this.nextArrow}"
          class="carousel-nav-button next"
          data-track="${this.props.nextButtonTrack()}"
        ></evolv-button-icon>
        <div class="carousel-scroll">
          <div
            class="carousel-scroll-thumb"
            data-track="${this.props.scrollTrack()}"
          ></div>
        </div>
      </div>
    `;

    this.parts = {
      carouselContainer: '.carousel-container',
      carouselWrapper: '.carousel-wrapper',
      carousel: '.carousel',
      leftArrow: '.carousel-nav-button.previous',
      rightArrow: '.carousel-nav-button.next',
      scroll: '.carousel-scroll',
      scrollThumb: '.carousel-scroll-thumb',
    };

    this.onRender = () => {
      this.viewportWidth = this.parts.carouselContainer.clientWidth;
      this.scrollPosition = 0;
      this.isDragging = false;
      this.startX = 0;
      this.initEvents();
    };
  }

  tileContainerId = (index) => {
    return `${this.id}Tile${index}`;
  };

  updateScrollThumb = () => {
    const totalScrollableWidth =
      this.parts.carousel.scrollWidth - this.viewportWidth;
    const scrollRatio = this.scrollPosition / totalScrollableWidth;
    const thumbMaxMove =
      this.parts.scroll.clientWidth - this.parts.scrollThumb.clientWidth;
    this.parts.scrollThumb.style.left = `${scrollRatio * thumbMaxMove}px`;
  };

  updateArrows = () => {
    this.parts.leftArrow.style.display =
      this.scrollPosition === 0 ? 'none' : 'block';
    this.parts.rightArrow.style.display =
      this.scrollPosition >=
      this.parts.carousel.scrollWidth - this.viewportWidth
        ? 'none'
        : 'block';
  };

  setScrollPosition = (pos) => {
    this.scrollPosition = Math.max(
      0,
      Math.min(pos, this.parts.carousel.scrollWidth - this.viewportWidth)
    );
    this.parts.carousel.style.transform = `translateX(-${this.scrollPosition}px)`;
    this.updateArrows();
    this.updateScrollThumb();
  };

  onPreviousClick = () => {
    this.parts.leftArrow.addEventListener('click', () => {
      this.setScrollPosition(this.scrollPosition - this.viewportWidth);
    });
  };

  onNextClick = () => {
    this.parts.rightArrow.addEventListener('click', () => {
      this.setScrollPosition(this.scrollPosition + this.viewportWidth);
    });
  };

  scrollbarClick = () => {
    this.parts.scroll.addEventListener('click', (e) => {
      const rect = this.parts.scroll.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const totalWidth = this.parts.scroll.clientWidth;
      const scrollRatio = clickX / totalWidth;
      this.setScrollPosition(
        scrollRatio * (this.parts.carousel.scrollWidth - this.viewportWidth)
      );
    });
  };

  scrollThumbMove = () => {
    // Mouse drag support for scrollbar thumb
    this.parts.scrollThumb.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      document.body.style.userSelect = 'none';
    });
    // ✅ Touch support for scrollbar thumb
    this.parts.scrollThumb.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
    });
    this.parts.scrollThumb.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.startX;
      const thumbMaxMove =
        this.parts.scroll.clientWidth - this.parts.scrollThumb.clientWidth;
      const scrollDelta =
        (dx / thumbMaxMove) *
        (this.parts.carousel.scrollWidth - this.viewportWidth);
      this.setScrollPosition(this.scrollPosition + scrollDelta);
      this.startX = e.touches[0].clientX;
    });
    this.parts.scrollThumb.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  };

  documentListeners = () => {
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const thumbMaxMove =
        this.parts.scroll.clientWidth - this.parts.scrollThumb.clientWidth;
      const scrollDelta =
        (dx / thumbMaxMove) *
        (this.parts.carousel.scrollWidth - this.viewportWidth);
      this.setScrollPosition(this.scrollPosition + scrollDelta);
      this.startX = e.clientX;
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      document.body.style.userSelect = '';
    });
  };

  carouselListeners = () => {
    // Touch swipe on carousel itself
    this.parts.carousel.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
    });

    this.parts.carousel.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const deltaX = this.startX - e.touches[0].clientX;
      this.setScrollPosition(this.scrollPosition + deltaX);
      this.startX = e.touches[0].clientX;
    });

    this.parts.carousel.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  };

  initEvents = () => {
    this.onPreviousClick();
    this.onNextClick();
    this.scrollbarClick();
    this.scrollThumbMove();
    this.documentListeners();
    this.carouselListeners();
    window.addEventListener('resize', () => {
      this.viewportWidth = this.parts.carouselContainer.clientWidth;
      this.setScrollPosition(this.scrollPosition);
    });
  };

  contentChangedCallback = () => {
    this.tileItems = this.querySelectorAll('evolv-tile-container');
    this.tileItems.forEach((tileItem, index) => {
      tileItem.setAttribute('index', index);
    });
  };
}

export default Carousel;
