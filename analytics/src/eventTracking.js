
// {lastInteraction: 1718914875654, sentEvents}
const StorageKey = 'uid:unique_confirmations';

let sentEvents = {//default values - to be updated from localStorage
  confirmed: [],     //eids
  contaminated: [],  //eids
  others: []         //event tags
};

function eventList(eventType){
  return sentEvents[eventType] || sentEvents.others;
}

function loadSession(indicator){
  const SessionDuration = 30*60*1000;
  let data = localStorage.getItem(StorageKey);
  let now = new Date().getTime();

  if (!data) return;

  data = JSON.parse(data);
  if (data.lastInteraction + SessionDuration < now) return;

  sentEvents = data.sentEvents || sentEvents;
}

function updateSession(){
  localStorage.setItem(StorageKey, JSON.stringify({
    lastInteraction: new Date().getTime(),
    sentEvents
  }));
}

function hasSent(eventType, allocation){
  let cid = allocation.cid;
  return eventList(eventType).includes(cid || eventType)
}

function markAsSentLocal(eventType, allocation){
  let cid = allocation.cid;
  return eventList(eventType).push(cid || eventType)
}

function markAsSentSession(eventType, allocation){
  markAsSentLocal(eventType, allocation);
  updateSession();
}


export function eventTracking(perSessionFlag){
  if (perSessionFlag) {
    loadSession(perSessionFlag);
  }
  const markAsSent = perSessionFlag ? markAsSentSession : markAsSentLocal;
  return {hasSent, markAsSent};
}
