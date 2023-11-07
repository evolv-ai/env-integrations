
//nuf said
////////////////////////////////////////////////
import {processConfig} from '../src/metrics.js';
import data from './test.json';
// import data from './dutch.json';
// import data from './luluandgeorgia.json';
// import data from './babyphat.json';
// import data from './lln.json'
// import data from './vbg.json';
// import data from './a&e.json';
// import data from ./acc.json';
// import data from './safelite.json';

function loadScript(path){
  var scriptNode = document.createElement('script');
  scriptNode.setAttribute('src', path);
  document.head.appendChild(scriptNode);
}

function waitFor(check, invoke, poll){
  if (check()){
      invoke();
      return;
  }
  var polling = setInterval(function(){
    try{
      if (check()){
        invoke();
        clearInterval(polling);
        polling = null;
      }
    } catch(e){console.info('listener not processed')}
  }, poll.interval)
  setTimeout(function(){ 
      if (!polling) return
      
      clearInterval(polling)     
      console.info('evolv render listener timeout', poll)
      window.evolvRenderTimeout = {
          msg:'evolv render listener timeout', poll: poll
      }
  }, poll.duration)
}

waitFor(
  () => true, //window.evolv && window.evolv.context && window.evolv.collect, 
  ()=> processConfig(data),
  {duration: 900000, interval:20}
)