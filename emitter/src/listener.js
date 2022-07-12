// import {observeSelector} from './observer.js';
import {observeSelectors} from '../../core/src/observer.js';

var allListeners = [];
export function addListener(el, eventType, cb){
  el.addEventListener(eventType, cb);
  allListeners.push({el, eventType, cb});

  // el.classList.add(`evolv-list-${eventType}`)
  // console.info(`addListener: '${eventType}'`, [el])
}

export function removeAllListeners(){
  allListeners.forEach(l=>
    //console.info('removing listeners', l) ||
    l.el.removeEventListener(l.eventType, l.cb)
  )
  allListeners = [];
}

export function listenForEvent(event, cb){
  var activate = event.activate || {on: 'pageload'}
  var monitor = event.monitor || {'type': 'observer', selectors:['body']}

  // console.info('emitter: listening for event', event, activate)
  if (activate.on === 'pageload'){   //send page load events
    return cb();
  }

  let targetSelector = activate.selector;
  let onlyOnce = (monitor.type === 'listener');
  let itemSelector = onlyOnce ?monitor.selector : activate.selector;
  
  let scopingSelectors;
  if (monitor.selectors){
    scopingSelectors = monitor.selectors[0] === 'body' 
                     ? monitor.selectors
                     : ['body', monitor.selectors]
  } else {
    scopingSelectors = monitor.selector === 'body' 
                     ?[] 
                     :['body']
  }

  let actionTypes = (activate.on).split(' ')

  observeSelectors(scopingSelectors, itemSelector, onlyOnce, el=>
    actionTypes.forEach(eventType=> 
      addListener(el, eventType, e=> {
        // console.info('received event', eventType, el)
        if (e.target.closest(targetSelector)){
          cb();
        }
      })
    )
  )
}
