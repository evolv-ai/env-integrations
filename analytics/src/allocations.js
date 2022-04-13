
var eventKeys = {
  confirmed: 'experiments.confirmations',
  contaminated: 'experiments.contaminations'
};

function findAllocation(cid) {
  var allocations = window.evolv.context.get('experiments').allocations;
  for (let i = 0; i < allocations.length; i++) {
      if (allocations[i].cid === cid) return allocations[i];
  }
}

export function sendAllocations(eventType, emit, sentEventAllocations) {
  var sentAllocations = sentEventAllocations[eventType] || sentEventAllocations.others;
  var eventKey = eventKeys[eventType] || '';
  var candidates = window.evolv.context.get(eventKey) || [];

  for (let i = 0; i < candidates.length; i++) {
    try{
      var cid = candidates[i].cid
      if (!sentAllocations[cid]){
        emit(eventType, findAllocation(cid))
        sentAllocations[cid] = true;
      }
    } catch(e){console.info('Evolv: Analytics not sent', e);}
  }
}