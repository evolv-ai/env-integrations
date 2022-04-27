import {EventContext} from './eventContext.js';
import {sendAllocations} from './allocations.js';
import {runStatement, getExpression, tokenizeExp} from './statement.js';
import {hasExtentions, deferredExtendEvent} from './extenders/index.js';
import {waitFor} from './waitFor.js';

function listenToEvents(config){
  var poll = config.poll || {duration: 2000, interval:50};
  var events = config.events || ['confirmed'];
  var sentEventAllocations = {
    confirmed: {},
    contaminated: {},
    others: {}
  };
  var emitCheck = config.check;
  var emit = config.emit;

  function checkEvolv(){ return window.evolv}

  function bindListener() {
    events.forEach(function(eventType){
      function emitAllocations(){
        sendAllocations(eventType, emit, sentEventAllocations)
      }
      window.evolv.client.on(eventType, function (type) {
        waitFor(emitCheck, emitAllocations, poll);
      });
    })
  }

  waitFor(checkEvolv, bindListener, poll);
}

//json config processing
function findMatchingConfig(configs){
  for (var i=0; i< configs.length; i++){
      var config = configs[i]
      if (!config.page || new RegExp(config.page).test(location.pathname)) {
          return config
      }
  }
  return null;
}

function processStatements(pageConfig, eventType, evolvEvent){
  function process(event){
    var statements = pageConfig.statements;
    var eventContext = new EventContext(event);

    try{
      statements.forEach(function(statement){
        runStatement(statement, eventContext);
      })
    } catch(e){console.info('statement failed',e)}
  }
        
  if (!hasExtentions(pageConfig, evolvEvent)){
    process(evolvEvent);
  } else {
    deferredExtendEvent(pageConfig, evolvEvent)
      .then(event =>{
        if (event) process(event)
      });
  }
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
  var configKeys = Object.keys(config);

  configKeys.forEach(function(key){
    try{
      var pageConfig = findMatchingConfig(config[key] || []);
      if (!pageConfig) return;

      listenToEvents({
        events: pageConfig.events, 
        check: areStatementsReady.bind(null, pageConfig),
        emit: processStatements.bind(null, pageConfig), 
        poll: pageConfig.poll
      });
    } catch(e){console.info('Evolv: Analytics not setup for', key)}
  })
}