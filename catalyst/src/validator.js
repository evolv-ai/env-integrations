export const validator = {
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