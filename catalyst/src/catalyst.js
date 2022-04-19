import {initializeSandbox} from './sandbox.js';

export function initializeCatalyst(){
  var renderRule = initializeSandbox('_general');
  renderRule.sandboxes = [];

  let renderRuleProxy = new Proxy(renderRule, {
    get(target, name, receiver) {
        let rv = Reflect.get(target, name, receiver);
        if (!rv) {
            target[name] = initializeSandbox(name); 
            rv = Reflect.get(target, name, receiver);
            renderRule.sandboxes.push(rv);
        }
        rv.lastAccessTime = new Date().getTime();
        return rv;
    }
  });

  const spaCleanupThreshold = 500;
  function isFreshAccess(sb){
    if (sb.isActive) return sb.isActive();
    return (sb.lastAccessTime + spaCleanupThreshold) > new Date().getTime();
  }
  
  function clearOnNav(){
    var activeSandboxes = [];
    try{  
      activeSandboxes = renderRule.sandboxes.filter(function(sb){
        if (isFreshAccess(sb)){
          sb.reactivate();
          return true;
        }

        if(sb.triggerHandler && sb.triggerHandler.clearIntervalTimer){
          sb.triggerHandler.clearIntervalTimer();
        }
        renderRuleProxy[sb.exp] = null;
      });
    } catch(e){console.info('evolv: warning terminating for spa', e);}
    console.info('evolv active sandboxes after spa', activeSandboxes);
    renderRule.sandboxes = activeSandboxes;
  }
  
  window.addEventListener('popstate', clearOnNav);
  window.addEventListener('stateupdate_evolv', clearOnNav);

  return renderRuleProxy;
}

function pageMatch(page){
  if (!page) return false;

  return new RegExp(page).test(location.pathname);
}

window.evolv = window.evolv || {} ;

export function processConfig(config){
  var pages = config.pages || ['.*'];
  var matches = pages.some(pageMatch);
  var evolv = window.evolv;
  if (matches){
    if (window.evolv.catalyst) return window.evolv.catalyst;

    evolv.catalyst = initializeCatalyst();
    evolv.renderRule = evolv.catalyst
    return evolv.catalyst;
  }
}
