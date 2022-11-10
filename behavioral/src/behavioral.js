import { adapters } from './adapters.js';
import { getbehaviors, setBehaviors } from './persistence.js';
import { updateBehaviorContext } from './context.js';

//import { Spa } from './spa.js'
// Spa.initListener();

export function setupBehaviors(json){
  var behaviors = json.behaviors || {};
  var contextKey = json.contextBase || 'behaviors';
  try{
    var behaviorData = getbehaviors(); //includes timestamps and metadata
    var behaviorState = behaviorData.behaviors; //just the behaviors
    var adapterKeys = Object.keys(behaviors);

    var currentTime = new Date().getTime();

    adapterKeys.forEach(function(adapterKey){
      try{
        var behavior = behaviors[adapterKey];
        var adapterState = behaviorState[adapterKey];

        if (!adapters[adapterKey]) {
            console.warn('evolv behavior not available:', adapterKey);
            return;
        }

        if (!behavior.disabled){
            behaviorState[adapterKey] = adapters[adapterKey](behavior, adapterState, behaviorData);
        } else {
            behaviorState[adapterkey] = null;
        }
        } catch(e){console.info('evolv behavior adapter failed:', adapterKey)}
    })

    behaviorData.updatedAt = currentTime;

    setBehaviors(behaviorData);
    updateBehaviorContext(contextKey, behaviorState);
  } catch(e){}
}
