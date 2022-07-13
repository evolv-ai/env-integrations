(function () {
  'use strict';

  // dom manipulation package
  function toNodeValue(sel, context){
    context = context || document;
    if (!sel){
      return [];
    } else if (typeof sel === 'string'){
      if (sel[0] === '<') {
        var div = context.createElement('div');
        div.innerHTML = sel.trim();
        return [div.firstChild]; 
      } else {
        return context.querySelectorAll(sel);
      }
    } else if (sel instanceof Element){
      return [sel]
    } else if (sel.constructor === ENode){
      return sel.el
    } else if (Array.isArray(sel)){
      return sel
    } else {
      return [];
    }
  }

  const ENode = function(sel, context){
    context = context || document;
    var el = toNodeValue(sel, context);
    this.el = Array.prototype.slice.call(el);
    this.length = this.el.length;
  };

  //fltering
  ENode.prototype.filter = function(sel){
    var el = this.el;
    if (!sel) return this;
    return new ENode(el.filter(function(e){
      return e.matches(sel)
    }))
  };
  ENode.prototype.contains = function (text) {
    var el = this.el;
    return new ENode(el.filter(function (e) { return e.textContent.includes(text)}));
  };

  //navigation
  ENode.prototype.find = function(sel){
    var el = this.el;
    return new ENode(el.map(function(e){
      return Array.prototype.slice.call(toNodeValue(sel, e))
    }).flat(2))
  };
  ENode.prototype.closest = function(sel){
    var el = this.el;
    return new ENode(el.map(function(e){
      return e.closest(sel)
    }))
  };
  ENode.prototype.parent = function(){
    var el = this.el;
    var parents = el.map(function(e){return e.parentNode});
    parents = parents.filter(function(item, pos){
        return parents.indexOf(item) == pos; 
      });
    return new ENode(parents)
  };
  ENode.prototype.children = function(sel){
    var el = this.el;
    return new ENode(el.reduce(function(a,b){
      return a.concat(Array.prototype.slice.call(b.children))
    }, [])).filter(sel);
  };
  ENode.prototype.next = function(){
    return new ENode(this.el.map(function(e){ 
      return e.nextElementSibling
    }));
  };
  ENode.prototype.prev = function(){
    return new ENode(this.el.map(function(e){ return e.previousElementSibling}));
  };

  //manipulating class
  ENode.prototype.addClass = function(classString){
    this.el.forEach(function(e){
      classString.split(' ').forEach(function(className){
        e.classList.add(className);
      });
    });
    return this;
  };
  ENode.prototype.removeClass = function(className){
    function removeTheClass(e){e.classList.remove(className);}
    this.el.forEach(removeTheClass);
    return this;
  };

  //repositioning and insertion
  ENode.prototype.append = function(item){
    var node = this.el[0];
    if (!node) return;

    var items = toNodeValue(item);
    items.forEach(function(e){node.append(e);});

    return this;
  };

  ENode.prototype.prepend = function(item){
    var node = this.el[0];
    if (!node) return;

    var items = toNodeValue(item);
    items.forEach(function(e){node.prepend(e);});

    return this;
  };
  ENode.prototype.beforeMe = function(item){
    if (typeof item === 'string'){
      item = new ENode(item);
    }
    item.insertBefore(this);
    return this;
  };
  ENode.prototype.afterMe = function(item){
    if (typeof item === 'string'){
      item = new ENode(item);
    }
    item.insertAfter(this);
    return this
  };
  ENode.prototype.insertBefore = function(item){
    var node = this.el[0];
    if (!node) {
      console.info('no content for insert');
      return this;
    }
    if (typeof item === 'string'){
      item = document.querySelectorAll(item);
    } else if (item.constructor === ENode){
      item = item.el[0];
    }
    item.parentNode.insertBefore(node, item);
    return this;
  };
  ENode.prototype.insertAfter = function(item){
    var node = this.el[0];
    if (!node) {
      console.info('no content for insert');
      return this;
    }
    if (typeof item === 'string'){
      item = document.querySelectorAll(item);
    } else if (item.constructor === ENode){
      item = item.el[0];
    }
    item.parentNode.insertBefore(node, item.nextSibling);
    return this;
  };
  ENode.prototype.wrap = function(item){
    return this.el.forEach(function (e) {
      (new ENode(e)).wrapAll(item);
    });
  };
  ENode.prototype.wrapAll = function(item){
    if (typeof item === 'string'){
      item = new ENode(item);
    }
    var wrapper = item.firstDom();
    while (wrapper.children.length) {
      wrapper = wrapper.firstElementChild;
    }
    var innerItem = new ENode(wrapper);

    this.first().beforeMe(item);
    innerItem.append(this);
    return this;
  };

  //
  ENode.prototype.markOnce = function(attr){
    var results = this.el.filter(function(e){
      return !e.getAttribute(attr);
    });
    results.forEach(function(e){e.setAttribute(attr, true);});
    return new ENode(results)
  };

  //listener
  ENode.prototype.on = function(tag, fnc){
    this.el.forEach(function(e){
      tag.split(' ').forEach(function(eventTag){
        e.addEventListener(eventTag,fnc);
      });
    });
    return this;
  };

  //content
  ENode.prototype.html = function(str){
    if (!str) return this.el.map(function(e){return e.innerHTML}).join();

    this.el.forEach(function(e){e.innerHTML = str;});
    return this;
  };
  ENode.prototype.text = function(str){
    if (!str) return this.el.map(function(e){return e.textContent}).join(' ');

    this.el.forEach(function(e){e.textContent = str;});
    return this;
  };
  ENode.prototype.attr = function(attributes){
    if (typeof attributes === 'string'){
      var prop = attributes;
      return this.el.map(function(e){return e.getAttribute(prop)}).join(' ');
    } else {
      this.el.forEach(function(e){
        var keys = Object.keys(attributes);
        keys.forEach(function(key){
            e.setAttribute(key,attributes[key]);
        });
      });
      return this;
    }
  };

  // constructs
  ENode.prototype.each = function(fnc){
    this.el.forEach(function(e){
      var node = new ENode(e);
      fnc.apply(null, [node]);
    });
    return this;
  };

  ENode.prototype.watch = function(options){
    var defaultConfig = {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true
    };
    var config = Object.assign({}, defaultConfig, options || {},);
    var cb;
    var observer = new MutationObserver(function (mutations) {
      if (cb) cb(mutations);
    });
    this.el.forEach(function(e){ observer.observe(e, config);});
    return {then: function(fnc){
      cb = fnc;
    }}
  };

  //getting first and last elements
  ENode.prototype.firstDom = function(){
    return this.el[0];
  };
  ENode.prototype.lastDom = function(){
    return this.el.slice(-1)[0]
  };
  ENode.prototype.first = function(){
    return new ENode(this.firstDom());
  };
  ENode.prototype.last = function(){
    return new ENode(this.lastDom());
  };

  const validator = {
    lengthGreaterThan: function(val){
      return function(dom){ return dom.length >= val}
    },
    contains: function(val){
      return function(dom){ return !!dom.find(val)}
    },
    notContains: function(val){
      return function(dom){ return !dom.find(val)}
    }
  };

  function initializeRule($){
    var rule = {
      when: function(predicate){
        try {
          var trig = this.trigger(predicate);
          var variant = null;
          var hasTriggered = false;
          var gdom = null;
          function runVariant(dom){
            try {
            if (!hasTriggered) return;

            variant(dom);
            } catch(e) {
              console.info('evolv "then" clause failed',e);
            }
          }
          trig(function (dom) {
            gdom = dom;
            hasTriggered = true;
            if (variant) runVariant(dom);
          });
          return {
            thenInBulk: function (fnc) {
              variant = fnc;
              if (hasTriggered) runVariant(gdom);
            },
            then: function (fnc) {
              variant = function(dom){
                gdom.el.forEach(item=> fnc($(item)));
              };
              if (hasTriggered) runVariant(gdom);
            },
            reactivateOnChange: function(config){
              this.thenInBulk(function(obj){
                obj.watch(config)
                  .then(()=>rule.reactivate(config));
              });
            }
          };
        } catch(e){
          console.warn('evolv "when" failed');
        }
      },
      nextIndex: 0,
      whenDOM: function(sel){
        var exp = this.exp;
        var index = rule.nextIndex++;
        return rule.when(function() {
          try{
            var attr = 'evolv-'+ exp + index;
            var results = $(sel).markOnce(attr);
            return results.length > 0 ? results : null;
          } catch (e){ 
            console.warn('Evolv selector may be malformed for', exp, sel);
          }
        })
      },
      whenItem: function(name){
        var exp = this.exp;
        var store = this.store;
        var index = rule.nextIndex++;
        return rule.when(function() {
          try{
            var attr = 'evolv-'+ exp + index;
            var storeRef = store.cache[name];
            if (!storeRef){
              console.warn('evolv invalid item', name);
              return null;
            }
            var results = $('.evolv-' + (storeRef.asClass || name)).markOnce(attr);
            return results.length > 0 ? results : null;
          } catch (e){ 
            console.warn('Evolv instrument key may be malformed for', exp, name);
          }
        })
      }
    };
    return rule;
  }

  function initializeStore(rule){
    return {
      instrumentDOM: function(data){
        var store = rule.store;

        if (data){
          store.cache = Object.assign(store.cache || {}, data || {});
        } else {
          data = store.cache;
        }
        var check = function(obj, key){
          rule
            .when(function(){
              try{
                return obj.dom.length >= (obj.count || 1)
              } catch (e){
                console.warn('Selector may be malformed', e);
              }
            })
            .thenInBulk(function(){
              obj.node = obj.dom;
              if (obj.asClass || key) {
                obj.node.addClass('evolv-' + (obj.asClass || key));
              }
              if (obj.asAttr) {
                  var objAttr = {['evolv-' + obj.asAttr]: true };
                  obj.node.attr(objAttr);
              }            
            });
        };
        for(var key in data){
          check(data[key], key);     
        }
      }
    }
  }

  function initializeIntervalHandler() {
    return {
      triggerHistoryQueue: [],
      triggerQueue: null,
      trigger: function(selFnc){
        if (!this.triggerQueue){
          this.triggerQueue = [];
          this.startProcessing();
        }

        var task = {selFnc: selFnc, action: function(){}};
        this.triggerQueue.push(task);
        this.triggerHistoryQueue.push(task);

        return function(fnc){
          task.action = fnc;
        }
      },
      reactivate: function(){
        this.triggerQueue = this.triggerHistoryQueue.slice(0);
        this.startProcessing(500);
      },
      intervalTimer : null,
      clearIntervalTimer: function(){
        if (this.intervalTimer){
          clearInterval(this.intervalTimer);
          this.intervalTimer = null;
        }
      },
      startProcessing: function(duration){
        var int = 60;
        var dur = duration || 10000;

        this.clearIntervalTimer();

        function process() {
          var baseItems = this.triggerQueue.slice();
          var items = baseItems;

          var results;
          do {
            items = results || items;
            results = items.filter(function(task){
              var dom = task.selFnc();
              if (dom) {
                try{
                  task.action(dom);
                } catch(e){
                  console.warn('failed variant', e);
                  window.evolv.client.contaminate({reason:'variant-failed', details: e}, true);
                }
              }
              return !dom;
            });
          } while(items.length > results.length)

          this.triggerQueue = this.triggerQueue.filter(function(item){
            return results.includes(item) || !baseItems.includes(item)
          });
          if (results.length === 0){
            setTimeout(function(){ //give other calls a chance to join before we end this.
              if (this.triggerQueue.length !== 0) return;

              this.clearIntervalTimer();
            }.bind(this), 30);
          }
        }
        this.intervalTimer = setInterval(process.bind(this), int);
        // $(function(){setTimeout(process.bind(this),1);});
        setTimeout(this.clearIntervalTimer.bind(this), dur);
      }
    };
  }

  var $ = function(sel){
    return new ENode(sel);
  };

  function initializeSandbox(name){
    var sandbox;
    var rule = initializeRule($);
    var store = initializeStore(rule);

    sandbox = rule;

    sandbox.rule = rule;
    rule.store = store;
    rule.exp = name;
    sandbox.app = {};

    sandbox.triggerHandler = initializeIntervalHandler();
    sandbox.validate = validator;

    rule.trigger = function(selFnc){
      return this.triggerHandler.trigger(selFnc)
    };
    rule.reactivate = function(){
      return this.triggerHandler.reactivate()
    };

    sandbox.$ = $;
    sandbox.$$ = function(name){
      var storeRef = store.cache[name];
      if (!storeRef){
        console.warn('evolv invalid item', name);
        return new ENode();
      }
      return new ENode('.evolv-'+(storeRef.asClass || name));
    };

    sandbox.track = function(txt){
      var trackKey = 'evolv-' + this.exp;
      var node = $('body');
      var tracking = node.attr(trackKey);
      tracking = tracking ?(tracking + ' ' + txt) :txt;
      node.attr({[trackKey]: tracking});
      return this;             
    };

    return sandbox;
  }

  function initializeCatalyst(){
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

  function processConfig(config){
    var pages = config.pages || ['.*'];
    var matches = pages.some(pageMatch);
    var evolv = window.evolv;
    if (matches){
      if (window.evolv.catalyst) return window.evolv.catalyst;

      evolv.catalyst = initializeCatalyst();
      evolv.renderRule = evolv.catalyst;
      return evolv.catalyst;
    }
  }

  var data = {
  	
  };

  function invokeIntegration(cb){
    waitFor(
      () => window.evolv, 
      cb,
      {duration: 900000, interval:20}
    );
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
      } catch(e){console.info('listener not processed');}
    }, poll.interval);
    setTimeout(function(){ 
        if (!polling) return
        
        clearInterval(polling);     
        // console.info('evolv render listener timeout', poll)
        window.evolvRenderTimeout = {
            msg:'evolv render listener timeout', poll: poll
        };
    }, poll.duration);
  }

  invokeIntegration(() => processConfig(data));

})();
