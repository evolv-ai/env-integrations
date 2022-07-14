
import {debounce} from '../../core/debounce.js'

function checkFilterRule(filter){
  var val = window.evolv.client.context.get(filter.key)
  return new RegExp(filter.value).test(val);
}

export function listenForPage(page){
  var filters = page.filters || [];
  return {
    then(fnc) {
      var debouncedListener = debounce(function(){
        var satisfied = filters.every(checkFilterRule);
        if (satisfied) fnc(true);
      })
      window.evolv.client.on('context.changed', ()=> debouncedListener())
    }
  }
}