import vds from '../imports/vds';
import Base from './Base';

class Carousel extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'id',
    'data-track-ignore',
    'pagination-display',
    'layout',
    'aspect-ratio',
    'gutter',
    'peek',
    'tile-height',
    'previous-button-track',
    'next-button-track',
    'progress-bar-track',
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
      aspectRatio: () => this.getAttribute('aspect-ratio') || '2/3',
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      dataTrackIgnore: () => this.getAttribute('data-track-ignore') || false,
      gutter: () => this.getAttribute('gutter') || '24',
      id: () => this.getAttribute('id') || `carousel-${this.carouselIndex}`,
      layout: () => this.getAttribute('layout') || '3',
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
      .carousel {
        display: flex;
        flex-direction: column;
        padding: 30px 20px;
        position: relative;
      }
      .carousel-track {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        gap: ${this.props.gutter()}px;
        margin-left: 50%;
        overflow-x: scroll;
        padding-top: 8px;
        padding-bottom: 32px;
        transform: translateX(-50%);
        scroll-padding: 0px 36px;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        scrollbar-width: none;
        width: 100%;
        will-change: scroll-position;
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
      .carousel-nav {
        display: flex;
        justify-content: space-between;
        left: 0;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
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
        visibility: hidden;
      }
      .carousel-progress {
        background-color: rgb(216, 218, 218);
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
        height: 6px;
        margin: 0 auto;
        position: relative;
        transition: height 100ms linear, width 100ms linear,
          border-radius 100ms linear;
        width: ${this.progressContainerWidth()}px;
      }
      .carousel-progress::before {
        min-height: 44px;
        min-width: 44px;
        width: 100%;
        height: 100%;
        position: absolute;
        content: '';
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }
      .carousel-progress-bar {
        touch-action: manipulation;
        position: absolute;
        will-change: transform;
        left: 0;
        height: 6px;
        min-width: 16px;
        background-color: rgb(111, 113, 113);
        z-index: 1;
        transition: height 100ms linear, left linear;
        border-radius: 4px;
        outline: none;
      }
      .carousel-progress-bar::before {
        min-height: 44px;
        min-width: 44px;
        width: 100%;
        height: 100%;
        position: absolute;
        content: '';
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }
    `;

    this.template = () => html`
      <div class="carousel">
        <div class="carousel-track">
          <slot></slot>
        </div>
        <div class="carousel-nav">
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
        </div>
        <div class="carousel-progress">
          <div
            class="carousel-progress-bar"
            data-track="${this.progressBarTrack}"
          ></div>
        </div>
      </div>
    `;

    this.parts = {
      carousel: '.carousel',
      carouselTrack: '.carousel-track',
      buttonPrevious: '.carousel-nav-button.previous',
      buttonNext: '.carousel-nav-button.next',
      progressContainer: '.carousel-progress',
      progressBar: '.carousel-progress-bar',
    };

    this.onRender = () => {
      // this.setAttribute('tile-width', this.setTileWidth());
      this.progressBarWidth();
      this.resizeCarousel();
    };
  }

  tileContainerId = (index) => {
    return `${this.id}-tile-${index}`;
  };

  counter = 1;
  carouselItems = this.querySelectorAll('evolv-tile-container');
  tileCount = this.carouselItems.length;
  layout = parseInt(this.props.layout);

  setTileWidth = () => {
    const layout = parseInt(this.layout);
    const peek = this.props.peek();
    const gutter = parseInt(this.props.gutter());
    let tileWidth = '';
    let carouselSpacing = gutter * 2 + 40;
    if (this.carouselItems.length > layout) {
      tileWidth =
        peek === 'standard'
          ? this.offsetWidth / (layout + 0.3) - carouselSpacing
          : this.offsetWidth / layout - carouselSpacing;
    } else {
      tileWidth = this.offsetWidth / layout;
    }
    return `${Math.floor(tileWidth)}px`;
  };

  resizeTileWidth = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      let aspectRatio = this.props.aspectRatio();
      const bits = aspectRatio.split('/');
      aspectRatio = parseInt(bits[0], 10) / parseInt(bits[1], 10);
      this.tileItems = this.querySelectorAll('evolv-tile-container');
      entries.forEach((entry) => {
        console.log('entry', entry);
        const carouselHeight = entry.contentRect.height;
        const newTileWidth = (carouselHeight - 60) * aspectRatio;
        console.log(
          'carouselHeight, aspectRatio, newTileWidth',
          carouselHeight,
          aspectRatio,
          newTileWidth
        );
        this.tileItems.forEach((tileItem, index) => {
          tileItem.style.width = `${newTileWidth}px`;
        });
      });
    });
    resizeObserver.observe(this);
  };

  onPreviousClick = () => {
    this.counter--;
    if (this.counter < 1) {
      this.counter = 1;
    }
    this.updateCarousel(this.counter);
  };

  onNextClick = () => {
    const denominator = Math.ceil(this.tileCount / this.layout);
    this.counter++;
    if (this.counter >= denominator) {
      this.counter = denominator;
    }
    this.updateCarousel(this.counter);
  };

  progressBarWidth = () => {
    const denominator = Math.ceil(this.tileCount / this.layout);
    this.parts.progressBar.style.width =
      this.progressContainerWidth() / denominator + 'px';
  };

  progressContainerClick = (e) => {
    const denominator = Math.ceil(this.tileCount / this.layout);
    const clickPosition = e.offsetX;
    const segmentSize = Math.ceil(this.progressContainerWidth() / denominator);
    const numberOfSegments = (this.progressContainerWidth() / segmentSize) >> 0;
    if (clickPosition <= segmentSize) {
      this.counter = 1;
    } else if (clickPosition > (numberOfSegments - 1) * segmentSize) {
      this.counter = 2;
    }
    this.updateCarousel(this.counter);
  };

  updateCarousel = (counter) => {
    const denominator = Math.ceil(this.tileCount / this.layout);
    this.parts.buttonPrevious.style.visibility =
      counter !== 1 ? 'visible' : 'hidden';
    this.parts.buttonNext.style.visibility =
      counter >= denominator ? 'hidden' : 'visible';
    let position =
      counter === 1
        ? 0
        : this.layout *
          (this.carouselItems[0].offsetWidth +
            parseInt(this.props.gutter(), 10));
    this.parts.carouselTrack.scrollLeft = position;
    this.parts.progressBar.style.left = `${
      (this.progressContainerWidth() / denominator) * (counter - 1)
    }px`;
  };

  resizeCarousel = () => {
    window.addEventListener('resize', () => {
      this.updateCarousel();
    });
  };

  initEvents = () => {
    this.parts.buttonPrevious.addEventListener('click', this.onPreviousClick);
    this.parts.buttonNext.addEventListener('click', this.onNextClick);
    this.parts.progressContainer.addEventListener(
      'click',
      this.progressContainerClick
    );
  };

  contentChangedCallback = () => {
    this.tileItems = this.querySelectorAll('evolv-tile-container');
    this.tileItems.forEach((tileItem, index) => {
      tileItem.setAttribute('index', index);
    });
    this.resizeTileWidth();
    this.initEvents();
  };
}

export default Carousel;
