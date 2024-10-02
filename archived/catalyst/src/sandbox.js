import { version } from '../package.json';
import initializeLogs from './logs.js';
import initializeENode from './enode.js';
import {
  initializeSelectInstrument,
  initializeInstrument,
} from './instrument.js';
import { initializeEvolvContext, initializeTrack } from './evolv-context.js';
import { initializeSandboxIntervalPoll } from './interval-poll.js';
import initializeStore from './store.js';
import {
  initializeWhenContext,
  initializeWhenMutate,
  initializeWhenDOM,
  initializeWhenItem,
  initializeWhenRemove,
  initializeWhenChange,
  initializeWhenElement,
  initializeWhenElements,
  initializeWaitUntil,
} from './when.js';

function initializeSandbox(name) {
  const sandbox = {};
  sandbox.name = name;

  const logs = initializeLogs(sandbox);
  const { logLevel } = logs;
  sandbox.log = logs.log;
  sandbox.warn = logs.warn;
  sandbox.debug = logs.debug;
  const { log, debug } = sandbox;

  if (name === 'catalyst') {
    log(`init catalyst version ${version}`);
    log(`log level: ${logLevel}`);
    sandbox.version = version;
  } else {
    debug(`init context sandbox: ${name}`);
    if (window.evolv.catalyst._globalObserver.state === 'inactive')
      window.evolv.catalyst._globalObserver.connect();
  }

  const ENode = initializeENode(sandbox);
  sandbox.select = (select, context) => new ENode(select, context, true);
  sandbox.selectAll = (select, context) => new ENode(select, context, false);
  sandbox.$ = sandbox.selectAll;

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
    sandbox.whenRemove = initializeWhenRemove(sandbox);
    sandbox.whenChange = initializeWhenChange(sandbox);
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
