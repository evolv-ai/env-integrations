
var Spa = {
  queue: [],
  addSpaListener: function(topKey, variable, audObj){
    this.queue.push({
      topKey: topKey,
      variable: variable,
      audObj: audObj
    });
  },
  recheck: function(force){
    var priorAudience = Object.assign({}, audience);
    var prevLength = this.recheckQueue.length
    
    this.recheckQueue.forEach(function(l){
      addAudience(l.topKey, l.variable, l.audObj);
    });
    this.recheckQueue = this.recheckQueue.filter(function(l){
      return priorAudience[l.topKey][l.variable] === audience[l.topKey][l.variable];
    });
    if (force || this.recheckQueue.length < prevLength){
        refreshAudience();
    }
    
    console.info('finishing spa update', this.recheckQueue, priorAudience, audience)

    if (this.recheckQueue.length === 0){
      this.terminateRecheck();
    }
  },
  terminateRecheck: function(){
      console.info('recheck is ended', this.recheckQueue)
    clearInterval(this.recheckInterval);
    this.recheckInterval = 0;
  },
  eventHandler: function(){
    if (this.queue === 0) return;

    audience.config.spaNav = 'true'; //

    this.recheckQueue = this.queue.slice(0); 
    this.recheck(true);
//    setTimeout(this.recheck.bind(this),0);//
    this.recheckInterval = setInterval(this.recheck.bind(this), 25)
    setTimeout(this.terminateRecheck.bind(this), 250)
  },
  initListener: function(){
    var listener = this.eventHandler.bind(this);
    window.addEventListener('popstate', listener);
    window.addEventListener('stateupdate_evolv', listener);
  }
}

Spa.initListener();


function sendEvent(tag, url){
  try {
    window.evolv.client.emit(tag);
  } catch (e) {
    console.log(e);
  }
}

function pageMatch(page){
  if (!page) return false;

  return new RegExp(page).test(location.pathname);
}

function processNav(config){
  var events = Object.keys(config);

  events.forEach(function(event){
    var conditions = config[event];
    var matches = pageMatch(conditions.page)

    if (matches){
      sendEvent(event);
    }
  })
}

module.exports = processNav

// {
//   "orderConfirmation.load": {
//     "page": "sales\/digital\/orderconfirmation.html",
//     "dom": null,
//     "poll": {},
//     "on": null
//   }
// }