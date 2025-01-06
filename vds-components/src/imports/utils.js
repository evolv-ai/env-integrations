const utils = window.evolv.utils.init('vds-components');

/**
 * Returns the result of invoking a function if the input is a function,
 * or simply returns the input value if it's not a function.
 *
 * @param {*} variable - The value or function to check.
 * @returns {*} If the input is a function, its return value is returned; otherwise, the input itself is returned.
 */
utils.functionOrValue = (variable) => {
  if (typeof variable === 'function') {
    return variable();
  }

  return variable;
};

utils.functionOrSelector = (variable, container = document.body) => {
  if (typeof variable === 'function') {
    return variable();
  }

  return container.querySelector(variable);
}

export default utils;