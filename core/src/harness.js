import {processAnalytics} from '../src/analytics.js'
import data from './data.json'
export function invokeIntegration(cb){
  waitFor(
    () => window.evolv, 
    cb,
    {duration: 900000, interval:20}
  )
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