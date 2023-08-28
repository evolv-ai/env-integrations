import { emitEvent } from './event.js';
import { mergeMetric } from './inheritance.js';
import { observeSource } from './observables.js';
import { trackEvaluating, trackExecuted } from './track.js';
import { applyMap, convertValue, getValue } from './values.js';
import { checkWhen } from './when.js';

export function processMetric(metric, context){
  if (notApplicabile(metric, context)) return;

  let mergedMetric = mergeMetric(context, metric);
  trackEvaluating({...mergedMetric, apply: metric.apply});

  console.info('metrics tracing:', mergedMetric, metric, context)

  mergedMetric.when = metric.when;// || context.when;

  if (metric.apply){
    if (metric.when){
      connectAbstractMetric(metric.apply, mergedMetric, context);
    } else {
      processApplyList(metric.apply, mergedMetric)//handle map conditions
    }
  } else if (!isComplete(mergedMetric))  {
    if (!metric.comment) console.warn('Evolv Audience - Metric was incomplete: ', mergedMetric);
  } else {
    applyConcreteMetric(mergedMetric, context);
  }
}

function processApplyList(applyList, context){
    if (!Array.isArray(applyList)) return console.warn('Evolv Audience warning: Apply list is not array', applyList);
  
    applyList.forEach(metric => processMetric(metric, context));
  }

function notApplicabile(metric, context){
   return metric.when && 
         (context.source != 'dom') && 
         !checkWhen(metric.when, context);
}

function applyConcreteMetric(metric, context){
  if (metric.action === "event"){
    connectEvent(metric.tag, metric, context);
  } else{    
    addAudience(metric.tag, metric);
  }
}

function connectAbstractMetric(apply, metric, context){
  observeSource(context)
    .subscribe(once((val,data) => {       
        let value = val || getValue(context, data);
        if (!metric.when || checkWhen(metric.when, {...metric, value}, data)){
            processApplyList(apply, {...metric, data})
        }
    }));
}

function connectEvent(tag, metric, context){
  observeSource(metric)
    .subscribe(((val,data) => {
        if (context.extract && metric.when){
            context.value = undefined;
            context.value = convertValue(getValue(context,data), context.type)
        }
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
