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
    console.log(
      'evolv this.carousel',
      this.carousel.getAttribute('aspect-ratio')
    );

    this.props = {
      aspectRatio: () => '2/3',
      id: () => '1',
      disableTrack: () => this.getAttribute('disable-track') === 'true',
      trackName: () => this.getAttribute('track-name') || null,
      padding: () => this.getAttribute('padding') || '30px',
      backgroundColor: () => this.getAttribute('background-color') || 'white',
      height: () => this.getAttribute('height') || 'auto',
      backgroundImage: () => this.getAttribute('background-image') || null,
      showBorder: () => this.getAttribute('show-border') || true,
      showDropShadow: () => this.getAttribute('show-drop-shadow') || false,
      onClick: () => this.getAttribute('onClick') || null,
      width: () => '200px',
      // width: () =>
      //   this.carousel
      //     ? Math.round(
      //         this.carousel.offsetWidth / (parseInt(this.carousel.layout) - 0.5)
      //       ) + 'px'
      //     : '200px',
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
        flex: 0 0 ${this.props.width()};
        flex-direction: column;
        height: ${this.props.height()};
        outline: none;
        padding: ${this.props.padding()};
        position: relative;
        scroll-snap-align: start;
        scroll-margin: 66px;
        text-align: left;
        width: ${this.props.width()};
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
