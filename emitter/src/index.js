

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

function processEvents(config){
  var events = Object.keys(config);

  events.forEach(function(event){
    var conditions = config[event];
    var matches = pageMatch(conditions.page)

    if (matches){
      sendEvent(event);
    }
  })
}

module.exports = processEvents;
