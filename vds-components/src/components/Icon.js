import utils from '../imports/utils.js';
import Base from './Base.js';

class Icon extends Base {
  static observedAttributes = [
    ...this.observedAttributes,
    'name',
    'size',
    'type',
  ];

  constructor() {
    super();

    this.props = {
      name: () => this.getAttribute('name') || null,
      size: () => this.getAttribute('size') || null,
      title: () =>
        this.getAttribute('title') ||
        (this._props.name()
          ? `${utils.string.capitalizeFirstLetter(
              this._props.name().replaceAll('-', ' ')
            )} icon`
          : null),
      type: () => this.getAttribute('type') || 'standAlone',
    };

    this.styles = () => css`
      :host {
        --icon-size: 1rem;
      }

      div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: var(--icon-size);
        width: var(--icon-size);
      }

      svg {
        height: var(--icon-size);
        width: var(--icon-size);
      }

      :host([size='medium']) {
        --icon-size: 1.25rem;
      }

      :host([size='large']) div {
        --icon-size: 1.5rem;
      }

      :host([size='xlarge']) div {
        --icon-size: 1.75rem;
      }

      ${!['small', 'medium', 'large', 'xlarge', null].some(
        (iconSize) => iconSize === this.size
      )
        ? css`
            :host([size]) div {
              --icon-size: ${this.size};
            }
          `
        : ''}

      :host([type="inline"]) div {
        --icon-size: 1em;
        display: inline-block;
        position: relative;
        height: 0.8em;
      }

      :host([type='inline']) svg {
        position: absolute;
        bottom: -0.1em;
      }

      ${this.breakpoint
        ? css`
            @media screen and (min-width: ${this.breakpoint}) {
              :host([breakpoint]) {
                --icon-size: 1.25rem;
              }

              :host([size='medium'][breakpoint]) {
                --icon-size: 1.5rem;
              }

              :host([size='large'][breakpoint]) {
                --icon-size: 1.75rem;
              }

              :host([size='xlarge'][breakpoint]) {
                --icon-size: 2rem;
              }
            }
          `
        : ''}
    `;

    const icons = {
      pencil: html` <svg
        width="14"
        height="18"
        viewBox="0 0 14 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          d="M9.86568 0.685059L1.53234 12.6202L0.717529 17.3147L4.87494 15.0091L13.2823 3.07395L9.86568 0.685059ZM4.18975 14.2128L2.11568 15.3702L2.48605 13.0184L8.0416 5.08321L9.75457 6.27765L4.18975 14.2128ZM8.65271 4.23135L10.1157 2.1295L11.8286 3.33321L10.3564 5.4258L8.65271 4.23135Z"
          fill="currentColor"
        />
      </svg>`,
      'down-caret': html` <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          d="M12 17.9555L2 7.95554L2.91111 7.04443L12 16.1333L21.0889 7.04443L22 7.95554L12 17.9555Z"
          fill="currentColor"
        />
      </svg>`,
      'right-arrow': html` <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          d="M13.8956 25.6666L12.8365 24.6168L22.796 14.7421H2.3335V13.2578H22.796L12.8365 3.38312L13.8956 2.33331L25.6668 14L13.8956 25.6666Z"
          fill="currentColor"
        />
      </svg>`,
      'trash-can': html` <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          d="M6.71481 25.6666H21.2981V8.16665H6.71481V25.6666ZM8.16667 9.63146H19.8333V24.2148H8.16667V9.63146ZM16.9167 5.24998V2.33331H11.0833V5.24998H5.25V6.71479H22.75V5.24998H16.9167ZM15.4648 5.24998H12.5481V3.79813H15.4648V5.24998ZM10.6815 21.2981H12.1333V12.5481H10.6815V21.2981ZM15.8667 21.2981H17.3185V12.5481H15.8667V21.2981Z"
          fill="currentColor"
        />
      </svg>`,
      phone: html`
        <svg
          width="15"
          height="24"
          viewBox="0 0 15 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <path
            d="M0 0V24H15V0H0ZM13.5 18.75H1.5V1.5H13.5V18.75ZM1.5 22.5V20.25H6.00001V21.75H9.00002V20.25H13.5V22.5H1.5Z"
            fill="currentColor"
          />
        </svg>
      `,
      'phone-plan': html` <svg
        width="15"
        height="24"
        viewBox="0 0 15 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          d="M0 0V24H15V0H0ZM13.5 18.75H1.5V1.5H13.5V18.75ZM1.5 22.5V20.25H6.00001V21.75H9.00002V20.25H13.5V22.5H1.5Z"
          fill="currentColor"
        />
        <path
          d="M9.74389 12.7133H11.5V6.75H9.74389V12.7133Z"
          fill="currentColor"
        />
        <path
          d="M6.62271 8.24999H8.37881V12.75H6.62271V8.24999Z"
          fill="currentColor"
        />
        <path
          d="M3.5 9.75001H5.25609V12.7133H3.5V9.75001Z"
          fill="currentColor"
        />
      </svg>`,
      'phone-protection': html` <svg
        width="15"
        height="24"
        viewBox="0 0 15 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          fill="currentColor"
          d="M3 6V9.37402C3.07574 10.8026 3.53105 12.1858 4.32031 13.3828C5.10955 14.5799 6.20448 15.5486 7.49316 16.1895C8.78454 15.5471 9.88225 14.5772 10.6738 13.3779C11.4653 12.1786 11.9226 10.7929 12 9.36133V6H3ZM4.5 7.5H10.5V9.31055C10.4354 10.4754 10.0665 11.6029 9.42578 12.5801V12.5811C8.92847 13.3389 8.24737 13.9397 7.49316 14.4375C6.74194 13.9411 6.06365 13.3418 5.56836 12.5859C4.92961 11.6112 4.56316 10.487 4.5 9.3252V7.5ZM0 0V24H15V0H0ZM1.5 1.5H13.5V18.75H1.5V1.5ZM1.5 20.25H6V21.75H9V20.25H13.5V22.5H1.5V20.25Z"
        />
      </svg>`,
      info: html` <svg
        width="16"
        height="16"
        aria-hidden="false"
        aria-label="info icon"
        viewBox="0 0 21.6 21.6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          fill="currentColor"
          d="M19.8,10.8a9,9,0,1,0-9,9A9.01054,9.01054,0,0,0,19.8,10.8Zm-1.12488,0A7.87513,7.87513,0,1,1,10.8,2.92486,7.88411,7.88411,0,0,1,18.67509,10.8ZM11.625,7.45852H9.95v-1.675h1.675ZM9.95834,9.11662H11.65v6.6999H9.95834Z"
        />
      </svg>`,
      close: html` <svg
        width="16"
        height="16"
        viewBox="0 0 21.6 21.6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <path
          fill="currentColor"
          d="M11.59,10.8l7.11,7.1-.8.8-7.1-7.11L3.7,18.7l-.8-.8L10,10.8,2.9,3.7l.8-.8L10.8,10,17.9,2.9l.8.8Z"
        ></path>
      </svg>`,
    };

    this.template = () => html` <div>
      ${this.name ? icons[this.name] : ''}
      <slot></slot>
    </div>`;
  }
}

export default Icon;
