
function defaultBehaviors(){
  var currentTime = new Date().getTime();
  return {
    createdAt: currentTime,
    updatedAt: currentTime,
    behaviors: {}
  };
}

export function getbehaviors(){
  var data = window.localStorage.getItem('evolv:behaviors');

  if (data){ 
    return JSON.parse(data);
  } else {
    return defaultBehaviors();
  }
}

export function setBehaviors(behaviors){
    window.localStorage.setItem('evolv:behaviors', JSON.stringify(behaviors));
}
