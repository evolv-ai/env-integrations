import { EventContext } from "./eventContext";
import { getExpression, runStatement } from "./statement";

export function processStatements(pageConfig, event_type, evolvEvent){
  const event = new EventContext({...evolvEvent, event_type});

  function applyStatements(event){
    try{
      var statements = pageConfig.statements;
      statements.forEach(function(statement){
        if (statement.event_type === event_type || !statement.event_type) {
          runStatement(statement, event);
        }
      })
    } catch(e){console.info('statement failed',e)}
  }


  if (evolvEvent.offline_event){
      applyStatements(event);
  } else {
    event.initializeAsync().then(()=>applyStatements(event));
  }
}

export function areStatementsReady(config){
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
