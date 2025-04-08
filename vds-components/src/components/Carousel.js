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
  ];

  tileItems = [];

  constructor() {
    super();

    this.carouselIndex = vds.carouselIndex;
    vds.carouselIndex += 1;
    this.previousArrow = `evolv-icon {transform:rotate(90deg)}`;
    this.nextArrow = `evolv-icon {transform:rotate(270deg)}`;
    this.progressContainerWidth = () => 96;

    this.props = {
      aspectRatio: () => this.getAttribute('aspect-ratio') || '5/3',
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      dataTrackIgnore: () => this.getAttribute('data-track-ignore') || false,
      gutter: () => this.getAttribute('gutter') || '24',
      id: () => this.getAttribute('id') || `carousel${this.carouselIndex}`,
      layout: () => this.getAttribute('layout') || '3',
      maxHeight: () => Math.round(parseInt(this.props.maxWidth()) - 60 / 2),
      maxWidth: () => this.getAttribute('max-width') || '1000',
      nextButtonTrack: () =>
        this.getAttribute('next-button-track') ||
        `next button| ${this.props.id()}`,
      paginationDisplay: () =>
        parseFloat(this.getAttribute('pagination-display')) || 'persistent',
      peek: () => this.getAttribute('peek') || 'standard',
      previousButtonTrack: () =>
        this.getAttribute('previous-button-track') ||
        `previous button | ${this.props.id()}`,
      progressBarTrack: () =>
        this.getAttribute('progress-bar-track') ||
        `progress bar | ${this.props.id()}`,
      tileHeight: () => this.getAttribute('tile-height') || null,
    };

    this.onAttributeChanged = () => this.renderChildren();

    this.styles = () => css`
      :host {
        display: block;
      }
      .carousel-container {
        position: relative;
        max-width: 1272px;
        overflow: hidden;
        padding: 30px 20px;
        margin: auto;
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .carousel-wrapper {
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
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 0.0625rem;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0px;
        margin: 0px;
        cursor: pointer;
        box-sizing: border-box;
        text-align: center;
        text-decoration: none;
        position: relative;
        touch-action: manipulation;
        pointer-events: auto;
        vertical-align: middle;
        outline: none;
        background-color: rgb(255, 255, 255);
        border-radius: 50%;
        border: none;
        background-clip: padding-box;
        transition: 0.1s ease-out;
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

      .carousel-scrollbar {
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
      .carousel-scrollbar-thumb {
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
        <div class="carousel-wrapper">
          <evolv-button-icon
            name="down-caret"
            size="large"
            css="${this.previousArrow}"
            class="carousel-nav-button previous"
            data-track="${this.previousButtonTrack}"
          ></evolv-button-icon>
          <div class="carousel">
            <slot></slot>
          </div>
          <evolv-button-icon
            name="down-caret"
            size="large"
            css="${this.nextArrow}"
            class="carousel-nav-button next"
            data-track="${this.nextButtonTrack}"
          ></evolv-button-icon>
        </div>
        <div class="carousel-scrollbar">
          <div
            class="carousel-scrollbar-thumb"
            data-track="${this.progressBarTrack}"
          ></div>
        </div>
      </div>
    `;

    this.parts = {
      carousel: '.carousel',
      leftArrow: '.carousel-nav-button.previous',
      rightArrow: '.carousel-nav-button.next',
      scroll: '.carousel-scrollbar',
      scrollThumb: '.carousel-scrollbar-thumb',
    };

    this.onRender = () => {
      this.viewportWidth = this.clientWidth;
      this.scrollPosition = 0;
      this.isDragging = false;
      this.startX = 0;
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
      startX = e.clientX;
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
    window.addEventListener('resize', () => {
      this.viewportWidth = document.querySelector(
        '.carousel-container'
      ).clientWidth;
      this.setScrollPosition(scrollPosition);
    });
  };

  contentChangedCallback = () => {
    this.tileItems = this.querySelectorAll('evolv-tile-container');
    this.tileItems.forEach((tileItem, index) => {
      tileItem.setAttribute('index', index);
    });
    this.initEvents();
  };
}

export default Carousel;
