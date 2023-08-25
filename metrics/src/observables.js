import { applyMap, convertValue, getValue } from './values.js';

function genName(){
  return `metrics-${new Date().getTime()}`;
}

let collect = null;
let mutate = null;

export function initializeObservables(){
  var scope = window.evolv.collect.scope(genName());
  collect = scope.collect;
  mutate = scope.mutate;
}

export function resetObservables(){
  clearPoll();
  mutateQueue.forEach(m=>m.revert())
  mutateQueue = [];
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

const ExtendedEvents = {
  'iframe:focus': (metric, fnc)  =>
    getMutate(metric).customMutation((state, el)=> 
      window.addEventListener('blur', function (e) {
        if (document.activeElement == el) {
          fnc(null,el);
        }
      })
    )
}

let inc = 0
function genUniqueName(tag){
  return `${tag}-${inc++}`
}

export let ObservableQueue = [];

function defaultObservable(metric){
  function startListening(fnc){
    var val = getValue(metric);

    if (val){
      fnc(val)
      return;
    }

    if (!supportPolling(metric)){
      if (metric.default !== null && metric.default !== undefined){
        fnc(metric.default);
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
            fnc(val);
            clearPoll(poll)
          }
        } catch(e){console.info('audience not processed', metric);}
      }, metric.poll.interval || 50);
      
      addPoll(poll);
      setTimeout(function(){ 
        clearPoll(poll)

        if (!foundValue && metric.default) {
          fnc(metric.default);
        }
      },metric.poll.duration || 250);
    }
  }
  return {
    subscribe: startListening
  }
}

export const Observables = {
    dom(metric){
      function listenForDOM(fnc){
        if (metric.on){
          var extendedEvent = ExtendedEvents[metric.on];
          if (extendedEvent){
            extendedEvent(metric, fnc);
          } else {
            getMutate(metric).listen(metric.on, el=> fnc(null, el));
          }
        } else {
          getMutate(metric).customMutation((state, el)=> fnc(null, el));
        }
      }
      return {
        subscribe: listenForDOM
      };
    },
    on_async(metric){

    }
}

export function clearSubscriptions(){

}

export function observeSource(metric){
    const {source, key} = metric
    switch(source){
      case 'dom':       return Observables.dom(metric);
      case 'on-async':  return Observables.async(metric);
      default:          return  Observables[source] 
                              ? Observables[source](metric) 
                              : defaultObservable(metric);
    }
}
