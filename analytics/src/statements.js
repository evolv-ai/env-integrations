import { EventContext } from "./eventContext";
import { getExpression, runStatement } from "./statement";

export function processStatements(pageConfig, event_type, evolvEvent){
  var statements = pageConfig.statements;
  var eventContext = new EventContext({...evolvEvent, event_type});
  eventContext.initializeAsync().then(()=>{
    try{
      statements.forEach(function(statement){
        if (statement.event_type === event_type || !statement.event_type) {
          runStatement(statement, eventContext);
        }
      })
    } catch(e){console.info('statement failed',e)}
  });
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
