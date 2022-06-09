
var nodeCounts = 0;
function observeDepthNodes(node, selectors, cb){
  var index = ++nodeCounts;
  var selector = selectors[0];
  var paralellSelectors = Array.isArray(selector) ?selector :[selector]
  var remainingSelectors = selectors.slice(1);

  // console.info('Observing', node, selectors, paralellSelectors);

  var monitor = e=>{
    requestAnimationFrame(()=>{
    try{
      // console.info('mutationobservation', node, selectors, paralellSelectors)
      if (selectors.length === 0){
        if (cb(node, e)){
          mo.disconnect();
          return;
        }
      } else {
        // console.info('paralell', paralellSelectors)
        paralellSelectors = paralellSelectors.filter((s)=>{
          var newNodes = node.querySelectorAll(s);
          // console.info('checking paralell', s, newNodes)
          if (newNodes.length === 0) true;
          Array.from(newNodes).forEach(node=> 
            observeDepthNodes(node, remainingSelectors, cb)
          )
          return false;
        });

        // console.info('parlalellSelectors', paralellSelectors) 
        if (paralellSelectors.length === 0) mo.disconnect();
      }
    } catch(e){
      console.info('stopping mutation observer', e)
      mo.disconnect();
    }
    });
  }

  var mo = new MutationObserver(monitor);
  mo.observe(node, {childList:true, subtree:true})
  requestAnimationFrame(()=>monitor([]));
}


function matchSelector(root, selector, markedSet, cb){
  var items = root.querySelectorAll(selector)
  // console.info('matchSelector', root, selector, items, markedSet)
  Array.from(items)
    .filter(el => !markedSet.has(el))
    .forEach(el=> {
      // console.info('passed filter', el)
      markedSet.set(el, true);
      cb(el);
    });
  }

function matchSelectorOnce(el, selector, cb){
  var item = el.querySelector(selector)
  // console.info('matchingSelectorOnce', el, selector, item)
  if (item){
    cb(item);
    return true;
  }
}


export function observeSelectors(scopeSelectors, selector, onlyOnce, cb){
  if (typeof onlyOnce === 'function'){
    cb = onlyOnce;
    onlyOnce = false;
  }
  var markedSet = new Map();
  // console.info('observingSelectors', scopeSelectors, selector);
  observeDepthNodes(document, scopeSelectors, (root, mutations)=>{
    if (onlyOnce){
      return matchSelectorOnce(root, selector, cb)
    } else {
      matchSelector(root, selector, markedSet, cb)
    }
  })
}
export function observeSelector(selector, onlyOnce, cb){
  if (typeof onlyOnce === 'function'){
    cb = onlyOnce;
    onlyOnce = false;
  }
  observeDepthNodes(document, [], (root, mutations) =>{
    if (onlyOnce){
      return matchSelectorOnce(root, selector. cb)
    } else {
      matchSelector(root, selector, markedSet, cb)
    }  
  })
}

export function startObserving(nodes, cb){
    observeDepthNodes(document, nodes, cb)
}


// startObserving([['#gridwall-wrapper'], ['.gnav20-navigation-item']])

