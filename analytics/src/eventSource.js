import { EventContext } from "./eventContext";

const DefaultCookieKey = 'evolv-confirmation-events';
const DefaultDomKey = 'body';
const DefaultDomAttribute = 'data-evolv-server';

export function getSource(config){
    const {type, key, attribute} = config.pageOptions?.source || {};
    switch (type){
        case 'cookie': 
            return {
                async on(eventType, fnc){
                    if (eventType === 'confirmed'){
                        const events = takeEventsFromCookie(key || DefaultCookieKey);
                        events.forEach(ev=>fnc(new EventContext({...ev,  event_type: eventType})));
                    }
                }
            };
         case 'dom': 
            return {
                async on(eventType, fnc){
                    if (eventType === 'confirmed'){
                        const events = await getEventsFromDom(key || DefaultDomKey, attribute || DefaultDomAttribute);
                        events.forEach(ev=>fnc(new EventContext({...ev,  event_type: eventType})));
                    }
                }
            };
        default: 
            return {
                on(eventType, fnc){
                    window.evolv.client.on(eventType, (_, name)=>{
                        var events = extractEvents(eventType, name);
                        events.forEach(async ev=>{
                            const event = new EventContext({event_type: eventType, ...ev});
                            if (!name){
                                await event.prepareProjectName();
                            }
                            fnc(event)
                        });
                    });
                }
            }
    }
}

export function getCookieValue(name) {
    var cookie = document.cookie.split(';')
        .find(function(item) {return item.trim().split('=')[0] === name });
    if (!cookie) return null;

    return cookie.split('=')[1];
}

const durationInMinutes = 60*30;

export function setCookieValue(name, value){
    // const val = encodeURIComponent(value);
    const age = durationInMinutes*60; //age is session - todo: add option
    document.cookie = `${name}=${value}; max-age="${age}"; path=/;`;
}

function takeEventsFromCookie(key){
    const value = getCookieValue(key);
    if (!value) return [];

    const events = parseEvents(value);
    //clearCookieValue(key);
    return events;
}

function getEventsFromDom(selector, attribute){
    return new Promise((resolve) => {
        const listener = (_, el) => {
          const data = el.getAttribute(attribute);
          resolve(parseEvents(data));
        };
    
        $mu(selector).customMutation(listener);
      });
}

function parseEvents(value){
    const eventValues = value.split('|');
    const events = eventValues.map(event =>{
        const [ordinal, group_id, cid, project_name] = event.split(',');
        const eid = (cid || '').split(':')[1];
        return { 
            cid, eid, ordinal, group_id, project_name,
            event_type: "confirmed",
            uid: window.evolv.context.uid,
        }
    })
    return events;
}

const eventKeys = {
    confirmed: 'experiments.confirmations',
    contaminated: 'experiments.contaminations'
  };
  
  function findAllocation(cid) {
    var allocations = window.evolv.context.get('experiments').allocations;
    for (let i = 0; i < allocations.length; i++) {
        if (allocations[i].cid === cid) return allocations[i];
    }
  }
  
  export function extractEvents(eventType, name) {
    var eventKey = eventKeys[eventType];
    if (eventKey){  
      var candidates = window.evolv.context.get(eventKey) || [];
      return candidates.map(function(candidate) {
        return findAllocation(candidate.cid)
      });
    } else {
      return [{event_type: name, uid: window.evolv.context.uid}]
    }
  }
