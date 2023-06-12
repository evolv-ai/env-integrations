

//Object to process event values
export function EventContext(event){
  this.event = event;
  this.localVars = {};
}

EventContext.prototype.isLocalVar = function(key){
  return key.indexOf('@') === 0;
}

EventContext.prototype.eventValue =  function(key){
  var event = this.event;
  switch (key) {
    case 'combination_id':
      return(event.ordinal);
    case 'experiment_id':
      return(event.group_id);
    case 'user_id':
      return(event.uid);    
    default:
      return event[key] || '';
  }
}
EventContext.prototype.parseTemplateString = function(str){
  var tokenize = /((\${([^}]*)})|([^${}])+)/g;
  var extract =  /\${([^}]*)}/;
  var tokens = str.match(tokenize);
  var instantiateTokens = function (accum, str){
    var val = str.match(extract)

    return accum + (val ? this.eventValue(val[1]) : str);
  }.bind(this);

  return tokens.reduce(instantiateTokens, '');
}
EventContext.prototype.extractValue = function(macroValue){
  if (Array.isArray(macroValue)){
    return this.buildArray(macroValue);
  }
  if (typeof macroValue === 'object'){
    return this.buildMap(macroValue);
  }

  if (typeof macroValue !== 'string') {
    return macroValue;
  }

  if (this.isLocalVar(macroValue)){
    return this.localVars[macroValue];
  } else {
    return this.parseTemplateString(macroValue)
  }
}

EventContext.prototype.buildMap = function(config){
  var $this = this;
  var keys = Object.keys(config);
  var emitMap = {};
  keys.forEach(function(key){
    emitMap[key] = $this.extractValue(config[key]);
  });
  return emitMap
}
EventContext.prototype.buildArray = function(configArray){
  var $this = this;
  return configArray.map(function(exp){
    return $this.extractValue(exp)
  })
}

