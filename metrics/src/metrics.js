import { initializeObservables, observeSource, resetObservables } from './observables.js';
import { instrumentSpaEvent } from './spa.js';
import { applyMap, convertValue, getValue } from './values.js';
import { checkWhen } from './when.js';

const DefaultContext = {"source": "expression", "key": "location.pathname"};
let cachedconfig = {};

export function processConfig(json){
  try{
    initialize();
    initializeObservables()

    if (!json) return console.warn('Evolv Audience warning: Apply list is not array', applyList);

    cachedconfig = json;
    processMetric(json, DefaultContext);

  } catch(e){
    console.warn('Evolv Audience error: Unable to process config', e);
  }
}

function processMetric(metric, context){
  let {comment, when, apply, ...baseMetric} = metric;
  let mergedMetric = {...context, ...baseMetric}

  //check conditionals
  if (when && (context.source != 'dom') && !checkWhen(when, context)){
      return;
  }

  if (context.source === 'dom' || (!apply && (baseMetric !== {}))){
    window.evolv.metrics.evaluating.push({...mergedMetric, apply});
  }

  if (context.source === 'dom'){
    //is this right?
    mergedMetric = {...mergedMetric, when: (when || context.when)};
  }

  if (apply){
    //changed mergedMetric
    if (context.source === 'dom' && when){
      return connectAbstractMetric(apply, mergedMetric);
    } else {
      return processApplyList(apply, mergedMetric)//handle map conditions
    }
  } else if (!isComplete(mergedMetric))  {
    if (!comment) return console.warn('Evolv Audience - Metric was incomplete: ', mergedMetric);
    return console.info('Found comment', comment)
  }

  if (mergedMetric.action === "event"){
    connectEvent(mergedMetric.tag, mergedMetric, context);
  } else{    
    addAudience(mergedMetric.tag, mergedMetric);
  }
}

function processApplyList(applyList, context){
  if (!Array.isArray(applyList)) return console.warn('Evolv Audience warning: Apply list is not array', applyList);

  applyList.forEach(metric => processMetric(metric, context));
}


function connectAbstractMetric(apply, metric){
  observeSource(metric)
    .subscribe(once((val,target) => 
      processApplyList(apply, {...metric, value: getValue(metric, target)})
    ));
}

function connectEvent(tag, metric, context){
  observeSource(metric)
    .subscribe(once((val,target) => {
      if (!metric.when || checkWhen(metric.when, context, target)){
        setTimeout(()=> emitEvent(tag, metric), 0);
      }
    }));
}

function addAudience(tag, metric){
  try {
    observeSource(metric)
      .subscribe((value, target) =>{
        if (!value){
          value = getValue(metric, target);
        }
        if (value){
          bindAudienceValue(tag, value, metric);
        }
      });
  } catch(e){
    console.warn('Unable to add audience for', tag, metric, e);
  }
}

function once(fnc){
  let called = false;
  return function(...args){
    if (called) return;
    called = true;
    fnc.apply(this,args);
  }
}

//Don't fire the same event more than once during EventInterval ms.
let eventTimestamp = {};
const EventInterval = 500;

function emitEvent(tag, metric){
  var lastTime = eventTimestamp[tag];
  var newTimeStamp = new Date().getTime();

  if (lastTime && (lastTime > newTimeStamp-EventInterval)) return;
  
  evolv.client.emit(tag);
  window.evolv.metrics.executed.push({tag, event: metric})

  eventTimestamp[tag] = newTimeStamp;
}

//audience bind
function bindAudienceValue(tag, val, metric){
  const audienceContext = window.evolv.context;
  let newVal;
  if (metric.default === val){
      newVal = val;
  } else if (metric.map){
      newVal = applyMap(val, metric);
      if (!newVal && (!metric.type || metric.type === 'string')) return;
  } else {
      newVal = convertValue(val, metric.type);
  }

  if (audienceContext.get(tag) ===  newVal) return false;

  audienceContext.set(tag, newVal);
  window.evolv.metrics.executed.push({tag, bind: metric, value: newVal})

  return true;
}

function isComplete(metric){
  return !!metric.source && typeof metric.source === 'string'
      && !!metric.key && typeof metric.key === 'string'
      && !!metric.tag && typeof metric.tag === 'string';
}

function initialize(){
  window.evolv.metrics = window.evolv.metrics || {executed: [], evaluating: []};
}

function initSpaListener(){
  function eventHandler(){
    resetObservables();
    window.evolv.metrics = {executed: [], evaluating: []};
    processMetric(cachedconfig, DefaultContext);
  }

  const SpaTag = 'evolv_metrics_spaChange';
  instrumentSpaEvent(SpaTag);
  window.addEventListener(SpaTag, eventHandler);
}

initSpaListener();

