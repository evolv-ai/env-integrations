import {waitFor} from './waitFor.js';
import { eventTracking } from './eventTracking.js';
import { getSource } from './eventSource.js';
import { isDestinationReady, processDestination } from './eventTarget.js';

function listenToEvents(config){
  var poll = config.poll || {duration: 20000, interval:50};
  var emitCheck = config.check;
  var emit = config.emit;
  var pageOptions = config.pageOptions || {};
  var events = pageOptions.event_types || ['confirmed'];
  let tracking = eventTracking(config.uniqueConfirmationsPerSession);

  function checkEvolv(){ return window.evolv}

  function bindListener() {
    events.forEach(function(eventType){
      function emitAllocations(pageConfig, event){
        try {
          if (!tracking.hasSent(eventType, event)){
            emit(pageConfig, eventType, event);
            tracking.markAsSent(eventType, event);
          }
        } catch(e){console.info('Evolv: Analytics not sent', e);}
      }
      
      getSource(config).on(eventType, function (event) {
        var pageConfig = findMatchingConfig(pageOptions, event);
        if (!pageConfig) return;
        waitFor(emitCheck.bind(null, pageConfig), emitAllocations.bind(null,pageConfig, event), poll);
      });
    });
  }
  waitFor(checkEvolv, bindListener, poll);
}
//json config processing
function findMatchingConfig(config, event){
  const destinations = config.destinations;
  for (var i=0; i< destinations.length; i++){
    var config = destinations[i]
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
  var configKeys = Object.keys(config);
  configKeys.forEach(function(key){
    try{
      var pageOptions = config[key]
      listenToEvents({
        pageOptions: pageOptions,
        check: isDestinationReady,
        emit: processDestination,
        uniqueConfirmationsPerSession: config.uniqueConfirmationsPerSession
      });
    } catch(e){console.info('Evolv: Analytics not setup for', key)}
  })
}
