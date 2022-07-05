
export function initializeRule($){
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
                .then(()=>rule.reactivate(config))
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
          var results = $('.evolv-'+(storeRef.asClass || name)).markOnce(attr);
          return results.length > 0 ? results : null;
        } catch (e){ 
          console.warn('Evolv selector may be malformed for', exp, sel);
        }
      })
    }
  };
  return rule;
}
