import init from './imports/init.js';

export default () => {
  if (window.evolv?.utils) {
    init();
  } else {
    document.documentElement.addEventListener('evolvutilsinit', init);
  }
}

