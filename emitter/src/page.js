
import {getExpression} from '../../core/src/expression.js'
import {debounce} from '../../core/debounce.js'

function checkFilterRule(key, regex){
  if (key === 'url') key = 'web.url';

  var val = window.evolv.client.context.get(key)
  return new RegExp(regex).test(val); 
}


export function listenForPage(page){
  var filter = page.filter;
  var filterKeys = Object.keys(filter);
  return {
    then(fnc) {
      var debouncedListener = debounce(function(){
        var satisfied = filterKeys.every(k=>checkFilterRule(k, filter[k]));
        if (satisfied) fnc(true);
      })
      window.evolv.client.on('context.changed', ()=> console.info('listening for page', filter) || debouncedListener())
    }
  }
}