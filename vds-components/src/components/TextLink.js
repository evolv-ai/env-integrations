import vds from '../imports/vds.js';
import Base from './Base.js';

class TextLink extends Base {
  static observedAttributes = [...this.observedAttributes, 'href', 'size', 'type', 'primitive'];

  constructor() {
    super();

    this.props = {
      href: () => this.getAttribute('href') || null,
      size: () => this.getAttribute('size') || 'large',
      primitive: () => this.getAttribute('primitive') || 'a',
      type: () => this.getAttribute('type') || 'inline',
    };

    this.styles = () => css`
      .text-link-wrap:focus-within {
        outline: var(--outline-focus);
        outline-offset: var(--outline-offset-focus);
        border-radius: 2px;
      }

      .text-link {
        display: inline;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
        border-top: none;
        border-right: none;
        border-left: none;
        border-bottom: 0.0625rem solid currentColor;
        cursor: pointer;
        position: relative;
        text-decoration: none;
        text-align: left;
        touch-action: manipulation;
        transition: opacity 0.15s ease-in 0s;
        pointer-events: auto;
        -webkit-tap-highlight-color: transparent;
        background: none;
        outline: none;
        padding: 0;
      }

      :host([type='standAlone']) {
        display: block;
      }

      :host([type='standAlone']) a,
      :host([type='standAlone'][size='small']) a {
        ${vds.style.text.body.small()}
      }

      :host([type='standAlone'][size='large']) a {
        ${vds.style.text.body.large()}
      }

      a:active {
        color: var(--color-gray-44);
        border-bottom: 1px solid var(--color-gray-44);
        box-shadow: var(--color-gray-44) 0px 1px;
      }

      a:hover {
        box-shadow: currentColor 0px 1px;
      }

      .hit-area {
        box-sizing: content-box;
        cursor: pointer;
        display: inline;
        height: 2.75rem;
        left: 50%;
        outline: none;
        position: absolute;
        text-align: center;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
      }

      .text {
        position: relative;
      }

      @media screen and (min-width: ${this.breakpoint}) {
        :host([type='standAlone']) a,
        :host([type='standAlone'][size='small']) a {
          ${vds.style.text.body.large()}
        }
      }
    `;

    this.template = () => html`
      <span class="text-link-wrap">
        <${this.primitive} class="text-link" ${this.href ? `href="${this.href}"` : ''} tabindex="0">
          <span class="hit-area"></span>
          <span class="text">
            <slot></slot>
          </span>
        </${this.primitive}>
      </span>`;

    this.onConnect = () => {
      this.addEventListener('keydown', this.onKeydown);
    }
  }

  onKeydown(e) {
    const { code } = e;
    if (code === 'Enter' || code === 'Space') {
      this.click();
    }
  }
}

export default TextLink;