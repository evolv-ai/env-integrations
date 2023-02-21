/* eslint-disable no-bitwise */
function hash(string) {
  let hashValue = 0;
  const increment = Math.trunc(string.length / 512) || 1;

  for (let i = 0; i < string.length; i += increment) {
    const chr = string.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + chr;
  }

  hashValue &= 0xffff;

  return hashValue;
}

function initializeWhenContext(sandbox) {
  const { debug, warn } = sandbox;

  return (state) => {
    let queueName;

    if (!(state === 'active' || state === undefined || state === 'inactive')) {
      return {
        then: () => {
          warn(
            `whenContext: unknown state, requires 'active' or 'inactive', default is 'active'`,
          );
        },
      };
    }

    if (state === 'active' || undefined) {
      queueName = 'onActivate';
    } else {
      queueName = 'onDeactivate';
    }

    return {
      then: (callback) => {
        const newEntry = () => {
          debug(
            `whenContext: fire on ${
              state === 'inactive' ? 'deactivate' : 'activate'
            }`,
            callback,
          );
          callback();
        };

        newEntry.hash = hash(callback.toString());

        // Dedupe callbacks
        if (
          sandbox._evolvContext[queueName].findIndex(
            (entry) => entry.hash === newEntry.hash,
          ) !== -1
        ) {
          debug(
            `whenContext: duplicate callback not assigned to '${state}' state`,
            callback,
          );
          return;
        }

        debug(
          `whenContext: queue callback for '${state}' state, current state: '${sandbox._evolvContext.state}'`,
          callback,
        );
        sandbox._evolvContext[queueName].push(newEntry);
        if (state === 'active' && sandbox._evolvContext.state === 'active') {
          newEntry();
        } else if (
          state === 'inactive' &&
          sandbox._evolvContext.state === 'inactive'
        ) {
          newEntry();
        }
      },
    };
  };
}

function initializeWhenMutate(sandbox) {
  const { debug } = sandbox;
  /* eslint-disable-next-line */
  return () => {
    return {
      then: (callback) => {
        const newEntry = () => {
          debug(`whenMutate: fire on mutate`, callback);
          callback();
        };

        newEntry.hash = hash(callback.toString());

        // Dedupe callbacks
        if (
          sandbox.instrument._onMutate.findIndex(
            (entry) => entry.hash === newEntry.hash,
          ) !== -1
        ) {
          debug(
            `whenMutate: duplicate callback not assigned to on-mutate queue`,
            callback,
          );
          return;
        }

        debug('whenMutate: add callback to on-mutate queue', callback);
        sandbox.instrument._onMutate.push(newEntry);
      },
    };
  };
}

function initializeWhenItem(sandbox) {
  const { debug, warn } = sandbox;

  return (key, options) => {
    const item = sandbox.instrument.queue[key];
    const logPrefix =
      options && options.logPrefix ? options.logPrefix : 'whenItem';

    if (!item) {
      warn(`${logPrefix}: instrument item '${key}' not defined`);
      return {
        then: () => null,
      };
    }

    const thenFunc = (callback, isInBulk) => {
      debug(`${logPrefix}: '${key}' add on-connect callback`, {
        callback,
      });

      let newEntry;
      const index = item.onConnect.length + item.onDisconnect.length + 1;

      if (!isInBulk) {
        newEntry = () => {
          const enode =
            item.type === 'single' ? item.enode.first() : item.enode;

          debug(`${logPrefix}: '${key}'`, `fire on on connect:`, callback);

          enode
            .markOnce(`evolv-${key}-${index}`)
            .each((enodeItem) => callback(enodeItem));
        };
      } else {
        newEntry = () => {
          const enode =
            item.type === 'single' ? item.enode.first() : item.enode;

          debug(`${logPrefix}: '${key}'`, `fire in bulk on connect:`, callback);

          callback(enode.markOnce(`evolv-${key}-${index}`));
        };
      }

      newEntry.hash =
        options && options.hash ? options.hash : hash(callback.toString());

      if (
        item.onConnect.findIndex((entry) => entry.hash === newEntry.hash) !== -1
      ) {
        debug(
          `${logPrefix}: duplicate on-connect callback not assigned to item '${key}':`,
          callback,
        );
        return;
      }

      item.onConnect.push(newEntry);

      if (sandbox.instrument.queue[key].enode.isConnected()) newEntry();
    };

    function thenInBulkFunc(callback) {
      thenFunc(callback, true);
    }

    return {
      then: thenFunc,
      thenInBulk: thenInBulkFunc,
      // Deprecated
      reactivateOnChange: () => {},
    };
  };
}

function initializeWhenRemove(sandbox) {
  const { debug, warn } = sandbox;

  return (key) => {
    const item = sandbox.instrument.queue[key];

    if (!item) {
      warn(`whenRemove: instrument item '${key}' not defined`);
      return {
        then: () => null,
      };
    }

    return {
      then: (callback) => {
        debug(`whenRemove: '${key}' add on-disconnect callback`, {
          callback,
        });

        const index = item.onConnect.length + item.onDisconnect.length + 1;

        const newEntry = () => {
          const enode =
            item.type === 'single' ? item.enode.first() : item.enode;

          debug(`whenRemove: '${key}'`, `fire on disconnect:`, callback);

          let disconnectedItems = 0;
          enode.each((enodeItem) => {
            if (enodeItem.el[0]?.isConnected) return;
            enodeItem.markOnce(`evolv-${key}-${index}`);
            callback(enodeItem);
            disconnectedItems += 1;
          });
          if (!disconnectedItems) callback();
        };

        newEntry.hash = hash(callback.toString());

        if (
          item.onDisconnect.findIndex(
            (entry) => entry.hash === newEntry.hash,
          ) !== -1
        ) {
          debug(
            `whenRemove: duplicate on-disconnect callback not assigned to item '${key}':`,
            callback,
          );
          return;
        }

        item.onDisconnect.push(newEntry);
      },
    };
  };
}

