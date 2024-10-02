function initializeLogs(sandbox) {
  // Uses console.info() because VBG blocks console.log();

  const localStorageItem = localStorage.getItem('evolv:catalyst-logs');
  const localStorageMatch = localStorageItem
    ? localStorageItem.match(/normal|debug/i)
    : null;
  const localStorageLogs = localStorageMatch ? localStorageMatch[0] : null;
  const logLevel = localStorageLogs || 'silent';

  const logPrefix = [
    `%c[evolv-${sandbox.name}]`,
    'background-color: rgba(255, 122, 65, .5); border: 1px solid rgba(255, 122, 65, 1); border-radius: 2px',
  ];
  const debugPrefix = [
    `%c[evolv-${sandbox.name}]`,
    'background-color: rgba(255, 122, 65, .25); border: 1px solid rgba(255, 122, 65, .5); border-radius: 2px',
  ];

  return {
    logLevel,
    log: (...args) => {
      if (logLevel === 'normal' || logLevel === 'debug') {
        console.info(...logPrefix, ...args);
      }
    },
    warn: (...args) => {
      if (logLevel === 'normal' || logLevel === 'debug') {
        console.warn(...logPrefix, ...args);
      }
    },
    debug: (...args) => {
      if (logLevel === 'debug') {
        console.info(...debugPrefix, ...args);
      }
    },
  };
}

export default initializeLogs;
