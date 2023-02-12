function initializeInstrument(sandbox) {
  const { debug, warn } = sandbox;
  const $ = sandbox.select;
  let isProcessing = false;
  let processCount = 0;
  let didItemChange = false;

  const instrument = {};
  instrument.queue = {};
  instrument._onMutate = [];

  function debounce(func, timeout = 17) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  function processQueueItem(key) {
    const item = instrument.queue[key];
    const { enode, className, type } = item;
    let newEnode;

    if (type === 'single') {
      newEnode = enode.isConnected() ? enode : item.select();
    } else {
      newEnode = item.select();
    }

    const wasConnected = item.state === 'connected';
    const isConnected = newEnode.isConnected();
    const hasClass =
      newEnode.hasClass(className) || (newEnode.exists() && className === null);

    if (
      (!wasConnected && isConnected) ||
      (isConnected && !hasClass) ||
      (type !== 'single' &&
        isConnected &&
        className === null &&
        !enode.isEqualTo(newEnode))
    ) {
      item.enode = newEnode;
      if (className) item.enode.addClass(className);
      item.state = 'connected';
      debug('process instrument: connect', `'${key}'`, item);
      item.onConnect.forEach((callback) => callback());
      didItemChange = true;
    } else if (wasConnected && !isConnected) {
      item.enode = newEnode;
      item.state = 'disconnected';
      debug('process instrument: disconnect', `'${key}'`, item);
      item.onDisconnect.forEach((callback) => callback());
      didItemChange = true;
    }
  }

  instrument.processQueue = () => {
    if (isProcessing) return;

    isProcessing = true;
    processCount += 1;
    didItemChange = false;
    const then = performance.now();

    Object.keys(instrument.queue).forEach((key) => processQueueItem(key));

    debug(
      'process instrument: complete',
      `${(performance.now() - then).toFixed(2)}ms`,
      processCount,
    );

    isProcessing = false;

    // Covers scenario where mutations are missed during long process
    if (didItemChange) {
      debug('process instrument: item changed, reprocessing');
      instrument.processQueue();
    }

    instrument._onMutate.forEach((callback) => callback());
  };

  instrument.debouncedProcessQueue = debounce(() => {
    instrument.processQueue();
  });

  function addItem(key, select, options = {}) {
    if (typeof key !== 'string' && typeof select !== 'function') {
      warn(
        `add instrument: requires item key string and select function, input invalid:`,
        { key, select, options },
      );
      return;
    }

    debug('add instrument:', key, select, options);

    const item = {
      select,
      onConnect: options.onConnect ? options.onConnect : [],
      onDisconnect: options.onDisconnect ? options.onDisconnect : [],
      type: options.type === 'single' ? 'single' : 'multi',
      enode: $(),
      state: 'disconnected',
    };

    if (Object.prototype.hasOwnProperty.call(options, 'asClass'))
      item.className = options.asClass ? `evolv-${options.asClass}` : null;
    else item.className = `evolv-${key}`;

    instrument.queue[key] = item;
  }

  instrument.add = (key, select, options) => {
    if (Array.isArray(key)) {
      key.forEach((item) => {
        addItem(...item);
      });
    } else {
      addItem(key, select, options);
    }

    instrument.processQueue();
  };

  instrument.remove = (key) => {
    debug('remove instrument:', key);
    const { queue } = instrument;
    const item = queue[key];
    if (!item) {
      warn(`remove instrument: instrument key '${key}' not found`);
      return;
    }
    item.enode.removeClass(item.className);
    delete queue[key];
  };

  instrument.removeClass = (key) => {
    debug('remove instrument class:', key);
    const { queue } = instrument;
    const item = queue[key];
    if (!item) {
      warn(`remove instrument class: instrument key '${key}' not found`);
      return;
    }
    item.enode.removeClass(item.className);
    item.className = null;
  };

  instrument.deinstrument = () => {
    debug('deinstrument: removing classes and clearing queues');
    Object.keys(instrument.queue).forEach((key) => {
      instrument.removeClass(key);
    });
    instrument._onMutate = [];
    sandbox.whenDOM.reset();
  };

  return instrument;
}

function initializeSelectInstrument(sandbox) {
  const $ = sandbox.select;

  return (key) => {
    const item = sandbox.instrument.queue[key];

    if (!item) {
      sandbox.warn(`select instrument: '${key}' not found in instrument queue`);
      return $();
    }

    if (item.state === 'disconnected') {
      return $();
    }

    return item.type === 'single' ? item.enode.first() : item.enode;
  };
}

export { initializeInstrument, initializeSelectInstrument };
