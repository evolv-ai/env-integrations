

export function activeCombinations(event){  
  var eid = event.eid
  var combinations = getStoredCombinations(eid);

  return extendEvent(event, combinations)
}

var hasFetchedResults = false;

export function deferredActiveCombinations(event){
  var env = window.evolv.client.environment;
  var eid = event.eid
  var combinations = getStoredCombinations(eid);
  if (hasFetchedResults || combinations) return null; //no deferred processing

  return fetchActiveExperiments(env)
    .then(experiments=>{
      try{
        var activeEids = experiments.map(e=>e.id);
        var currentExperiment = experiments.find(e=>e.id === eid)
        var activeCombinationIds = currentExperiment?._candidates.map(c=>c?.ordinal)
        hasFetchedResults = true;

        cleanupStoredCombinations(activeEids)
        setStoredCombinations(eid, activeCombinationIds)
        return activeCombinations(event)
      } catch(e){
        console.info('evolv: failed to retrieve active combinations', e)
        return null;
      }
    })  
}

function extendEvent(event, activeCombinations){
  //validate
  var isControl = event.ordinal === Math.min.apply(null, activeCombinations)
  return {
    activeCombinations: activeCombinations.join('|'),
    tag: isControl ? '(Control)' : ''
  }
}

const CombinationKey = 'evolv:active-combinations';
const BaseUrl = 'https://participants.evolv.ai/v1/'

function fetchActiveExperiments(env){
  return fetch(BaseUrl + env)
    .then(response=> response.json())
    .then(data=> data._experiments)
}

function getStore(){
  try{
    var str = window.localStorage.getItem(CombinationKey)
    if (!str){
      str = '{}';
      window.localStorage.setItem(CombinationKey, str)
    }
    return JSON.parse(str)
  } catch(e){
    console.info('evolv active combinations not available',e)
    return {};
  }
}

function getStoredCombinations(eid){
  return getStore()[eid]
}

function setStoredCombinations(eid, combinations){
  var store = getStore();
  store[eid] = combinations;

  try {
    window.localStorage.setItem(CombinationKey, JSON.stringify(store))
  } catch(e){}
}


function cleanupStoredCombinations(eids){
  var store = getStore();
  var newStore = eids.reduce((a,eid)=> ({...a, [eid]:store[eid]}), {})

  window.localStorage.setItem(CombinationKey, JSON.stringify(newStore))
}