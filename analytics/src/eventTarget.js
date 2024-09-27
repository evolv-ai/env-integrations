import { getExpression, runStatement } from "./statement";

const DefaultEnvironment = document.querySelector("[data-evolv-environment]")?.getAttribute("data-evolv-environment");

export function isDestinationReady(config){
    return areStatementsReady(config);
}

export function processDestination(pageConfig, eventType, evolvEvent){
    if (pageConfig.target){
        processTarget(pageConfig.target, evolvEvent);
    }
    if (pageConfig.statements){
        processStatements(pageConfig, eventType, evolvEvent);
    }
}


function processTarget(target, evolvEvent){
    const event = evolvEvent.event;
    const {event_type, uid, eid, cid} = event;

    const env = target.environment || DefaultEnvironment;
    
    const apiUrl = `https://participants.evolv.ai/v1/${env}`;
    const queryParams = `?type=${mapEventType(event_type)}&uid=${uid}&eid=${eid}&cid=${cid}`;

    fetch(`${apiUrl}/events${queryParams}`);
    fetch(`${apiUrl}/data${queryParams}`);

}

function mapEventType(eventType){
    switch(eventType){
        case 'confirmed': return 'confirmation'
        case 'contaminated': return 'contamination'
        defult: return eventType
    }
}


function processStatements(pageConfig, event_type, event){
    try{
      var statements = pageConfig.statements;
      statements.forEach(function(statement){
        if (statement.event_type === event_type || !statement.event_type) {
          runStatement(statement, event);
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
