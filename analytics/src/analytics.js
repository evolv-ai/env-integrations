import {EventContext} from './eventContext.js';
import {extractAllocations} from './allocations.js';
import {runStatement, getExpression, tokenizeExp} from './statement.js';
import {waitFor} from './waitFor.js';

function listenToEvents(config){
  var poll = config.poll || {duration: 20000, interval:50};
  var events = config.event_types || ['confirmed'];
  var sentEventAllocations = {
    confirmed: {},
    contaminated: {},
    others: {}
  };
  var emitCheck = config.check;
  var emit = config.emit;
  var pageOptions = config.pageOptions || [];
  function checkEvolv(){ return window.evolv}
  function bindListener() {
    events.forEach(function(eventType){
      var sentAllocations = sentEventAllocations[eventType] || sentEventAllocations.others;
      function emitAllocations(pageConfig, allocation){
        try {
          var cid = allocation.cid
          if (!sentAllocations[cid]){
            emit(pageConfig, eventType, allocation)
            sentAllocations[cid] = true;
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
async function processStatements(pageConfig, event_type, evolvEvent){
  var statements = pageConfig.statements;
  var eventContext = new EventContext({...evolvEvent, event_type});
  await eventContext.initializeAsync();

  try{
    statements.forEach(function(statement){
      if (statement.event_type === event_type || !statement.event_type) {
        runStatement(statement, eventContext);
      }
    })
  } catch(e){console.info('statement failed',e)}
}
function areStatementsReady(config){
  return config.statements
    .every(function(statement){
      var target = statement.invoke || statement.bind || statement.init || statement.append;
      if (statement.bind){
        var obj = tokenizeExp(target).slice(0,-1);
        if (obj.length === 0) return true

        return !!getExpression(obj);
      } else{
        return !!getExpression(target)
      }
    });
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
        event_types
      });
    } catch(e){console.info('Evolv: Analytics not setup for', key)}
  })
}
