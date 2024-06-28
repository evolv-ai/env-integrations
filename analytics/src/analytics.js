import {extractAllocations} from './allocations.js';
import {waitFor} from './waitFor.js';
import { areStatementsReady, processStatements } from './statements.js';
import { eventTracking } from './eventTracking.js';

function listenToEvents(config){
  var poll = config.poll || {duration: 20000, interval:50};
  var events = config.event_types || ['confirmed'];
  var emitCheck = config.check;
  var emit = config.emit;
  var pageOptions = config.pageOptions || [];
  let tracking = eventTracking(config.uniqueConfirmationsPerSession);

  function checkEvolv(){ return window.evolv}

  function bindListener() {
    events.forEach(function(eventType){
      function emitAllocations(pageConfig, allocation){
        try {
          if (!tracking.hasSent(eventType, allocation)){
            emit(pageConfig, eventType, allocation);
            tracking.markAsSent(eventType, allocation);
          }
        } catch(e){console.info('Evolv: Analytics not sent', e);}
      }

      window.evolv.client.on(eventType, function (type) {
        var allocations = extractAllocations(eventType);
        allocations.forEach(function(allocation) {
          var pageConfig = findMatchingConfig(pageOptions, allocation);
          if (!pageConfig) return;
          waitFor(emitCheck.bind(null, pageConfig), emitAllocations.bind(null,pageConfig, allocation), poll);
        })
      });
    });
  }
  waitFor(checkEvolv, bindListener, poll);
}
//json config processing
function findMatchingConfig(configs, event){
  for (var i=0; i< configs.length; i++){
    var config = configs[i]
    if (contextMatch(config, event)) {
        return config
    }
  }
  return null;
}

//json config processing
function contextMatch(config, event) {
  if (!config.page || new RegExp(config.page).test(location.pathname)) {
    var experiments = config.experiments;
    return (!experiments
        || !experiments.ids
        || (experiments.operator == "include" && experiments.ids.includes(event.group_id))
        || (experiments.operator == "exclude" && !experiments.ids.includes(event.group_id))
    );
  }
  return false;
}

export function processAnalytics(config){
  var {event_types,...baseConfig} = config;
  var configKeys = Object.keys(baseConfig);
  configKeys.forEach(function(key){
    try{
      var pageOptions = baseConfig[key]
      listenToEvents({
        pageOptions: pageOptions,
        check: areStatementsReady,
        emit: processStatements,
        event_types,
        uniqueConfirmationsPerSession: baseConfig.uniqueConfirmationsPerSession
      });
    } catch(e){console.info('Evolv: Analytics not setup for', key)}
  })
}
