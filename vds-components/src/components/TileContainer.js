import vds from '../imports/vds';
import Base from './Base';

class TileContainer extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'backgroundColor',
    'backgroundImage',
    'data-track-ignore',
    'height',
    'id',
    'padding',
    'showBorder',
    'showDropShadow',
    'track-name',
    'width',
  ];

  constructor() {
    super();

    this.carousel = this.closest('evolv-carousel');
    this.carouselWidth = this.carousel.offsetWidth;

    this.props = {
      aspectRatio: () => this.carousel.getAttribute('aspect-ratio') || '2/3',
      backgroundColor: () => this.getAttribute('background-color') || 'white',
      backgroundImage: () => this.getAttribute('background-image') || null,
      height: () => this.getAttribute('height') || 'auto',
      id: () => '1',
      dataTrackIgnore: () => this.getAttribute('data-track-ignore') || false,
      padding: () => this.getAttribute('padding') || '30px',
      showBorder: () => this.getAttribute('show-border') || true,
      showDropShadow: () => this.getAttribute('show-drop-shadow') || false,
      trackName: () => this.getAttribute('track-name') || null,
    };

    this.styles = () => css`
      :host {
        display: block;
      }
      .tile-container {
        aspect-ratio: ${this.props.aspectRatio()};
        background-color: ${this.props.backgroundColor()};
        background-image: url(${this.props.backgroundImage()});
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
        border: ${this.props.showBorder()
          ? `1px solid rgb(216, 218, 218)`
          : ``};
        box-shadow: ${this.props.showDropShadow()
          ? `rgba(0, 0, 0, 0.02) 0px 16px 24px;`
          : 'none'};
        box-sizing: content-box;
        border-radius: 12px;
        display: flex;
        flex-basis: ${this.carousel.getAttribute('tile-width')};
        flex-direction: column;
        height: ${this.props.height()};
        outline: none;
        padding: ${this.props.padding()};
        position: relative;
        scroll-snap-align: start;
        scroll-margin: 66px;
        text-align: left;
        width: ${this.carousel.getAttribute('tile-width')};
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
