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
    'max-width',
    'next-button-track',
    'pagination-display',
    'peek',
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
      aspectRatio: () => this.getAttribute('aspect-ratio') || '5/3',
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      dataTrackIgnore: () => this.getAttribute('data-track-ignore') || false,
      gutter: () => this.getAttribute('gutter') || '24',
      id: () => this.getAttribute('id') || `carousel${this.carouselIndex}`,
      layout: () => this.getAttribute('layout') || '3',
      maxWidth: () => this.getAttribute('max-width') || '1272',
      nextButtonTrack: () =>
        this.getAttribute('next-button-track') ||
        `next button| ${this.props.id()}`,
      paginationDisplay: () =>
        parseFloat(this.getAttribute('pagination-display')) || 'persistent',
      peek: () => this.getAttribute('peek') || 'standard',
      previousButtonTrack: () =>
        this.getAttribute('previous-button-track') ||
        `previous button | ${this.props.id()}`,
      carouselScrollTrack: () =>
        this.getAttribute('progress-bar-track') ||
        `carousel scroll | ${this.props.id()}`,
      tileHeight: () => this.getAttribute('tile-height') || null,
      tileWidth: () => this.getAttribute('tile-width') || null,
    };

    this.onAttributeChanged = () => this.renderChildren();

    this.styles = () => css`
      :host {
        display: block;
      }
      .carousel {
        align-items: center;
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        max-width: ${this.props.maxWidth()}px;
        overflow: hidden;
        padding: 30px 20px;
        position: relative;
      }
      .carousel-track {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        gap: ${this.props.gutter()}px;
        margin-bottom: 20px;
        scroll-padding: 0px 36px;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        scrollbar-width: none;
        transition: transform 0.3s ease-in-out;
        touch-action: pan-y;
        width: 100%;
        will-change: transform;
        &::-webkit-scrollbar {
          width: 0;
        }
        &::-webkit-scrollbar-track {
          background: transparent;
        }
        &::-webkit-scrollbar-thumb {
          background: transparent;
          border: none;
        }
      }
      .carousel-nav-button {
        background-clip: padding-box;
        background-color: rgb(255, 255, 255);
        border-radius: 50%;
        border: none;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 0.0625rem;
        box-sizing: border-box;
        cursor: pointer;
        margin: 0;
        outline: none;
        padding: 0;
        pointer-events: auto;
        position: absolute;
        top: 50%;
        touch-action: manipulation;
        transform: translateY(-50%);
        transition: 0.1s ease-out;
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
        background-color: rgb(216, 218, 218);
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
        height: 6px;
        margin: 0 auto;
        position: relative;
        transition: height 100ms linear, width 100ms linear,
          border-radius 100ms linear;
        width: 96px;
      }
      .carousel-scroll-thumb {
        background-color: rgb(111, 113, 113);
        border-radius: 4px;
        cursor: grab;
        height: 6px;
        left: 0;
        min-width: 16px;
        outline: none;
        position: absolute;
        touch-action: manipulation;
        transition: height 100ms linear, left linear;
        will-change: transform;
        z-index: 1;
      }
    `;

    this.template = () => html`
      <div class="carousel">
        <div class="carousel-track">
          <slot></slot>
        </div>
        <evolv-button-icon
          name="down-caret"
          size="large"
          css="${this.previousArrow}"
          class="carousel-nav-button previous"
          data-track="${this.previousButtonTrack}"
        ></evolv-button-icon>
        <evolv-button-icon
          name="down-caret"
          size="large"
          css="${this.nextArrow}"
          class="carousel-nav-button next"
          data-track="${this.nextButtonTrack}"
        ></evolv-button-icon>
        <div class="carousel-scroll">
          <div
            class="carousel-scroll-thumb"
            data-track="${this.carouselScrollTrack}"
          ></div>
        </div>
      </div>
    `;

    this.parts = {
      carousel: '.carousel',
      carouselTrack: '.carousel-track',
      buttonPrevious: '.carousel-nav-button.previous',
      buttonNext: '.carousel-nav-button.next',
      carouselScroll: '.carousel-scroll',
      carouselScrollThumb: '.carousel-scroll-thumb',
    };

    this.onRender = () => {
      // this.initEvents();
    };
  }

  scrollPosition = 0;
  isDragging = false;
  startX = 0;

  tileContainerId = (index) => {
    return `${this.id}Tile${index}`;
  };

  updateScrollThumb = () => {
    console.log('this.viewportWidth', this.viewportWidth);
    console.log('this.scrollPosition', this.scrollPosition);
    const totalScrollableWidth =
      this.parts.carouselTrack.scrollWidth - this.viewportWidth;
    // console.log(
    //   'updateScrollThumb: totalScrollableWidth',
    //   totalScrollableWidth
    // );
    const scrollRatio = this.scrollPosition / totalScrollableWidth;
    const thumbMaxMove =
      this.parts.carouselScroll.clientWidth -
      this.parts.carouselScrollThumb.clientWidth;
    this.parts.carouselScrollThumb.style.left = `${
      scrollRatio * thumbMaxMove
    }px`;
  };

  updateArrows = () => {
    console.log('this.viewportWidth', this.viewportWidth);
    console.log('this.scrollPosition', this.scrollPosition);
    this.parts.buttonPrevious.style.display =
      this.scrollPosition === 0 ? 'none' : 'block';
    this.parts.buttonNext.style.display =
      this.scrollPosition >=
      this.parts.carouselTrack.scrollWidth - this.viewportWidth
        ? 'none'
        : 'block';
  };

  setScrollPosition = (pos) => {
    this.scrollPosition = Math.max(
      0,
      Math.min(pos, this.parts.carouselTrack.scrollWidth - this.viewportWidth)
    );
    this.parts.carouselTrack.style.transform = `translateX(-${this.scrollPosition}px)`;
    this.updateArrows();
    this.updateScrollThumb();
  };

  initEvents = () => {
    this.parts.buttonPrevious.addEventListener('click', () => {
      console.log('previous click');
      this.setScrollPosition(this.scrollPosition - this.viewportWidth);
    });

    this.parts.buttonNext.addEventListener('click', () => {
      this.setScrollPosition(this.scrollPosition + this.viewportWidth);
    });

    this.parts.carouselScroll.addEventListener('click', (e) => {
      // console.log('carouselScroll click');
      const rect = this.parts.carouselScroll.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const totalWidth = this.parts.carouselScroll.clientWidth;
      const scrollRatio = clickX / totalWidth;
      this.setScrollPosition(
        scrollRatio *
          (this.parts.carouselTrack.scrollWidth - this.viewportWidth)
      );
    });

    // Mouse drag support for scrollbar thumb
    this.parts.carouselScrollThumb.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const thumbMaxMove =
        this.parts.carouselScroll.clientWidth -
        this.parts.carouselScrollThumb.clientWidth;
      const scrollDelta =
        (dx / thumbMaxMove) *
        (this.parts.carouselTrack.scrollWidth - this.viewportWidth);
      this.setScrollPosition(this.scrollPosition + scrollDelta);
      this.startX = e.clientX;
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      document.body.style.userSelect = '';
    });

    // ✅ Touch support for scrollbar thumb
    this.parts.carouselScrollThumb.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
    });

    this.parts.carouselScrollThumb.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.startX;
      const thumbMaxMove =
        this.parts.carouselScroll.clientWidth -
        this.parts.carouselScrollThumb.clientWidth;
      const scrollDelta =
        (dx / thumbMaxMove) *
        (this.parts.carouselTrack.scrollWidth - this.viewportWidth);
      this.setScrollPosition(this.scrollPosition + scrollDelta);
      this.startX = e.touches[0].clientX;
    });

    this.parts.carouselScrollThumb.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Touch swipe on carousel itself
    this.parts.carouselTrack.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
    });

    this.parts.carouselTrack.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const deltaX = this.startX - e.touches[0].clientX;
      this.setScrollPosition(this.scrollPosition + deltaX);
      this.startX = e.touches[0].clientX;
    });

    this.parts.carouselTrack.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => {
      // this.viewportWidth = this.clientWidth;
      this.updateArrows();
      this.setScrollPosition(this.scrollPosition);
    });

    this.updateArrows();
    this.updateScrollThumb();
  };

  contentChangedCallback = () => {
    this.viewportWidth = this.clientWidth;
    this.tileItems = this.querySelectorAll('evolv-tile-container');
    this.tileItems.forEach((tileItem, index) => {
      tileItem.setAttribute('index', index);
    });
    this.initEvents();
  };
}

export default Carousel;
