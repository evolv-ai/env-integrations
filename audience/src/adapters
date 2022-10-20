var MacroSet = {
  map: function(array){
    return function(tokens){
      return array.map(function(n){return adapters.getExpressionValue(tokens, n)});
    }
  }
};
function bindMacro(macro, data){
  var fnc = MacroSet[macro];
  if (!fnc){
    return function(){ console.info('Warning: ', macro, ' not a valid macro');};
  }
  return fnc(data);
}

function tokenizeExp(exp){
  return Array.isArray(exp) ? exp : exp.split('.');
}

export const adapters = {
  getExpressionValue(exp, context){
    var tokens = tokenizeExp(exp);
    var result = context || window;
    
    if (tokens[0] === 'window') tokens = tokens.slice(1);

    while(tokens.length > 0 && result){
      var token = tokens[0];
      tokens = tokens.slice(1);
      var openPos = token.indexOf('(');
      if (openPos > 0){
        try{
          var closingPos = token.indexOf(')');
          var param = token.slice(openPos+1, closingPos);
          token = token.slice(0,openPos);
          var fnc = result[token];

          if (typeof fnc === 'function'){
            result = fnc.apply(result, [param]);
          } else if (token[0] === '@'){
            var macro = bindMacro(token.slice(1), result);
            result = macro(param)
          }
          else
            result = undefined;
        }
        catch(e){}
      } else {
        if (!result[token] && tokens.length > 0){ //try flattened object index
          token = token + '.' + tokens[0];
          tokens = tokens.slice(1);
        }
        result = result[token];
      }
    }
    return result;
  },
  setExpressionValue: function(exp, values, append){
    var tokens = tokenizeExp(exp);
    var key = tokens.pop();
    var obj = adapters.getExpressionValue(tokens);
    
    if (!obj) return;
  
    if (append){
      obj[key] += values;
    } else{
      obj[key] = values;
    }
  },
  getFetchValue: function(fetchData) {
    var url = fetchData.url || '';
    var method = fetchData.method || 'POST'
    var data  = fetchData.data || {};
    return fetch(url, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    })
    .then(function(response){return response.json();})
    .then(function(response){
      var expression = fetchData.expression || null;
      var store = fetchData.bindTo || null;
      var data = response.data;
      var value = adapters.getExpressionValue(expression, data);
      if (store){
        adapters.setExpressionValue(store, data);
      }
      if (!value) return '';
      
      return value.toString();
    })
  },
  getCookieValue: function(name) {
    var cookie = document.cookie.split(';')
        .find(function(item) {return item.trim().split('=')[0] === name });
    if (!cookie) return null;

    return cookie.split('=')[1];
  },
  getDomValue: function(sel) {
    return document.querySelector(sel)  && 'found';
  },
  getJqDomValue: function(sel) {
    return window.$ && ($(sel).length > 0)  && 'found';
  },
  getQueryValue: function(name) {
    var queryRegEx = new RegExp(`\\?.*${name}=([^&|\n|\t\s]+)`)
    var queryMatch = location.href.match(queryRegEx);
    if (queryMatch) {
        return queryMatch[1];
    } else {
        return null;
    }
  }
}
