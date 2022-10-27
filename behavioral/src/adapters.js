import { isNewSession } from './session.js' 

function appendTag(tag, string){
  if (!string){
    return tag;
  }
  if (string.includes(tag)){
    return string
  } else {
    return `${string}|${tag}`
  }
}

export const adapters = {
  returnVisitor: function(config, oldState, behavioralData){
    var newState = Object.assign({}, oldState)

    if (isNewSession(behavioralData, config.inactiveMinutes)){
      newState.status = true;
      newState.firstSessionPage = true;
    } else {
      newState.status = newState.status || false;
      newState.firstSessionPage = false;
    }

    var focus = config.focus
    if (focus){
      var tags = Object.keys(focus);
      tags.forEach(function(tag){
        var files = focus[tag];
        var matched = files.some(function(filePattern){
          return new RegExp(filePattern, 'i').test(location.href)
        })

        if (matched){
          newState.focus = appendTag(tag, newState.focus);
        }
      })
    } else{
      delete newState.focus;
    }
    return newState;
  }
}
