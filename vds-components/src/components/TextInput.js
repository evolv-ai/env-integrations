import vds from '../imports/vds.js';
import Base from './Base.js';

class TextInput extends Base {
  static observedAttributes = [...this.observedAttributes, 'error-event'];

  constructor() {
    super();
    this.props = {
      disabled: () =>
        this.getAttribute('disabled') === '' ||
        this.getAttribute('disabled') === 'true',
      error: () =>
        this.getAttribute('error') === '' ||
        this.getAttribute('error') === 'true',
      errorEvent: () => this.getAttribute('error-event') || 'blur',
      errorText: () => this.getAttribute('error-text') || '',
      inputId: () =>
        this.getAttribute('input-id') ||
        `evolv-text-input-${vds.textInputIndex}`,
      helperText: () => this.getAttribute('helper-text') || '',
      helperTextPlacement: () =>
        this.getAttribute('helper-text-placement') || 'bottom',
      label: () => this.getAttribute('label') || '',
      name: () => this.getAttribute('name') || this.props.inputId(),
      minLength: () => this.getAttribute('min-length') || null,
      maxLength: () => this.getAttribute('max-length') || null,
      required: () =>
        this.getAttribute('success') === '' ||
        this.getAttribute('success') === 'true',
      success: () =>
        this.getAttribute('success') === '' ||
        this.getAttribute('success') === 'true',
      successText: () => this.getAttribute('success-text') || '',
      transparentBackground: () =>
        this.getAttribute('transparent-background') || false,
      width: () => this.getAttribute('width') || 'auto',
    };

    this.styles = () => css`
      :host {
        display: inline-block;
        width: ${this.width};
        --color-elements: ${vds.color.elements['primary-light']};
        --color-background: ${this.transparentBackground
          ? 'transparent'
          : vds.color.formControls['background-light']};
        --color-border: ${vds.color.formControls['border-light']};
        --color-border-hover: ${vds.color.formControls['border-hover-light']};
      }

      :host-context([surface='dark']) {
        --color-elements: ${vds.color.elements['primary-dark']};
        --color-background: ${this.transparentBackground
          ? 'transparent'
          : vds.color.formControls['background-dark']};
        --color-border: ${vds.color.formControls['border-dark']};
        --color-border-hover: ${vds.color.formControls['border-hover-dark']};
      }

      label {
        margin-bottom: 0.25rem;
      }

      input {
        position: relative;
        ${vds.style.text.body.large()}
        width: 100%;
        min-width: 2.5rem;
        height: 2.75rem;
        background-color: ${this.transparentBackground
          ? 'transparent'
          : 'var(--color-background)'};
        padding: 0.6875rem;
        border: 0.0625rem solid var(--color-border);
        border-radius: 4px;
        outline: none;
      }

      input:hover {
        border-color: var(--color-border-hover);
      }

      :host([error]) input {
        background-color: var(--color-error-light);
        border-color: var(--color-error);
      }

      :host([error]):not(:hover) input::after {
        content: '';
        position: absolute;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.6 21.6"><path d="M10.80213,19.80122a2.39567,2.39567,0,0,1-1.705-.707L2.50743,12.50444a2.41244,2.41244,0,0,1,0-3.40913L9.09808,2.50555a2.4159,2.4159,0,0,1,3.40908-.001l6.58967,6.59073a2.41244,2.41244,0,0,1,0,3.40913L12.50716,19.0942A2.394,2.394,0,0,1,10.80213,19.80122Zm-7.4998-9.911a1.289,1.289,0,0,0,0,1.81931L9.893,18.29929a1.31476,1.31476,0,0,0,1.81928,0l6.58967-6.58976a1.289,1.289,0,0,0,0-1.81931L11.71226,3.30047a1.29076,1.29076,0,0,0-1.81928,0ZM9.95,15.05h1.7V13.367H9.95Zm0-6.00953.561,2.635h.56952l.56951-2.635V6.55H9.95Z"></path></svg>');
      }

      input:focus-visible {
        outline: var(--outline-focus);
        outline-offset: var(--outline-offset-focus);
      }
    `;

    this.template = () => html`
      <div class="text-input">
        ${this.label
          ? html` <label for="${this.inputId}"
              ><evolv-body size="small">${this.label}</evolv-body></label
            >`
          : ''}
        <input
          id="${this.inputId}"
          name="${this.name}"
          type="text"
          ${this.minLength && `minlength="${this.minLength}"`}
          ${this.maxLength && `maxlength="${this.maxLength}"`}
          ${this.required && 'required'}
          ${this.disabled && 'disabled'}
        />
        ${this.helperText &&
        this.helperTextPlacement === 'bottom' &&
        html`
          <evolv-body
            size="small"
            color="gray-44"
            class="helper-text"
            line-height="1"
            style="margin-top: 0.5rem;"
          >
            ${this.helperText}
          </evolv-body>
        `}
      </div>
    `;
  }
}

export default TextInput;
