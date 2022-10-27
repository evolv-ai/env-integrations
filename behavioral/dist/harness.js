(function () {
    'use strict';

    function isNewSession(behavioralData, inactiveMinutes){
        var currentTime = new Date().getTime();
        if (!inactiveMinutes){
            inactiveMinutes = 30;
        }
        return behavioralData.updatedAt < (currentTime - (inactiveMinutes *60*1000));
    }

    function appendTag(tag, string){
      if (!string){
        return tag;
      }
      if (string.includes(tag)){
        return string
      } else {
        return `${string}|${tag}`
      }
    }

    const adapters = {
      returnVisitor: function(config, oldState, behavioralData){
        var newState = Object.assign({}, oldState);

        if (isNewSession(behavioralData, config.inactiveMinutes)){
          newState.status = true;
          newState.firstSessionPage = true;
        } else {
          newState.status = newState.status || false;
          newState.firstSessionPage = false;
        }

        var focus = config.focus;
        if (focus){
          var tags = Object.keys(focus);
          tags.forEach(function(tag){
            var files = focus[tag];
            var matched = files.some(function(filePattern){
              return new RegExp(filePattern, 'i').test(location.href)
            });

            if (matched){
              newState.focus = appendTag(tag, newState.focus);
            }
          });
        } else {
          delete newState.focus;
        }
        return newState;
      }
    };

    function defaultBehaviors(){
      var currentTime = new Date().getTime();
      return {
        createdAt: currentTime,
        updatedAt: currentTime,
        behaviors: {}
      };
    }

    function getbehaviors(){
      var data = window.localStorage.getItem('evolv:behaviors');

      if (data){ 
        return JSON.parse(data);
      } else {
        return defaultBehaviors();
      }
    }

    function setBehaviors(behaviors){
        window.localStorage.setItem('evolv:behaviors', JSON.stringify(behaviors));
    }

    function updateBehaviorContext(contextBase, behaviors){
        var behaviorKeys = Object.keys(behaviors);
        var contextbehaviors = {};

        behaviorKeys.forEach(function(behaviorKey){
            var behavior = behaviors[behaviorKey];
            var valueKeys = Object.keys(behavior);
            valueKeys.forEach(function(valueKey){
                var key = `${contextBase}.${behaviorKey}.${valueKey}`;
                contextbehaviors[key] = behavior[valueKey];
            });
        });
        window.evolv.context.update(contextbehaviors);
    }

    //import { Spa } from './spa.js'
    // Spa.initListener();

    function setupBehaviors(json){
      var behaviors = json.behaviors || {};
      var contextKey = json.contextBase || 'behaviors';
      try{
        var behaviorData = getbehaviors(); //includes timestamps and metadata
        var behaviorState = behaviorData.behaviors; //just the behaviors
        var adapterKeys = Object.keys(behaviors);

        var currentTime = new Date().getTime();

        adapterKeys.forEach(function(adapterKey){
          try{
            var behavior = behaviors[adapterKey];
            var adapterState = behaviorState[adapterKey];

            if (!adapters[adapterKey]) {
                console.warn('evolv behavior not available:', adapterKey);
                return;
            }

            if (!behavior.disabled){
                behaviorState[adapterKey] = adapters[adapterKey](behavior, adapterState, behaviorData);
            } else {
                behaviorState[adapterkey] = null;
            }
            } catch(e){console.info('evolv behavior adapter failed:', adapterKey);}
        });

        behaviorData.updatedAt = currentTime;

        setBehaviors(behaviorData);
        updateBehaviorContext(contextKey, behaviorState);
      } catch(e){}
    }

    var contextBase = "behaviors";
    var behaviors = {
    	returnVisitor: {
    		inactiveMinutes: 3,
    		focus: {
    			stream: [
    				"/stream/"
    			],
    			sattelite: [
    				"/satellite/"
    			]
    		}
    	}
    };
    var data = {
    	contextBase: contextBase,
    	behaviors: behaviors
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
        } catch(e){console.info('listener not processed', e);}
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

    invokeIntegration(() => setupBehaviors(data));

})();
