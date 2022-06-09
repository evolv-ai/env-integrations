
import {getExpression} from '../../core/src/expression.js'

function checkFilterRule(key, regex){
  if (key === 'url') key = 'window.location.href';

  var val = getExpression(key);
  // console.info('emitter: checking filter', key, val, regex, new RegExp(regex).test(val))

  return new RegExp(regex).test(val); 
}

export function listenForPage(page){
  var filter = page.filter;
  var cb;
  
  var filterKeys = Object.keys(filter);
  var satisfied = filterKeys.every(k=>checkFilterRule(k, filter[k]))
  return {
    then(fnc) {
      cb = fnc;

      console.info('emitter: filters are satisfied', satisfied);
      if (satisfied){
        fnc(true);
      }
    }
  }
}