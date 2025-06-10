import utils from './utils.js';

window.evolv.vds ??= {};
const { vds } = window.evolv;

vds.accordionIndex = 0;
vds.accordions = [];
vds.carouselIndex = 0;
vds.textInputIndex = 0;
vds.tooltipIndex = 0;
vds.modalIndex = 0;
vds.breakpoint = null;
vds.windowWidthObserver = null;

vds.color = {};

vds.color.palette = {
  red: '#ee0000',
  black: '#000000',
  white: '#ffffff',
  'gray-11': '#1b1d1f',
  'gray-20': '#333333',
  'gray-44': '#6f7171',
  'gray-65': '#a7a7a7',
  'gray-85': '#d8dada',
  'gray-95': '#f6f6f6',
  'orange-17': '#561701',
  'orange-41': '#b95319',
  'orange-58': '#ff8027',
  'orange-94': '#ffece0',
  'yellow-15': '#4b3f04',
  'yellow-53': '#fed60e',
  'yellow-94': '#fff9de',
  'blue-15': '#002c4d',
  'blue-38': '#0077b4',
  'blue-46': '#0089ec',
  'blue-94': '#e3f2fd',
  'green-10': '#003514',
  'green-26': '#008331',
  'green-36': '#00b845',
  'green-91': '#dcf5e6',
};

vds.color.background = {
  'primary-light': vds.color.palette['white'],
  'primary-dark': vds.color.palette['black'],
  'secondary-light': vds.color.palette['gray-95'],
  'secondary-dark': vds.color.palette['gray-11'],
  'brandhighlight-light': vds.color.palette['red'],
  'brandhighlight-dark': vds.color.palette['red'],
}

vds.color.elements = {
  'primary-light': vds.color.palette['black'],
  'primary-dark': vds.color.palette['white'],
  'secondary-light': vds.color.palette['gray-44'],
  'secondary-dark': vds.color.palette['gray-65'],
  'low-contrast-light': vds.color.palette['gray-85'],
  'low-contrast-dark': vds.color.palette['gray-20'],
}

vds.color.feedback = {
  'error-light': vds.color.palette['orange-41'],
  'error-background-light': vds.color.palette['orange-94'],
  'error-dark': vds.color.palette['orange-58'],
  'error-background-dark': vds.color.palette['orange-17'],
  'warning-light': vds.color.palette['yellow-53'],
  'warning-background-light': vds.color.palette['yellow-94'],
  'warning-dark': vds.color.palette['yellow-53'],
  'warning-background-dark': vds.color.palette['yellow-15'],
  'information-light': vds.color.palette['blue-38'],
  'information-background-light': vds.color.palette['blue-94'],
  'information-dark': vds.color.palette['blue-46'],
  'information-background-dark': vds.color.palette['blue-15'],
  'success-light': vds.color.palette['green-36'],
  'success-background-light': vds.color.palette['green-91'],
  'success-dark': vds.color.palette['green-26'],
  'success-background-dark': vds.color.palette['green-10'],
};

vds.color.formControls = {
  'background-light': vds.color.palette['white'],
  'background-dark': vds.color.palette['black'],
  'border-light': vds.color.palette['gray-44'],
  'border-dark': vds.color.palette['gray-65'],
  'border-hover-light': vds.color.palette['black'],
  'border-hover-dark': vds.color.palette['white'],
  'border-readonly-light': vds.color.palette['gray-85'],
  'border-readonly-dark': vds.color.palette['gray-20'],
};

vds.handleNamedColor = (color) => {
  if (!color) {
    return null;
  }

  return Object.keys(vds.color.palette).some(
    (colorSwatch) => colorSwatch === color,
  )
    ? `var(--color-${color})`
    : color;
};

vds.style = {};

vds.style.text = {
  body: {
    micro: () => mixin`
      font-family: var(--font-family-etx);
      font-size: 0.6875rem;
      font-weight: 400;
      line-height: 1rem;
      margin: 0;`,
    small: () => mixin`
      font-family: var(--font-family-etx);
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 400;
      margin: 0;`,
    medium: () => mixin`
      font-family: var(--font-family-eds);
      font-weight: 400;
      font-size: 0.875rem;
      line-height: 1.125rem;
      letter-spacing: 0.03125rem;
      margin: 0;`,
    large: () => mixin`
      font-family: var(--font-family-eds);
      font-size: 1rem;
      line-height: 1.25rem;
      font-weight: 400;
      letter-spacing: 0.03125rem;
      margin: 0;`,
  },
};

vds.getUtilityClass = (property, value, important = true) => css`
  .evolv-${property}-${value} {
    ${property}: ${value} ${important ? '!important' : ''};
  }
`;

vds.style.document = () => {
  const utilityClasses = {
    display: 'none',
  };

  return css`
    ${Object.keys(utilityClasses)
      .map((property) =>
        vds.getUtilityClass(property, utilityClasses[property]),
      )
      .join('')}

    .evolv-disable-scroll {
      position: fixed !important;
      top: var(--evolv-scroll-top, 0px);
      width: var(--evolv-window-width, auto);
    }

    .evolv-tooltip-present {
      position: relative;
    }
  `;
};

vds.keyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  SHIFT: 16,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
};

vds.focusable =
  'evolv-button, evolv-button-icon, evolv-text-link, button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)';

vds.isScrollable = (element, orientation = 'vertical') => {
  if (!element) {
    return false;
  }
  const { offsetHeight, offsetWidth, scrollHeight, scrollWidth } = element;
  const offsetLength =
    orientation === 'horizontal' ? offsetWidth : offsetHeight;
  const scrollLength =
    orientation === 'horizontal' ? scrollWidth : scrollHeight;
  return scrollLength > offsetLength;
};

vds.keyScrolling = (event, element) => {
  const { keyCode } = vds;
  const { scrollTop, offsetHeight, scrollHeight } = element;

  const key = event.which;
  let scrollTopNew = null;

  switch (key) {
    case keyCode['UP']:
      scrollTopNew = scrollTop - 40;
      break;
    case keyCode['DOWN']: // Down
      scrollTopNew = scrollTop + 40;
      break;
    case keyCode['PAGE_UP']: // Pageup
      scrollTopNew = scrollTop - Math.round(0.9 * offsetHeight);
      break;
    case keyCode['PAGE_DOWN']: // Pagedown
      scrollTopNew = scrollTop + Math.round(0.9 * offsetHeight);
      break;
    case keyCode['HOME']: // Home
      scrollTopNew = 0;
      break;
    case keyCode['END']: // End
      scrollTopNew = scrollHeight;
      break;
    default:
      break;
  }

  return scrollTopNew;
};

vds.disableBodyScroll = () => {
  const { body } = document;
  const className = 'evolv-disable-scroll';
  utils.observeWindowWidth();
  if (!body.classList.contains(className)) {
    utils.updateProperty(
      '--evolv-scroll-top',
      `-${Math.round(window.scrollY)}px`,
      document.body,
    );
    body.classList.add(className);
  }
};

vds.enableBodyScroll = () => {
  const { body } = document;
  utils.removeClass(body, 'evolv-disable-scroll', true);
  const scrollY =
    -1 * parseInt(body.style.getPropertyValue('--evolv-scroll-top')) || 0;
  window.scrollTo(0, scrollY);
  utils.windowWidthObserver.disconnect();
  body.style.removeProperty('--evolv-scroll-top');
  body.style.removeProperty('--evolv-window-width');
};

export default vds;
