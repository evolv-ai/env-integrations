import {activeCombinations, deferredActiveCombinations} from './activeCombinations.js'


const ExtenderPlugins = {
  activeCombinations: {
    extend: activeCombinations,
    deferredExtend: deferredActiveCombinations
  }
}

export function extendEvent(config, event){
  return getExtenders(config)
    .reduce((a,e)=> ({...a, ...(e.extend?.(event) || {})}), event)
}

export function deferredExtendEvent(config, event){
  var promises = getExtenders(config)
                  .map(ex=> ex.deferredExtend?.(event))
                  .filter(a=>!!a);
  return Promise.all(promises)
   .then(values=> (
     ( values.length > 0 )
     ? values.filter().reduce((a,e)=> ({...a, ...e}), event)
     : null
   ))
}


function getExtenders(config){
  return (config?.extends || [])
    .map(name=> {
      if (!ExtenderPlugins[name]) console.info('Evolv could not find extender', name)
      return ExtenderPlugins[name]
    })
    .filter(a=>!!a)
}