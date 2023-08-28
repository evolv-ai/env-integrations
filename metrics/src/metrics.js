
import { processMetric } from './metric.js';
import { initializeObservables, resetObservables } from './observables.js';
import { instrumentSpaEvent } from './spa.js';
import { initializeTracking, resetTracking, trackEvaluating, trackExecuted } from './track.js';

const DefaultContext = {"source": "expression", "key": "location.pathname"};
let cachedconfig = {};

export function processConfig(json){
  try{
    initializeObservables()
    initializeTracking();

    if (!json) return console.warn('Evolv Audience warning: Apply list is not array', applyList);

    cachedconfig = json;
    processMetric(json, DefaultContext);
  } catch(e){
    console.warn('Evolv Audience error: Unable to process config', e);
  }
}


function initSpaListener(){
  function eventHandler(){
    resetObservables();
    resetTracking();
    processMetric(cachedconfig, DefaultContext);
  }

  const SpaTag = 'evolv_metrics_spaChange';
  instrumentSpaEvent(SpaTag);
  window.addEventListener(SpaTag, eventHandler);
}

initSpaListener();
