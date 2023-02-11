import { version } from '../package.json';
import { initializeLogs } from './logs.js';
import { initializeENode } from './enode2.js';
import {
  initializeSelectInstrument,
  initializeInstrument,
} from './instrument.js';
import { initializeEvolvContext, initializeTrack } from './evolv-context.js';
import { initializeSandboxIntervalPoll } from './interval-poll.js';
import { initializeStore } from './store.js';
import {
  initializeWhenContext,
  initializeWhenMutate,
  initializeWhenDOM,
  initializeWhenItem,
  initializeWhenElement,
  initializeWhenElements,
  initializeWaitUntil,
} from './when.js';

function initializeSandbox(name) {
  const sandbox = {};
  sandbox.name = name;

  initializeLogs(sandbox);
  const { log, debug } = sandbox;

  if (name === 'catalyst') {
    log(`init catalyst version ${version}`);
    log(`log level: ${sandbox.logs}`);
    sandbox.version = version;
  } else {
    debug(`init context sandbox: ${name}`);
    if (window.evolv.catalyst._globalObserver.state === 'inactive')
      window.evolv.catalyst._globalObserver.connect();
  }

  const enode = initializeENode(sandbox);
  sandbox.$ = enode.selectAll;
  sandbox.select = enode.select;
  sandbox.selectAll = enode.selectAll;

  if (sandbox.name !== 'catalyst') {
    sandbox.selectInstrument = initializeSelectInstrument(sandbox);
    sandbox.$$ = sandbox.selectInstrument;
    sandbox.store = initializeStore(sandbox);
    sandbox.app = {};
    sandbox.instrument = initializeInstrument(sandbox);
    sandbox._intervalPoll = initializeSandboxIntervalPoll(sandbox);
    sandbox._evolvContext = initializeEvolvContext(sandbox);
    sandbox.whenContext = initializeWhenContext(sandbox);
    sandbox.whenMutate = initializeWhenMutate(sandbox);
    sandbox.whenDOM = initializeWhenDOM(sandbox);
    sandbox.whenItem = initializeWhenItem(sandbox);
    sandbox.whenElement = initializeWhenElement(sandbox);
    sandbox.whenElements = initializeWhenElements(sandbox);
    sandbox.waitUntil = initializeWaitUntil(sandbox);
    sandbox.track = initializeTrack(sandbox);
  }

  // Backward compatibility
  sandbox.reactivate = () => {};

  return sandbox;
}

export default initializeSandbox;
