function initializeEvolvContext(sandbox) {
  const { debug, warn } = sandbox;
  let hasBeenActive = false;

  return {
    state: 'default',
    onReactivate: [
      window.evolv.catalyst._globalObserver.connect,
      window.evolv.catalyst._intervalPoll.startPolling,
    ],
    onDeactivate: [
      window.evolv.catalyst._globalObserver.disconnect,
      sandbox.instrument.deinstrument,
      sandbox._intervalPoll.reset,
    ],
    initializeActiveKeyListener: (value) => {
      debug('active key listener: init');
      debug('active key listener: waiting for window.evolv.client');

      sandbox
        .waitUntil(() => window.evolv?.client?.getActiveKeys)
        .then(() => {
          // If contextKey is null, getActiveKeys will still trigger and use rule.isActive to evaluate state
          const contextKey = typeof value === 'string' ? `web.${value}` : null;

          window.evolv.client.getActiveKeys(contextKey).listen((keys) => {
            let isActive;

            if (typeof value === 'string')
              isActive = () => keys.current.length > 0;
            else if (typeof value === 'function') isActive = value;
            else
              warn(
                'init active key listener: requires context id string or isActive function, invalid input',
                value,
              );

            // const evolvContext = sandbox._evolvContext;
            const previous = sandbox._evolvContext.state;
            const current = isActive() ? 'active' : 'inactive';
            sandbox._evolvContext.state = current;

            if (previous === 'default') {
              debug(
                `active key listener: initialize context '${sandbox.name}', current state is '${current}'`,
              );
              if (current === 'active') hasBeenActive = true;
            } else if (previous === 'inactive' && current === 'active') {
              debug(`active key listener: activate context '${sandbox.name}'`);
              if (hasBeenActive)
                sandbox._evolvContext.onReactivate.forEach((callback) =>
                  callback(),
                );
              hasBeenActive = true;
            } else if (previous === 'active' && current === 'inactive') {
              debug(
                `active key listener: deactivate context '${sandbox.name}'`,
              );
              sandbox._evolvContext.onDeactivate.forEach((callback) =>
                callback(),
              );
            } else {
              debug(
                `active key listener: no change, current state '${current}'`,
              );
            }
          });
        });
    },
  };
}

function initializeTrack(sandbox) {
  const { debug } = sandbox;
  const evolvContext = sandbox._evolvContext;

  return (variant) => {
    debug('track:', `'${variant}'`);

    // Backward compatibility
    const trackKey = `evolv-${sandbox.name}`;
    const body = sandbox.select(document.body);

    const className = `${sandbox.name}-${variant}`;
    const onReactivateCallback = () => {
      debug(`track: '${variant}' active`);

      // Backward compatibility
      let tracking = body.attr(trackKey);
      if (!tracking.split(' ').includes(variant)) {
        tracking = tracking ? `${tracking} ${variant}` : variant;
        body.attr({ [trackKey]: tracking });
      }

      sandbox.instrument.add(className, () => sandbox.select(document.body), {
        type: 'single',
      });
    };

    const onDeactivateCallback = () => {
      debug(`track: '${variant}' is inactive`);

      // Backward compatibility
      body.el[0].removeAttribute(trackKey);
    };

    evolvContext.onReactivate.push(onReactivateCallback);
    evolvContext.onDeactivate.push(onDeactivateCallback);

    if (evolvContext.state === 'active') onReactivateCallback();
  };
}

export { initializeEvolvContext, initializeTrack };
