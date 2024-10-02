
var emitted = {}
export function sendEvent(tag){
  if (emitted[tag]) return;

  emitted[tag] = true;
  try {
    window.evolv.client.emit(tag);
  } catch (e) {
    console.info('evolv not available for emit', tag)
  }
}