import {ENode} from './enode.js';
import {validator} from './validator.js';
import {initializeRule} from './rule.js';
import {initializeStore} from './store.js';
import {initializeIntervalHandler} from './intervalHandler.js';

var $ = function(sel){
  return new ENode(sel);
};

export function initializeSandbox(name){
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
    var tracking = node.attr(trackKey)
    tracking = tracking ?(tracking + ' ' + txt) :txt
    node.attr({[trackKey]: tracking});
    return this;             
  };

  return sandbox;
}