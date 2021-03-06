
var audience = {
}
function refreshAudience(){
  try{
    window.evolv.context.update(audience);
  } catch(e){console.info('evolv context not available')}
}

var MacroSet = {
  map: function(array){
    return function(tokens){
      return array.map(function(n){return adapters.getExpressionValue(tokens, n)})
    }
  }
};
function bindMacro(macro, data){
  var fnc = MacroSet[macro];
  if (!fnc){
    return function(){ console.info('Warning: ', macro, ' not a valid macro');}
  }
  return fnc(data)  
}

function tokenizeExp(exp){
  return Array.isArray(exp) ? exp : exp.split('.')
}

var adapters = {
  getExpressionValue(exp, context){
    var tokens = tokenizeExp(exp);
    var result = context || window;
    
    if (tokens[0] === 'window') tokens = tokens.slice(1);

    while(tokens.length > 0 && result){
      var token = tokens[0];
      tokens = tokens.slice(1)
      var openPos = token.indexOf('(');
      if (openPos > 0){
        try{
          var closingPos = token.indexOf(')')
          var param = token.slice(openPos+1, closingPos)
          token = token.slice(0,openPos);
          var fnc = result[token]

          if (typeof fnc === 'function'){
            result = fnc.apply(result, [param]);
          } else if (token[0] === '@'){
            var macro = bindMacro(token.slice(1), result);
            result = macro(param)
          }
          else
            result = undefined;
        }
        catch(e){}
      } else {
        if (!result[token] && tokens.length > 0){ //try flattened object index
          token = token + '.' + tokens[0]
          tokens = tokens.slice(1);
        }
        result = result[token];
      }
    }
    return result;
  },
  setExpressionValue: function(exp, values, append){
    var tokens = tokenizeExp(exp)
    var key = tokens.pop();
    var obj = adapters.getExpressionValue(tokens);
    
    if (!obj) return;
  
    if (append){
      obj[key] += values;
    } else{
      obj[key] = values;
    }
  },
  getFetchValue: function(fetchData) {
    var url = fetchData.url || '';
    var method = fetchData.method || 'POST'
    var data  = fetchData.data || {};
    return fetch(url, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    })
    .then(function(response){return response.json();})
    .then(function(response){
      var expression = fetchData.expression || null;
      var store = fetchData.bindTo || null;
      var data = response.data;
      var value = adapters.getExpressionValue(expression, data);
      if (store){
        adapters.setExpressionValue(store, data);
      }
      if (!value) return '';
      
      return value.toString();
    })
  },
  getCookieValue: function(name) {
    var cookie = document.cookie.split(';')
        .find(function(item) {return item.trim().split('=')[0] === name })
    if (!cookie) return null;

    return cookie.split('=')[1];
  },
  getDomValue: function(sel) {
    return document.querySelector(sel)  && 'found';
  },
  getJqDomValue: function(sel) {
    return window.$ && ($(sel).length > 0)  && 'found';
  }
}

function getValue(obj){
  if (obj.type === 'expression') return adapters.getExpressionValue(obj.value);
  if (obj.type === 'fetch') return adapters.getFetchValue(obj.value);
  if (obj.type === 'dom') return adapters.getDomValue(obj.value);
  if (obj.type === 'jqdom') return adapters.getJqDomValue(obj.value);
  if (obj.type === 'cookie') return adapters.getCookieValue(obj.value);

  return null;
}

function convertValue(val){
  return val.toString();
}

function initConfig(){
  var distributionName = 'evolv:distribution';
  var distribution = window.localStorage.getItem(distributionName);
  if (!distribution) {
    distribution = Math.floor(Math.random()*100);
    window.localStorage.setItem(distributionName, distribution);
  }

  var qaAudienceEnabled = window.localStorage.getItem('evolv:qa_audience_enabled')

  return {
    distribution: parseInt(distribution),
    qaAudienceEnabled: qaAudienceEnabled
  }
};



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
    var prevLength = this.recheckQueue.length
    
    this.recheckQueue.forEach(function(l){
      addAudience(l.topKey, l.variable, l.audObj);
    });
    this.recheckQueue = this.recheckQueue.filter(function(l){
      return priorAudience[l.topKey][l.variable] === audience[l.topKey][l.variable];
    });
    if (force || this.recheckQueue.length < prevLength){
        refreshAudience();
    }
    
    //console.info('finishing spa update', this.recheckQueue, priorAudience, audience)

    if (this.recheckQueue.length === 0){
      this.terminateRecheck();
    }
  },
  terminateRecheck: function(){
    console.info('recheck is ended', this.recheckQueue)
    clearInterval(this.recheckInterval);
    this.recheckInterval = 0;
  },
  eventHandler: function(){
    if (this.queue === 0) return;

    audience.config.spaNav = 'true'; //

    this.recheckQueue = this.queue.slice(0); 
    this.recheck(true);
//    setTimeout(this.recheck.bind(this),0);//
    this.recheckInterval = setInterval(this.recheck.bind(this), 25)
    setTimeout(this.terminateRecheck.bind(this), 250)
  },
  initListener: function(){
    var listener = this.eventHandler.bind(this);
    window.addEventListener('popstate', listener);
    window.addEventListener('stateupdate_evolv', listener);
  }
}

Spa.initListener();

function addAudience(topKey, key, obj){
  function bindAudienceValue(val, inc){
    var newVal = convertValue(val);
    if (audience[topKey][key] ===  newVal) return false;

    audience[topKey][key] = newVal;
    if (inc){
       audience[topKey][key + '_pollingCount'] = '' + inc;
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
      bindAudienceValue(obj.default || '')
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
    }, obj.poll.interval || 50)
    setTimeout(function(){ 
      clearInterval(poll)
      if (!foundValue && obj.default){
        bindAudienceValue(obj.default || '');
        refreshAudience();
      }
    },obj.poll.duration || 250);
  } catch(e){
    console.warn('Unable to add audience for', topKey, key, obj, e);
  }
}

function setAudience(json){
  try{
    var topKeys = Object.keys(json);
    topKeys.forEach(function(topKey){
      var namespace = json[topKey];
      if (typeof namespace !== 'object'){
        return;
      }
      
      var variables = Object.keys(namespace);
      if (!audience[topKey]) audience[topKey] = {}
      variables.forEach(function(variable){
        var audObj = namespace[variable]
        if (!audObj.page || new RegExp(audObj.page).test(location.pathname)) {
          addAudience(topKey, variable, audObj)
          if (audObj.spa){
            Spa.addSpaListener(topKey, variable, audObj);
          }
        }
      })
    })
    refreshAudience();
  } catch(e){}
}

audience.config = initConfig();


module.exports = setAudience;
