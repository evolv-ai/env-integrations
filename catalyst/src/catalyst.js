import initializeSandbox from './sandbox.js';
import { initializeIntervalPoll } from './interval-poll.js';

function initializeCatalyst() {
  const catalyst = initializeSandbox('catalyst');
  const { debug } = catalyst;

  catalyst.sandboxes = [];

  // Creates proxy for window.evolv.catalyst that adds a new sandbox whenever
  // a new property is accessed.
  const catalystProxy = new Proxy(catalyst, {
    get(catalystTarget, name, receiver) {
      let catalystReflection = Reflect.get(catalystTarget, name, receiver);
      if (!catalystReflection) {
        const sandbox = initializeSandbox(name);
        let hasInitializedActiveKeyListener = false;

        // Automatically initializes the active key listener for SPA handling if either
        // property is set. Only permitted to run once. isActive() is deprecated.
        const sandboxProxy = new Proxy(sandbox, {
          set(sandboxTarget, property, value) {
            /* eslint-disable-next-line */
            sandboxTarget[property] = value;

            if (
              !hasInitializedActiveKeyListener &&
              (property === 'id' || property === 'isActive')
            ) {
              sandbox._evolvContext.initializeActiveKeyListener(value);
              hasInitializedActiveKeyListener = true;
            } else if (property === 'id' || property === 'isActive') {
              sandbox.debug(
                'init sandbox: active key listener already initialized',
              );
            }

            return true;
          },
        });
        /* eslint-disable-next-line */
        catalystTarget[name] = sandboxProxy;
        catalystReflection = Reflect.get(catalystTarget, name, receiver);
        catalyst.sandboxes.push(sandboxProxy);
      }

      return catalystReflection;
    },
  });

  catalyst._intervalPoll = initializeIntervalPoll(catalyst);

  // The main mutation observer for all sandboxes
  catalyst._globalObserver = {
    observer: new MutationObserver(() => {
      let anySandboxActive = false;
      catalyst.sandboxes.forEach((sandbox) => {
        if (sandbox._evolvContext.state === 'inactive') return;
        anySandboxActive = true;
        sandbox.instrument.debouncedProcessQueue();
      });
      if (!anySandboxActive) {
        debug('global observer: no sandboxes active');
        catalyst._globalObserver.disconnect();
      }
    }),
    connect: () => {
      debug('global observer: observe');
      catalyst._globalObserver.observer.observe(document.body, {
        childList: true,
        attributes: true,
        subtree: true,
      });
      catalyst._globalObserver.state = 'active';
    },
    disconnect: () => {
      debug('global observer: disconnect');
      catalyst._globalObserver.observer.disconnect();
      catalyst._globalObserver.state = 'inactive';
    },
    state: 'inactive',
  };

  // catalyst._globalObserver.connect()

  return catalystProxy;
}

function processConfig(config) {
  function pageMatch(page) {
    if (!page) return false;

    return new RegExp(page).test(window.location.pathname);
  }

  window.evolv = window.evolv || {};
  const pages = config && config.pages ? config.pages : ['.*'];
  const matches = pages.some(pageMatch);
  const { evolv } = window;

  if (matches) {
    if (window.evolv.catalyst) return window.evolv.catalyst;

    evolv.catalyst = initializeCatalyst();
    evolv.renderRule = evolv.catalyst;

    return evolv.catalyst;
  }

  return true;
}

export { initializeCatalyst, processConfig };
