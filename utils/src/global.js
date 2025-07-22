/* eslint-disable import/prefer-default-export */
/***
 * Generates a unique id
 */
export const UID = () =>
  (
    Math.random().toString(36).slice(2, 6) + Date.now().toString(36).slice(4, 8)
  ).toUpperCase();
