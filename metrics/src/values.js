import { adapters } from './adapters.js';
import { resolveValue } from './storage.js';


export function getActiveValue(source, key){
  switch(source){
    case 'expression':     return adapters.getExpressionValue(key);
    case 'fetch':          return adapters.getFetchValue(key);
    case 'dom':            return adapters.getDomValue(key);
    case 'jqdom':          return adapters.getJqDomValue(key);
    case 'cookie':         return adapters.getCookieValue(key);
    case 'localStorage':   return adapters.getLocalStorageValue(key);
    case 'sessionStorage': return adapters.getSessionStorageValue(key);
    case 'query':          return adapters.getQueryValue(key);
    case 'extension':      return adapters.getExtensionValue(key);
  }
  return null;
}

function extractNumber(val){
  return typeof val === 'string'
       ? val.replace(/[^0-9\.]/g, '')
       : val
}

export function convertValue(val, type){
  switch(type){
    case 'float': return parseFloat(extractNumber(val));
    case 'int': return parseInt(extractNumber(val));
    case 'number': return Number(extractNumber(val));
    case 'boolean': return /^true$/i.test(val);
    case 'array': return val; //hope the response was in array format - can support tranformations later
    default: return val.toString();
  }
}


export function applyMap(val, metric){
    let {map, match = 'first'} = metric;
  
    function getValue(option) {
      return option.default || option.value;
    }
    var fallback;
    if (match === 'first'){
      var results = map.find(function(mapOption){
        if (!mapOption.when) {
          return mapOption.default || mapOption.value;
        }
        
        var pattern = new RegExp(mapOption.when);
        return pattern.test(val);
      });
      if (results){
        return getValue(results);
      } else {
        return metric.default;
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
  
  export function getValue(metric,target){
    var val = getActiveValue(metric.source, metric.key);
    
    let {extract, value} = metric;
    if (extract){
      var extracted = target[extract.attribute];

      val = extract.parse 
          ? extracted.match(new RegExp(extract.parse))[0]
          : extracted;
    }
  
    if (value) val = value;
  
    return metric.storage 
         ? resolveValue(val, metric) 
         : val;
  }