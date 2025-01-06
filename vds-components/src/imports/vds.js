import utils from './utils.js';

window.evolv.vds ??= {};
const { vds } = window.evolv;

vds.accordionIndex = 0;
vds.accordions = [];
vds.tooltipIndex = 0;
vds.modalIndex = 0;
vds.breakpoint = null;
vds.windowWidthObserver = null;

vds.colorTokens = {
  'gray-11': '#1b1d1f',
  'gray-20': '#333333',
  'gray-44': '#6f7171',
  'gray-65': '#a7a7a7',
  'gray-85': '#d8dada',
  'gray-95': '#f6f6f6',
  red: '#ee0000',
};

vds.handleNamedColor = (color) => {
  if (!color) {
    return null;
  }

  return Object.keys(vds.colorTokens).some((colorToken) => colorToken === color)
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
        vds.getUtilityClass(property, utilityClasses[property])
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

vds.isScrollable = (element) =>
  element?.scrollHeight > element?.offsetHeight || false;

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
      document.body
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
