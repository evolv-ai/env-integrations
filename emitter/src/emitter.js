import {sendEvent} from './event.js'
import {listenForPage} from './page.js'
import {listenForEvent, removeAllListeners} from './listener.js'
import {addSpaListener} from '../../core/src/spa.js'

//post conditions placeholder
function conditionsAreSatisfied(conditions){
  if (!conditions) return true;

  return true;
}

export function prepareEventsOnPage(events){
  events.forEach(event=>
    listenForEvent(event, ()=>{
      if (conditionsAreSatisfied(event.conditions)){
        sendEvent(event.tag)
      }
    })
  )
}

export function processPages(pages){
  pages.forEach(page=>
    listenForPage(page).then(()=> prepareEventsOnPage(page.events))
  )
}


export function processConfig(config){
  var pages = config.pages;
  processPages(pages);

  addSpaListener(()=>{
    removeAllListeners();
    // processPages(pages);
  })
}

