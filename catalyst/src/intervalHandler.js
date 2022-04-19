
export function initializeIntervalHandler() {
  return {
    triggerHistoryQueue: [],
    triggerQueue: null,
    trigger: function(selFnc){
      if (!this.triggerQueue){
        this.triggerQueue = [];
        this.startProcessing();
      }

      var task = {selFnc: selFnc, action: function(){}}
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