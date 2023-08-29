
import { processMetric } from "../src/metric";
import { Observables } from "../src/observables";
import { resetTracking } from "../src/track";

var event = jest.fn(x=>x);
var bind = jest.fn(x=>x);

window.evolv = {
  client: {emit: event},
  context: {set: bind}
}

test('single metric to bind', () => {
  window.testValue = 5;
  resetTracking();
  Observables.test = ()=>({subscribe(fnc){console.info('running')||fnc(5)}});

  let metric = {
    value: 5,
    source: "test",
    key: "fixed",
    tag: "test",
    type: "number",
    action: "bind"
  };

  processMetric(metric,{})
  // expect(bind.mock.calls[0]).toBe(["test", 5]);
  // expect(window.evolv.metrics.executed.length).toBe(1);
});

// test('single metric to emit', () => {
//   resetTracking();


// });


// test('test inheritance', () => {

// });

// test('test inheritance', () => {

// });


// test('test inheritance with when', () => {

// });