

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


// {
//   "orderConfirmation.load": {
//     "page": "sales\/digital\/orderconfirmation.html",
//     "dom": null,
//     "poll": {},
//     "on": null
//   }
// }