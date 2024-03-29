import { adapters } from './adapters.js';
import { trackWarning } from './track.js';
import { getValue } from './values.js';
import { checkWhen } from './when.js';

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

function defaultObservable(metric, context){
  function startListening(fnc){

    if (!metric.when || checkWhen(metric.when, context)){
      var val = getValue(metric);

      if (val){
        fnc(val)
        return;
      }
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
          if (metric.when && !checkWhen(metric.when, context)) return;
          var val = getValue(metric);
          pollingCount++;
          
          if (val){
            foundValue = true;
            fnc(val);
            removePoll(poll)
          }
        } catch(e){trackWarning({metric, error: e, message:'metric processing exception'});}
      }, metric.poll.interval || 50);
      
      addPoll(poll);
      setTimeout(function(){ 
        removePoll(poll)

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
            getMutate(metric).listen(metric.on, el=> fnc(null, el.target));
          }
        } else {
          getMutate(metric).customMutation((state, el)=> fnc(null, el));
        }
      }
      return {
        subscribe: listenForDOM
      };
    },
    onAsync(metric){
      function listen(fnc){

        if (!metric.on) return trackWarning({metric, message: "on-async requires attribute 'on'"});

        let obj = adapters.getExpressionValue(metric.key);

        if (!obj.on || typeof obj.on != 'function') return trackWarning({metric, message: "on-async object from '${metric.key}' did not have method 'on'"});

        function handler(){
          fnc(null, {params:arguments})
        }

        obj.on(metric.on, handler);
      }
      return {
        subscribe: listen
      }
    }
}

export function clearSubscriptions(){

}

export function observeSource(metric, context){
    const {source, key} = metric
    switch(source){
      case 'dom':       return Observables.dom(metric, context);
      case 'on-async':  return Observables.onAsync(metric, context);
      default:          return  Observables[source] 
                              ? Observables[source](metric, context) 
                              : defaultObservable(metric, context);
    }
}
