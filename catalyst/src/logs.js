function initializeLogs(sandbox) {
    // Uses console.info() because VBG blocks console.log();

    const localStorageItem = localStorage.getItem('evolv:catalyst-logs');
    const localStorageMatch = localStorageItem
        ? localStorageItem.match(/normal|debug/i)
        : null;
    const localStorageLogs = localStorageMatch ? localStorageMatch[0] : null;

    sandbox.logs = localStorageLogs || 'silent';

    const logPrefix = [
        `%c[evolv-${sandbox.name}]`,
        'background-color: rgba(255, 122, 65, .5); border: 1px solid rgba(255, 122, 65, 1); border-radius: 2px',
    ];
    const debugPrefix = [
        `%c[evolv-${sandbox.name}]`,
        'background-color: rgba(255, 122, 65, .25); border: 1px solid rgba(255, 122, 65, .5); border-radius: 2px',
    ];

    sandbox.log = (...args) => {
        const logs = sandbox.logs;
        if (logs === 'normal' || logs === 'debug') {
            console.info(...logPrefix, ...args);
        }
    };
    sandbox.warn = (...args) => {
        const logs = sandbox.logs;
        if (logs === 'normal' || logs === 'debug') {
            console.warn(...logPrefix, ...args);
        }
    };
    sandbox.debug = (...args) => {
        if (sandbox.logs === 'debug') {
            console.info(...debugPrefix, ...args);
        }
    };
}

export { initializeLogs };
