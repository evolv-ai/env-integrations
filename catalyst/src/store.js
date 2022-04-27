
export function initializeStore(rule){
  return {
    instrumentDOM: function(data){
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