import { emitEvent } from './event.js';
import { mergeMetric } from './inheritance.js';
import { observeSource } from './observables.js';
import { trackEvaluating, trackExecuted } from './track.js';
import { applyMap, convertValue, getValue } from './values.js';
import { checkWhen } from './when.js';

export function processMetric(metric, context){
  let {comment, when, apply, ...baseMetric} = metric;
  let mergedMetric = mergeMetric(context, baseMetric);

  //check conditionals
  if (when && (context.source != 'dom') && !checkWhen(when, context)){
      return;
  }

  trackEvaluating({...mergedMetric, apply});

  mergedMetric = {...mergedMetric, when: (when || context.when)};

  if (apply){
    if (context.source === 'dom' && when){
      connectAbstractMetric(apply, mergedMetric);
    } else {
      processApplyList(apply, mergedMetric)//handle map conditions
    }
  } else if (!isComplete(mergedMetric))  {
    if (!comment) console.warn('Evolv Audience - Metric was incomplete: ', mergedMetric);
  } else {
    applyConcreteMetric(mergedMetric, context);
  }
}

function applyConcreteMetric(metric, context){
  if (metric.action === "event"){
    connectEvent(metric.tag, metric, context);
  } else{    
    addAudience(metric.tag, metric);
  }
}

function processApplyList(applyList, context){
  if (!Array.isArray(applyList)) return console.warn('Evolv Audience warning: Apply list is not array', applyList);

  applyList.forEach(metric => processMetric(metric, context));
}

function connectAbstractMetric(apply, metric){
  observeSource(metric)
    .subscribe(once((val,data) => 
      processApplyList(apply, {...metric, value: getValue(metric, data)})
    ));
}

function connectEvent(tag, metric, context){
  observeSource(metric)
    .subscribe(once((val,data) => {
      if (!metric.when || checkWhen(metric.when, context, data)){
        setTimeout(()=> emitEvent(tag, metric), 0);
      }
    }));
}

function addAudience(tag, metric){
  try {
    observeSource(metric)
      .subscribe((value, data) =>{
        if (!value){
          value = getValue(metric, data);
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
  trackExecuted({tag, bind: metric, value: newVal});
  return true;
}

function isComplete(metric){
  return !!metric.source && typeof metric.source === 'string'
      && !!metric.key && typeof metric.key === 'string'
      && !!metric.tag && typeof metric.tag === 'string';
}
