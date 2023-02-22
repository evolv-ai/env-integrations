function initializeIntervalPoll(catalyst) {
  function processQueue(sandbox) {
    const { queue } = sandbox._intervalPoll;

    queue.forEach((entry, index) => {
      const timeElapsed = performance.now() - entry.startTime;

      if (entry.timeout && entry.timeout < timeElapsed) {
        sandbox.debug('waitUntil: condition timed out', entry);
        queue.splice(index, 1);
        return;
      }

      try {
        if (entry.condition()) {
          sandbox.debug(
            'waitUntil: condition met:',
            entry.condition,
            entry.condition(),
            `${(performance.now() - entry.startTime).toFixed(2)}ms`,
          );
          entry.callback();
          queue.splice(index, 1);
        }
      } catch (error) {
        // Prevents 60 error messages per second if the condition contains an error
        sandbox.warn(
          'waitUntil: error in condition, removing from queue',
          error,
        );
        queue.splice(index, 1);
      }
    });
  }

  function processQueues() {
    return new Promise((resolve) => {
      const intervalPoll = catalyst._intervalPoll;
      if (intervalPoll.isPolling) return;
      intervalPoll.isPolling = true;
      catalyst.debug('interval poll: start polling');
      function done() {
        catalyst.debug('interval poll: stop polling');
        intervalPoll.isPolling = false;
      }

      function processQueuesLoop() {
        let anySandboxActive = false;
        let queueTotal = 0;

        catalyst.sandboxes.forEach((sandbox) => {
          if (sandbox._evolvContext.state === 'inactive') return;
          anySandboxActive = true;

          processQueue(sandbox);
          queueTotal += sandbox._intervalPoll.queue.length;
        });

        if (!anySandboxActive) {
          catalyst.debug('interval poll: no active sandboxes');
          return resolve(done());
        }

        if (queueTotal === 0) {
          catalyst.debug('interval poll: all queues empty');
          return resolve(done());
        }

        requestAnimationFrame(processQueuesLoop);

        return true; // ESLint says I need it;
      }

      processQueuesLoop();
    });
  }

  return {
    isPolling: false,
    startPolling: processQueues,
  };
}

function initializeSandboxIntervalPoll(sandbox) {
  const queue = [];
  return {
    queue,
    reset: () => {
      if (queue > 0) {
        sandbox.debug('interval poll: clear queue');
        queue.length = 0;
      }
    },
  };
}

export { initializeIntervalPoll, initializeSandboxIntervalPoll };
