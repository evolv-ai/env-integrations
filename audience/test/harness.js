
//nuf said
////////////////////////////////////////////////
import {processAudience} from '../src/audience.js'
import data from './config.json'

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
  () => window.evolv && window.evolv.context, 
  ()=> processAudience(data),
  {duration: 900000, interval:20}
)