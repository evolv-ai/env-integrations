import { version } from '../package.json';

export const VERSION = version;

/***
 * Generates a unique id
 */
export const UID = () =>
  (
    Math.random().toString(36).slice(2, 6) + Date.now().toString(36).slice(4, 8)
  ).toUpperCase();


/**
 * Creates a selector string from an element, friendlier for logging and error messages
 * @param {Element} element
 * @returns {string}
 * @example
 * const element = document.querySelector('main#main.container.mobile-view');
 * console.log(deriveSelector(element)); // "main#main.container.mobile-view";
 */
export function deriveSelector(element) {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className
    ? `.${element.className.trim().replaceAll(/\s+/g, '.')}`
    : '';

  return `${tag}${id}${classes}`;
}
