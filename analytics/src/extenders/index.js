import {deferredActiveCombinations} from './activeCombinations.js'


const ExtenderPlugins = {
  activeCombinations: {
    // extend: activeCombinations,
    deferredExtend: deferredActiveCombinations
  }
}

export function hasExtentions(config, event){
  var extenders = getExtenders(config);
  return extenders?.length > 0
}

// export function extendEvent(config, event){
//   var extenders = getExtenders(config);
//   return (extenders.length > 0)
//          ? null
//          : event;
// }

export function deferredExtendEvent(config, event){
  var promises = getExtenders(config)
                  .map(ex=> ex.deferredExtend?.(event))
                  .filter(a=>!!a);
  return Promise.all(promises)
   .then(values=> (
     ( values.length > 0 )
     ? values.filter(a=>a).reduce((a,e)=> ({...a, ...e}), event)
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
