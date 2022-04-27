

export function activeCombinations(event){  
  var eid = event.eid;
  var combinations = getStoredCombinations(eid);

  return (combinations.length >0)
         ? extendEvent(event, combinations)
         : {};
}

var events = [];

export function deferredActiveCombinations(event){
  var env = window.evolv.client.environment;
  var eid = event.eid;
  var combinations = getStoredCombinations(eid);
  if (combinations){
    return new Promise((resolve, reject) => resolve(extendEvent(event, combinations)));
  } else {
    return fetchActiveExperiments(env)
      .then(experiments=>extendEvent(event, getActiveCombinationIds(eid, experiments)))
  }
}

function getActiveCombinationIds(eid, experiments){
  try{
    var activeEids = experiments.map(e=>e.id);
    var currentExperiment = experiments.find(e=>e.id === eid);
    var activeCombinationIds = currentExperiment?._candidates.map(c=>c?.ordinal);

    cleanupStoredCombinations(activeEids);
    setStoredCombinations(eid, activeCombinationIds);
    return activeCombinationIds;
  } catch(e){
    console.info('evolv: failed to retrieve active combinations', e);
    return null;
  }
}

function extendEvent(event, activeCombinations){
  //validate
  var isControl = event.ordinal === Math.min.apply(null, activeCombinations);
  
  return {
    activeCombinations: isControl ? activeCombinations.join('|') : '',
    controlTag: isControl ? '(Control)' : ''
  };
}

const CombinationKey = 'evolv:active-combinations';
const BaseUrl = 'https://participants.evolv.ai/v1/'

var fetchPromise = null;
function fetchActiveExperiments(env){
  if (!fetchPromise){
    fetchPromise = fetch(BaseUrl + env)
      .then(response=> response.json())
      .then(data=> data._experiments)
  }
  return fetchPromise;
}

function getStore(){
  try{
    var str = window.localStorage.getItem(CombinationKey)
    if (!str){
      str = '{}';
      window.localStorage.setItem(CombinationKey, str);
    }
    return JSON.parse(str)
  } catch(e){
    console.info('evolv active combinations not available',e);
    return {};
  }
}

function getStoredCombinations(eid){
  return getStore()[eid];
}

function setStoredCombinations(eid, combinations){
  var store = getStore();
  store[eid] = combinations;

  try {
    window.localStorage.setItem(CombinationKey, JSON.stringify(store));
  } catch(e){}
}


function cleanupStoredCombinations(eids){
  var store = getStore();
  var newStore = eids.reduce((a,eid)=> ({...a, [eid]:store[eid]}), {});

  window.localStorage.setItem(CombinationKey, JSON.stringify(newStore));
}