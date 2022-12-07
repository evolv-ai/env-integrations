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

export function extractAllocations(eventType) {
  var eventKey = eventKeys[eventType] || '';
  var candidates = window.evolv.context.get(eventKey) || [];
  return candidates.map(function(candidate) {
    return findAllocation(candidate.cid)
  });
}