function initializeWhenChange(sandbox) {
  const { debug, warn } = sandbox;
  /* eslint-disable-next-line */
  return (key) => {
    const item = sandbox.instrument.queue[key];
    if (!item) {
      warn(`whenChange: '${key}' not found in instrument queue`);
      return { then: () => {} };
    }

    return {
      then: (callback) => {
        const newEntry = (enode) => {
          debug(`whenChange: '${key}'`, `fire on change:`, callback);
          callback(enode);
        };
        newEntry.hash = hash(callback.toString());

        // Dedupe callbacks
        if (
          item.onChange.findIndex((entry) => entry.hash === newEntry.hash) !==
          -1
        ) {
          debug(
            `whenChange: duplicate callback not assigned to on-change queue`,
            callback,
          );
          return;
        }

        debug('whenChange: add callback to on-change queue', callback);
        item.onChange.push(newEntry);
        item.enode.el.forEach((node, index) => {
          item.html[index] = node.outerHTML;
        });
      },
    };
  };
}

function initializeWhenDOM(sandbox) {
  const counts = {};
  const history = [];
  const { $, debug, warn } = sandbox;

  const whenDOM = (select, options = {}) => {
    const logPrefix = options.logPrefix ?? 'whenDOM';
    const keyPrefix = options.keyPrefix ?? 'when-dom-';
    const type = options.type ?? 'multi';
    let selectFunc;
    let key;
    let foundPrevious;
    const previous = history.find((item) => item.select === select);
    const whenItemOptions = { logPrefix };
    if (options && options.hash) whenItemOptions.hash = options.hash;

    if (previous && keyPrefix === previous.keyPrefix) {
      selectFunc = previous.selectFunc;
      key = previous.key;
      debug(`${logPrefix}: selector '${select}' found in item '${key}'`);
      foundPrevious = true;
    } else {
      // Increment keys with different prefixes separately;
      if (!counts[keyPrefix]) counts[keyPrefix] = 1;

      // Accept string or enode
      if (typeof select === 'string') selectFunc = () => $(select);
      else if (select.constructor.name === 'ENode') selectFunc = () => select;
      else {
        warn(
          `${logPrefix}: unrecognized input ${select}, requires string or enode`,
        );
        return {
          then: () => null,
        };
      }

      counts[keyPrefix] += 1;
      key = `${keyPrefix}${counts[keyPrefix]}`;

      history.push({
        select,
        selectFunc,
        keyPrefix,
        key,
      });
    }

    return {
      then: (callback) => {
        if (!foundPrevious)
          sandbox.instrument.add(key, selectFunc, {
            asClass: null,
            type,
          });
        sandbox.whenItem(key, whenItemOptions).then(callback);
      },
      thenInBulk: (callback) => {
        if (!foundPrevious)
          sandbox.instrument.add(key, selectFunc, {
            asClass: null,
            type,
          });
        sandbox.whenItem(key, whenItemOptions).thenInBulk(callback);
      },
      // Deprecated
      reactivateOnChange: () => {},
    };
  };

  whenDOM.counts = counts;
  whenDOM.history = history;
  whenDOM.reset = function reset() {
    debug('whenDOM: reset selector history');
    Object.keys(this.counts).forEach((key) => delete this.counts[key]);
    this.history.length = 0;
  };

  return whenDOM;
}

function initializeWhenElement(sandbox) {
  /* eslint-disable-next-line */
  return (select) => {
    return {
      then: (callback) => {
        sandbox
          .whenDOM(select, {
            keyPrefix: 'when-element-',
            logPrefix: 'whenElement',
            type: 'single',
            hash: hash(callback.toString()),
          })
          .then((enode) => callback(enode.el[0]));
      },
    };
  };
}

function initializeWhenElements(sandbox) {
  /* eslint-disable-next-line */
  return (select) => {
    return {
      then: (callback) => {
        sandbox
          .whenDOM(select, {
            keyPrefix: 'when-elements-',
            logPrefix: 'whenElements',
            hash: hash(callback.toString()),
          })
          .then((enode) => callback(enode.el[0]));
      },
    };
  };
}

function initializeWaitUntil(sandbox) {
  const { debug, warn } = sandbox;

  return (condition, timeout) => {
    if (typeof condition !== 'function') {
      warn(
        'waitUntil: requires callback function that evaluates to true or false, input invalid',
        condition,
      );
    }
    debug('waitUntil: add callback to interval poll queue', {
      condition,
      timeout,
    });
    return {
      then: (callback) => {
        const { queue } = sandbox._intervalPoll;

        const newEntry = {
          condition,
          callback: () => callback(condition()),
          timeout: timeout || null,
          startTime: performance.now(),
          hash: hash(condition.toString() + callback.toString()),
        };

        if (queue.some((entry) => entry.hash === newEntry.hash)) {
          debug(
            `waitUntil: duplicate callback not added to interval poll queue`,
            callback,
          );
          return;
        }
        queue.push(newEntry);
        window.evolv.catalyst._intervalPoll.startPolling();
      },
    };
  };
}

export {
  initializeWhenContext,
  initializeWhenMutate,
  initializeWhenDOM,
  initializeWhenItem,
  initializeWhenRemove,
  initializeWhenChange,
  initializeWhenElement,
  initializeWhenElements,
  initializeWaitUntil,
};
