import vds from '../imports/vds';
import Base from './Base';

class TileContainer extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'id',
    'disable-track',
    'track-name',
    'padding',
    'backgroundColor',
    'height',
    'width',
    'backgroundImage',
    'showBorder',
    'showDropShadow',
    'onClick',
  ];

  constructor() {
    super();

    this.carousel = this.closest('evolv-carousel');
    this.carouselIndex = this.carousel?.carouselIndex;
    this.tileWidth = this.carousel.offsetWidth / this.carousel.layout;

    this.props = {
      id: () => this.carousel?.tileContainerId(this.carouselIndex),
      disableTrack: () => this.getAttribute('disable-track') === 'true',
      trackName: () => this.getAttribute('track-name') || null,
      padding: () => this.getAttribute('padding') || '30px',
      backgroundColor: () => this.getAttribute('background-color') || 'white',
      height: () => this.getAttribute('height') || '100%',
      width: () => Math.round(this.tileWidth) + 'px',
      backgroundImage: () => this.getAttribute('background-image') || null,
      showBorder: () => this.getAttribute('show-border') || true,
      showDropShadow: () => this.getAttribute('show-drop-shadow') || false,
      onClick: () => this.getAttribute('onClick') || null,
    };

    this.styles = () => css`
      :host {
        display: block;
      }
      .tile-container {
        background-color: ${this.backgroundColor};
        background-image: url(${this.backgroundImage});
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
        border: ${this.showBorder ? `1px solid rgb(216, 218, 218)` : ``};
        box-shadow: ${this.showDropShadow
          ? `rgba(0, 0, 0, 0.02) 0px 16px 24px;`
          : 'none'};
        box-sizing: content-box;
        border-radius: 12px;
        display: flex;
        flex: 0 0 ${this.width};
        flex-direction: column;
        height: ${this.height};
        outline: none;
        padding: ${this.padding};
        position: relative;
        scroll-snap-align: start;
        scroll-margin: 66px;
        text-align: left;
        width: ${this.width};
      }
    `;

    this.template = () => html`
      <div class="tile-container">
        <slot></slot>
      </div>
    `;
  }
}

export default TileContainer;
