import vds from '../imports/vds';
import Base from './Base';

class Carousel extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'id',
    'disable-track',
    'track-name',
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

  constructor() {
    super();

    this.carouselIndex = vds.carouselIndex;
    vds.carouselIndex += 1;

    this.props = {
      aspectRatio: () => this.getAttribute('aspect-ratio') || '2/3',
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      disableTrack: () => this.getAttribute('disable-track') || 'true',
      gutter: () => this.getAttribute('gutter') || '24px',
      id: () => this.getAttribute('id') || `carousel-${this.carouselIndex}`,
      layout: () => this.getAttribute('layout') || '3',
      nextButtonTrack: () => this.getAttribute('next-button-track') || null,
      paginationDisplay: () =>
        parseFloat(this.getAttribute('pagination-display')) || 'persistent',
      peek: () => this.getAttribute('peek') || 'standard',
      previousButtonTrack: () =>
        this.getAttribute('previous-button-track') || null,
      progressBarTrack: () => this.getAttribute('progress-bar-track') || null,
      tileHeight: () => this.getAttribute('tile-height') || null,
      trackName: () => this.getAttribute('track-name') || null,
    };

    this.onAttributeChanged = () => this.renderChildren();

    this.styles = () => css`
      :host {
        display: block;
      }
      .carousel {
        position: relative;
      }
      .carousel-track {
        align-items: stretch;
        box-sizing: border-box;
        display: flex;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        gap: ${this.props.gutter()};
        overflow-x: hidden;
        margin-left: 50%;
        padding-top: 8px;
        padding-bottom: 32px;
        padding-left: 20px;
        scroll-padding: 0px 36px;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        scrollbar-width: none;
        transform: translateX(-50%);
        transition: 1s;
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
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .carousel-nav-button {
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
      }
      .carousel-progress {
        background-color: rgb(216, 218, 218);
        border-radius: 4px;
        box-sizing: border-box;
        height: 4px;
        margin: 0 auto;
        position: relative;
        transition: height 100ms linear, width 100ms linear,
          border-radius 100ms linear;
        width: 96px;
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
        left: 0px;
        height: 4px;
        min-width: 16px;
        width: 24px;
        background-color: rgb(111, 113, 113);
        z-index: 1;
        transition: height 100ms linear, left linear;
        border-radius: 4px;
        outline: none;
      }
    `;

    this.template = () => html`
      <div class="carousel">
        <div class="carousel-track">
          <slot></slot>
        </div>
        <div class="carousel-nav">
          <button
            class="carousel-nav-button previous"
            data-track="${this.previousButtonTrack}"
          >
            &lt;
          </button>
          <button
            class="carousel-nav-button next"
            data-track="${this.nextButtonTrack}"
          >
            &gt;
          </button>
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
      // console.log('this.parts.carouselTrack', this.parts.carouselTrack);
      this.parts.carousel.setAttribute(
        'aspect-ratio',
        this.props.aspectRatio()
      );
      this.parts.buttonPrevious.addEventListener('click', this.onPreviousClick);
      this.parts.buttonNext.addEventListener('click', this.onNextClick);
      this.parts.progressBar.addEventListener('click', this.progressBarClick);
      this.resizeCarousel();
    };
  }

  tileContainerId = (index) => {
    return `${this.id}-tile-${index}`;
  };

  counter = 0;
  carouselItems = this.querySelectorAll('evolv-tile-container');
  carouselItemWidth = this.carouselItems[0].offsetWidth;

  onPreviousClick = () => {
    this.counter--;
    if (this.counter < 0) {
      this.counter = this.carouselItems.length - 1;
    }
    this.updateCarousel();
  };

  onNextClick = () => {
    this.counter++;
    if (this.counter === this.carouselItems.length) {
      this.counter = 0;
    }
    this.updateCarousel();
  };

  progressBarClick = (e) => {
    const clickPosition = e.offsetX;
    const containerWidth = this.parts.progressContainer.offsetWidth;
    this.counter = Math.floor(
      (clickPosition / containerWidth) * this.carouselItems.length
    );
    this.updateCarousel();
  };

  updateCarousel = () => {
    let carouselItemWidth = this.carouselItems[0].offsetWidth;
    this.parts.carouselTrack.style.transform = `translateX(${
      -carouselItemWidth * this.counter
    }px)`;
    this.parts.progressBar.style.width = `${
      ((this.counter + 1) / this.carouselItems.length) * 100
    }%`;
  };

  resizeCarousel = () => {
    window.addEventListener('resize', () => {
      this.updateCarousel();
    });
  };
}

export default Carousel;
