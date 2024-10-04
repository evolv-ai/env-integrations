

export function tokenizeExp(exp){
  return Array.isArray(exp) ? exp : exp.split('.')
}

function setExpression(exp, values, append, context){
  var tokens = tokenizeExp(exp)
  var key = tokens.pop();
  var obj = getExpression(tokens);

  console.info('setExpression', values)

  if (context.isLocalVar(key)){
    obj = context.localVars;
  }

  if (!obj) return;

  if (append){
    obj[key] += values;
  } else{
    obj[key] = values;
    console.info('values bound', key, obj[key])

  }
}

function invokeExpression(exp, args, init){
  var tokens = tokenizeExp(exp);
  var fncKey = tokens.pop();
  var obj = getExpression(tokens, true);
  if (typeof obj[fncKey] !== 'function'){
      console.warn('Evolv: Is not proper emit function', obj, fncKey)
      return;
  }

  try {
    if (init){
      return new (Function.prototype.bind.apply(obj[fncKey], [null].concat(args)))
    } else {
      return obj[fncKey].apply(obj, args)
    }
  } catch(e){
    console.warn('Evolv: Could not guarantee success for analytics invocation.')
  }
}

//
export function getExpression(exp, onlyObj){
  var tokens = tokenizeExp(exp);
  var result = window;

  if (tokens[0] === 'window') tokens = tokens.slice(1);

  while(tokens.length > 0 && result){
      var token = tokens[0];
      tokens = tokens.slice(1)

      if (token.indexOf('(')> 0){
          try{
          token = token.slice(0,-2);
          var fnc = result[token]
          if (typeof fnc === 'function')
              result = fnc.apply(result, []);
          else
              result = undefined;
          }
          catch(e){}
      } else {
          var newResult = result[token];
          if (typeof newResult === 'function' && tokens.length === 0 && !onlyObj){
            result = newResult.bind(result);
          } else {
            result = newResult;
          }
      }
  }
  return result;
}


export function runStatement(statement, eventContext){
    // console.info('running statement', statement, eventContext)
  var values;
  
  if (statement.with){
    values = eventContext.extractValue(statement.with);
  } else {
    values = runStatement(statement.withExpression, eventContext);
  }

  if(statement.bind){
    return setExpression(statement.bind, values, false, eventContext)
  }  
  if(statement.append){
    return setExpression(statement.bind, values, true, eventContext)
  }
  if(statement.invoke){
    return invokeExpression(statement.invoke, values);
  }
  if(statement.init){
    return invokeExpression(statement.init, values, true);
  }

  console.info('Evolv: Nothing to run for', this.statement)
}
