import vds from '../imports/vds.js'
import Base from './Base.js';

// Typography is a parent class for Body, Title, and potentially others
class Typography extends Base {
  static observedAttributes = [...this.observedAttributes, 'primitive'];

  constructor() {
    super();

    this.props = {
      breakpoint: () =>
        this.getAttribute('breakpoint') || vds.breakpoint || '768px',
      display: () => (this._props.primitive() === 'span' ? 'inline' : 'block'),
      primitive: () => this.getAttribute('primitive') || 'p',
    };

    this.styles = () => css`
      :host {
        display: ${this.display};
      }

      .body {
        ${vds.style.text.body.small()}
      }

      :host([size='micro']) .body {
        font-size: 0.6875rem;
      }

      :host([size='medium']) .body,
      :host([size='large']) .body,
      :host([size='xsmall']) .title,
      .title {
        ${vds.style.text.body.medium()}
      }

      .title {
        letter-spacing: normal;
      }

      :host([size='large']) .body,
      .title {
        font-size: 1rem;
        line-height: 1.25rem;
      }

      :host([strikethrough='true']) .body {
        text-decoration: line-through;
      }

      :host([bold='true']) .body,
      :host([bold='true']) .title {
        font-weight: 700;
      }

      :host([bold='true']) .title {
        letter-spacing: normal;
      }

      :host([size='medium']) .title {
        font-size: 1.25rem;
        line-height: 1.5rem;
      }

      :host([size='large']) .title {
        font-size: 1.5rem;
        line-height: 1.75;
        letter-spacing: 0.015625rem;
      }

      :host([size='xlarge']) .title,
      :host([size='2xlarge']) .title {
        font-size: 2rem;
        font-weight: 300;
        line-height: 2.25rem;
        letter-spacing: 0.015625rem;
      }

      :host([size='2xlarge']) .title {
        font-size: 2.5rem;
        line-height: 2.5rem;
      }

      :host([bold='true']) .title {
        font-weight: 700;
      }

      @media screen and (min-width: ${this.breakpoint}) {
        .title {
          font-size: 1.25rem;
          line-height: 1.5rem;
        }

        :host([size='xsmall']) .title {
          font-size: 1rem;
          line-height: 1.25rem;
        }

        :host([size='medium']) .title {
          font-size: 1.5rem;
          line-height: 1.75rem;
        }

        :host([size='large']) .title {
          font-size: 2rem;
          font-weight: 300;
          line-height: 2.25rem;
          letter-spacing: 0.015625rem;
        }

        :host([size='xlarge']) .title {
          font-size: 3rem;
          line-height: 3rem;
        }

        :host([size='2xlarge']) .title {
          font-size: 4rem;
          line-height: 4rem;
        }

        :host([bold='true']) .title {
          font-weight: 700;
          letter-spacing: normal;
        }
      }
    `;
  }
}

export default Typography;