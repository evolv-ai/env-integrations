import { instrumentSpaEvent } from './spa.js';
import { applyMap, convertValue, getValue } from './values.js';
import { checkWhen } from './when.js';

let audience = {};

function genName(){
  return `metrics-${new Date().getTime()}`;
}

const DefaultContext = {"source": "expression", "key": "location.pathname"};
let cachedconfig = {};

let collect = null;
let mutate = null;

function initialize(){
  var scope = window.evolv.collect.scope(genName());
  collect = scope.collect;
  mutate = scope.mutate;
  window.evolv.applied_metrics = window.evolv.applied_metrics || [];
}

function initSpaListener(){
  function eventHandler(){
    clearPoll();
    mutateQueue.forEach(m=>m.revert())
    mutateQueue = [];
    processMetric(cachedconfig, DefaultContext);
    window.evolv.applied_metrics = [];
  }

  const SpaTag = 'evolv_metrics_spaChange';
  instrumentSpaEvent(SpaTag);
  window.addEventListener(SpaTag, eventHandler);
}

initSpaListener();

//audience code

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

  return true;
}

function supportPolling(metric){
  return metric.poll
      && metric.source !== 'dom'
      && metric.source !== 'query';
}

let pollingQueue = [];

function removePoll(poll){
  clearInterval(poll);
  pollingQueue = pollingQueue.filter(p=> p!==poll);
}
function clearPoll(){
  pollingQueue.forEach(p=>clearInterval(p));
  pollingQueue = [];
}
function addPoll(poll){
  pollingQueue.push(poll);
}


let mutateQueue = [];
let collectCache = {};

function getMutate(metric){
  let collectName = collectCache[metric.key];

  if (!collectName){
    collectName = genUniqueName(metric.tag);
    collectCache[metric.key] = collectName
    collect(metric.key, collectName);
  }

  var mut = mutate(collectName);
  mutateQueue.push(mut)
  return mut;
}

function addAudience(tag, metric, target){
  try {
    if (metric.on){
      let {on, ...reducedMetric} = metric
      getMutate(metric).listen(on, e=>
        addAudience(tag, reducedMetric, e.target)
      );
      return;
    }

    var val = getValue(metric, target);
    if (val){
      if (val.then) {//assume is promise
        val.then(function(response){
          bindAudienceValue(tag, response, metric);
        })
        return;
      } else {
        bindAudienceValue(tag, val, metric);
        return;
      }
    }

    if (!supportPolling(metric)){
      if (metric.default !== null && metric.default !== undefined){
        bindAudienceValue(tag, metric.default, metric);
      }
      return;
    } else {
      var pollingCount = 0;
      var foundValue = false;
      var poll = setInterval(function(){
        try{
          var val = getValue(metric);
          pollingCount++;
          
          if (val){
            foundValue = true;
            bindAudienceValue(tag, val, metric);
            clearPoll(poll)
          }
        } catch(e){console.info('audience not processed', metric);}
      }, metric.poll.interval || 50);
      
      addPoll(poll);
      setTimeout(function(){ 
        clearPoll(poll)

        if (!foundValue && metric.default) {
          bindAudienceValue(tag, metric.default, metric);
        }
      },metric.poll.duration || 250);
    }
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

let inc = 0
function genUniqueName(tag){
  return `${tag}-${inc++}`
}

function connectAbstractMetric(apply, metric){
  if (metric.on) {
    getMutate(metric).listen(metric.on, once((e)=> 
        processApplyList(apply, {...metric, value: getValue(metric, e)})
    ));
  } else if (metric.source === 'dom'){
    getMutate(metric).customEffect(once((state, el)=> 
        processApplyList(apply, {...metric, value: getValue(metric,el)})
        
    ));
  } else {
    // evaluate 
    //todo: fixme for polling parents
    // setTimeout(()=> evolv.client.emit(tag), 50);
  }
}

function connectEvent(tag, metric, context){
  if (metric.on) {
    getMutate(metric).listen(metric.on, once((e)=> {
      if (!metric.when || checkWhen(metric.when, context, e.target)){
        evolv.client.emit(tag);
      }
    }))
  } else if (metric.source === 'dom'){
    getMutate(metric).customEffect(once((state, el)=>{
      if (!metric.when || checkWhen(metric.when, context, el.target)){
        evolv.client.emit(tag);
      }
    }));
  } else {
    //wait for ga to fully initialize
    setTimeout(()=> evolv.client.emit(tag), 50);
  }
}

function isComplete(metric){
  return !!metric.source && typeof metric.source === 'string'
      && !!metric.key && typeof metric.key === 'string'
      && !!metric.tag && typeof metric.tag === 'string';
}

function processMetric(metric, context){
  
  let {comment, when, apply, ...baseMetric} = metric;
  let mergedMetric = {...context, ...baseMetric}

  //check conditionals
  if (when && (context.source != 'dom') && !checkWhen(when, context)){
      return;
  }

  if (context.source === 'dom' || (!apply && (baseMetric !== {}))){
    window.evolv.applied_metrics.push({...mergedMetric, apply});
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

export function processConfig(json){
  try{
    initialize();

    if (!json) return console.warn('Evolv Audience warning: Apply list is not array', applyList);

    cachedconfig = json;
    processMetric(json, DefaultContext);

  } catch(e){
    console.warn('Evolv Audience error: Unable to process config', e);
  }
}
