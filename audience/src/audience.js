import { adapters } from './adapters.js';

var audience = {
}

function refreshAudience(){
  try{
    window.evolv.context.update(audience);
  } catch(e){console.info('evolv context not available');}
}

function getValue(obj){
  var key = obj.key || obj.value;
  var source = obj.source;

  switch(source){
    case 'expression': return adapters.getExpressionValue(key);
    case 'fetch':      return adapters.getFetchValue(key);
    case 'dom':        return adapters.getDomValue(key);
    case 'jqdom':      return adapters.getJqDomValue(key);
    case 'cookie':     return adapters.getCookieValue(key);
    case 'query':      return adapters.getQueryValue(key);
    case 'extension':  return adapters.getExtensionValue(key);
  }

  return null;
}

function convertValue(val, type){
  switch(type){
    case 'float': return parseFloat(val);
    case 'int': return parseInt(val);
    case 'boolean': return /^true$/i.test(val);
    default: return val.toString();
  }
}


var Spa = {
  queue: [],
  addSpaListener: function(topKey, variable, audObj){
    this.queue.push({
      topKey: topKey,
      variable: variable,
      audObj: audObj
    });
  },
  recheck: function(force){
    var priorAudience = Object.assign({}, audience);
    var prevLength = this.recheckQueue.length;
    
    this.recheckQueue.forEach(function(l){
      addAudience(l.topKey, l.variable, l.audObj);
    });
    this.recheckQueue = this.recheckQueue.filter(function(l){
      return priorAudience[l.topKey][l.variable] === audience[l.topKey][l.variable];
    });
    if (force || this.recheckQueue.length < prevLength){
        refreshAudience();
    }
    

    if (this.recheckQueue.length === 0){
      this.terminateRecheck();
    }
  },
  terminateRecheck: function(){
    console.info('recheck is ended', this.recheckQueue);
    clearInterval(this.recheckInterval);
    this.recheckInterval = 0;
  },
  eventHandler: function(){
    if (this.queue.length === 0) return;

    this.recheckQueue = this.queue.slice(0); 
    this.recheck(true);
    this.recheckInterval = setInterval(this.recheck.bind(this), 25);
    setTimeout(this.terminateRecheck.bind(this), 250);
  },
  initListener: function(){
    var listener = this.eventHandler.bind(this);
    window.addEventListener('popstate', listener);
    window.addEventListener('stateupdate_evolv', listener);
  }
}

Spa.initListener();


function addAudience(topKey, key, obj){

  function applyMap(val, map, match='first'){
    function getValue(option) {
      return option.default || option.result
    }
    var fallback;
    if (match === 'first'){
      var results = map.find(function(mapOption){
        if (!mapOption.when) {
          return mapOption.default || mapOption.result;
        }
        
        var pattern = new RegExp(mapOption.when);
        return pattern.test(val);
      });
      if (results){
        return getValue(results);
      } else {
        return obj.default;
      }
    } else {
      var results = map.filter(function(mapOption){
          if (!mapOption.when) {
            fallback = mapOption;
            return null;
          }
          
          var pattern = new RegExp(mapOption.when);
          return pattern.test(val);
      });
      if (results.length === 0 && fallback) return getValue(fallback)
      if (results.length === 1) return getValue(results[0]);
      return null;
    }
  }
  
  function bindAudienceValue(val, inc){
    var newVal = convertValue(val, (!obj.map ?obj.type : undefined));
    if (obj.map){
        newVal = applyMap(newVal, obj.map, obj.match);
        if (!newVal && (!obj.type || obj.type === 'string')) return;
    }

    var audienceContext = topKey ? audience[topKey] : audience;

    if (audienceContext[key] ===  newVal) return false;

    audienceContext[key] = newVal;
    if (inc){
        audienceContext[key + '_pollingCount'] = '' + inc;
    }
    return true;
  }
  try{
    var val = getValue(obj);
    if (val){
      if (val.then) {//assume is promise
        val.then(function(response){
          bindAudienceValue(response, 0);
          refreshAudience();
        })
        return;
      } else {
        bindAudienceValue(val);
        return;
      }
    }

    if (!obj.poll){
      bindAudienceValue(obj.default || '');
      return;
    }
    var pollingCount = 0;
    var foundValue = false;
    var poll = setInterval(function(){
      try{
        var val = getValue(obj);
        pollingCount++;
        
        if (val){
          foundValue = true;
          bindAudienceValue(val);
          refreshAudience();
          clearInterval(poll);
        }
      } catch(e){console.info('audience not processed', obj);}
    }, obj.poll.interval || 50);
    setTimeout(function(){ 
      clearInterval(poll);
      if (!foundValue && obj.default){
        bindAudienceValue(obj.default || '');
        refreshAudience();
      }
    },obj.poll.duration || 250);
  } catch(e){
    console.warn('Unable to add audience for', topKey, key, obj, e);
  }
}

function processAttribute(name, attribute, topKey){
    if (!attribute.page || new RegExp(attribute.page).test(location.pathname)) {
        addAudience(topKey, name, attribute);
        if (attribute.spa){
        Spa.addSpaListener(topKey, name, attribute);
        }
    } 
}

export function processAudience(json){
  try{
    var topKeys = Object.keys(json);
    topKeys.forEach(function(topKey){
      var namespace = json[topKey];
      if (typeof namespace !== 'object') return;

      if (!namespace.source) {
        var variables = Object.keys(namespace);
        if (!audience[topKey]) audience[topKey] = {};
        variables.forEach(function(name){
            processAttribute(name, namespace[name], topKey)
        });
      } else {
        processAttribute(topKey, namespace, null)
      }
    });
    refreshAudience();
  } catch(e){}
}
