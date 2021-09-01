
function initializeRender(){

  //debounce code
  function debounce (fn, dur) {
    var timeout;
    return function () {
      clearTimeout(timeout)
      var args = arguments;
      timeout = setTimeout(function () {
        fn.apply(this, args);
      }, (dur || 10))
    }
  }

  // dom manipulation package
  function toNodeValue(sel, context){
    context = context || document;
    if (typeof sel === 'string'){
      if (sel[0] === '<') {
        var div = context.createElement('div');
        div.innerHTML = sel.trim();
        return [div.firstChild]; 
      } else {
        return context.querySelectorAll(sel);
      }
    } else if (sel.constructor === HTMLDivElement){
      return [sel]
    } else if (sel.constructor === Node){
      return sel.el
    } else if (Array.isArray(sel)){
      return sel
    } else {
      return [];
    }
  }
  var Node = function(sel, context){
    context = context || document;
    var el = toNodeValue(sel, context);
    this.el = Array.prototype.slice.call(el)
    this.length = this.el.length;
  }
  Node.prototype.find = function(sel){
    var el = this.el
    return new Node(el.map(function(e){
      return Array.prototype.slice.call(toNodeValue(sel, e))
    }).flat(2))
  }
  Node.prototype.parent = function(){
    var el = this.el
    var parents = el.map(function(e){return e.parentNode})
    parents = parents.filter(function(item, pos){
        return parents.indexOf(item) == pos; 
      });
    return new Node(parents)
  }
  Node.prototype.addClass = function(classString){
    this.el.forEach(function(e){
      classString.split(' ').forEach(function(className){
        e.classList.add(className)
      })
    })
    return this;
  }
  Node.prototype.removeClass = function(className){
    function removeTheClass(e){e.classList.remove(className)}
    this.el.forEach(removeTheClass)
    return this;
  }
  Node.prototype.append = function(item){
    var node = this.el[0];
    if (!node) return;

    var items = toNodeValue(item)
    items.forEach(function(e){node.append(e);});

    return this;
  }
  Node.prototype.insertBefore = function(item){
    node = this.el[0];
    if (!node) {
      console.info('no content for insert') 
      return this;
    }
    if (typeof item === 'string'){
      item = document.querySelectorAll(item);
    } else if (item.constructor === Node){
      item = item.el[0]
    }
    item.parentNode.insertBefore(node, item);
    return this;
  }
  Node.prototype.markOnce = function(attr){
    var results = this.el.filter(function(e){
      return !e.getAttribute(attr);
    })
    results.forEach(function(e){e.setAttribute(attr, true)})
    return new Node(results)
  }
  Node.prototype.on = function(tag, fnc){
    this.el.forEach(function(e){e.addEventListener(tag,fnc)});
    return this;
  }
  Node.prototype.html = function(str){
    this.el.forEach(function(e){e.innerHTML = str;});
    return this;
  }
  Node.prototype.attr = function(attributes){
    this.el.forEach(function(e){
      var keys = Object.keys(attributes);
      keys.forEach(function(key){
          e.setAttribute(key,attributes[key])
      });
    })
    return this;
  }
  var $ = function(sel){
    return new Node(sel);
  }

  //rule instrumentation package
  var store = {
    instrumentDOM: function(data){
      if (data){
        store.cache = data;
      } else {
        data = store.cache;
      }
      var check = function(obj){
        rule
          .when(rule.trigger(function(){ 
            return obj.dom.length >= obj.count || 1
          }))
          .then(function(){
            obj.node = obj.dom.addClass('evolv-' + obj.asClass)
          })
      }
      for(var key in data){
        check(data[key])     
      }
    }
  }

  var rule = window._evolvRule = {
    $: $,
    exp: 'g',
    store: store,
    when: function (trig) {
      var variant = null;
      var hasTriggered = false;
      var gdom = null;
      trig(function (dom) {
        gdom = dom;
        hasTriggered = true;
        if (variant) variant(dom);
      });
      return {
        then: function (fnc) {
          variant = fnc;
          if (hasTriggered) variant(gdom);
        },
      };
    },
    nextIndex: 0,
    whenDOM: function(sel){
      var index = rule.nextIndex++
      return rule.when(rule.trigger(function() {
        var attr = 'evolv-'+ rule.exp + index;
        var results = $(sel).markOnce(attr)
        return results.length > 0 ? results : null;
      }))
    },
    intervalTrigger: function (selFnc) {
      var int = 80;
      var dur = 20000;
      return function(fnc){
        function render() {
          var dom = selFnc();
          if (dom) {
            try{
              fnc(dom);
            } catch(e){
              console.warn('failed variant', e)
              window.evolv.client.contaminate({reason:'variant-failed', details: e}, true)
            }
            clearInterval(interval);
          }
        }
        var interval = setInterval(render, int);
        $(function(){setTimeout(render,200)})
        setTimeout(function () {
          clearInterval(interval);
        }, dur);
      };
    },
      
    intervalTriggerQueue: null,
    queuedIntervalTrigger: function(selFnc){
      if (!this.intervalTriggerQueue){
        this.intervalTriggerQueue = []
        var int = 60;
        var dur = 20000;
        function process() {
          var items = this.intervalTriggerQueue.slice()
          var results;
          do {
            items = results || items
            results = items.filter(function(task){
              var dom = task.selFnc();
              if (dom) {
                try{
                  task.action(dom);
                } catch(e){
                  console.warn('failed variant', e)
                  window.evolv.client.contaminate({reason:'variant-failed', details: e}, true)
                }
              }
              return !dom;
            })
          } while(items.length > results.length)

          this.intervalTriggerQueue = results;
          if (results.length === 0){
            clearInterval(interval);
            interval = null;
          }
        }
        var interval = setInterval(process.bind(this), int);
        $(function(){setTimeout(process.bind(this),1)})
        setTimeout(function () {
          clearInterval(interval);
        }, dur);
      }
      var task = {
        selFnc: selFnc,
        action: function(){}
      }
      this.intervalTriggerQueue.push(task)
      return function(fnc){
        task.action = fnc;
      }
    }
  }

  var validate = {
    lengthGreaterThan: function(val){
      return function(dom){ return dom.length >= val}
    }
  }
}


function pageMatch(page){
  if (!page) return false;

  return new RegExp(page).test(location.pathname);
}

function processNav(config){
  var pages = config.pages || [];
  var matches = pages.some(pageMatch);

  if (matches){
    initializeRender();
  }
}
