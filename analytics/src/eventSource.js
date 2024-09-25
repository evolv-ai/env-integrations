import { extractAllocations } from "./allocations";


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
                        const events = await takeEventsFromCookie(key || DefaultCookieKey);
                        events.forEach(fnc);
                    }
                }
            };
         case 'dom': 
            return {
                async on(eventType, fnc){
                    if (eventType === 'confirmed'){
                        const events = await getEventsFromDom(key || DefaultDomKey, attribute || DefaultDomAttribute);
                        events.forEach(fnc);
                    }
                }
            };
        default: 
            return {
                on(eventType, fnc){
                    window.evolv.client.on(eventType, ()=>{
                        var allocations = extractAllocations(eventType);
                        allocations.forEach(fnc);
                    });
                }
            }
    }
}

function getCookieValue(name) {
    var cookie = document.cookie.split(';')
        .find(function(item) {return item.trim().split('=')[0] === name });
    if (!cookie) return null;

    return cookie.split('=')[1];
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
            cid,
            eid,
            ordinal,
            group_id,
            project_name,
            uid: window.evolv.context.uid,
            offline_event: true
        }
    })
    return events;
}
