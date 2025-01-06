import vds from '../imports/vds.js';
import Base from './Base.js';

class TextLink extends Base {
  static observedAttributes = [...this.observedAttributes, 'href', 'size', 'type'];

  constructor() {
    super();

    this.props = {
      href: () => this.getAttribute('href') || null,
      size: () => this.getAttribute('size') || 'large',
      type: () => this.getAttribute('type') || 'inline',
    };

    this.styles = () => css`
      .text-link:focus-within {
        outline: var(--outline-focus);
        outline-offset: var(--outline-offset-focus);
        border-radius: 2px;
      }

      a {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
        border-bottom-width: 0.0625rem;
        border-bottom-style: solid;
        cursor: pointer;
        position: relative;
        text-decoration: none;
        touch-action: manipulation;
        transition: opacity 0.15s ease-in 0s;
        pointer-events: auto;
        -webkit-tap-highlight-color: transparent;
        outline: none;
        border-color: currentColor;
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

    this.template = () => html` <span class="text-link">
      <a ${this.href ? `href="${this.href}"` : ''} tabindex="0">
        <span class="hit-area"></span>
        <span class="text">
          <slot></slot>
        </span>
      </a>
    </span>`;
  }
}

export default TextLink;