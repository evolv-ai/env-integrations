
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
  Observables.test = ()=>({subscribe(fnc){fnc(5)}});

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

<<<<<<< Updated upstream
=======
test('test polling context with no match', () => { 
 
  window.testValue = undefined;

  let metric = {
    when: 'notavail',
    value: '4',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0)
});
>>>>>>> Stashed changes

// test('test inheritance with when', () => {

<<<<<<< Updated upstream
// });
=======
test('test polling context with one match and one no match', () => {  
  window.testValue = undefined;

  let metric = {
    when: 'avail',
    value: '5',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [{...metric,when:'notavail', value: '4'}, metric],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('5');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('single metric to emit', () => {
  window.testValue = "avail";

  let metric = {
    when: 'avail',
    tag: "test",
    action: "event"
  };

  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric]
  };

  processMetric(metric, context);

  //reqired because we have to delay because of our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('single metric to emit second try', () => {
  window.testValue = "avail";

  let metric = {
    tag: "test2",
    action: "event",
  };

  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric]
  };

  processMetric(metric, context);

  //reqired because we have to delay because of our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test2');
  expect(evolv.metrics.executed.length).toBe(1)
});



// to test eval_now
test('test polling context with extra layer for conditions', () => { 
  window.testValue = undefined;
  window.testSecondValue = "test";

  let metric = {
    when: "test",
    tag: "test5",
  };
  let context = {
    source: "expression",
    "action": "event",
    key: "window.testValue",
    apply: [
      { 
        "key": "window.testSecondValue",
        apply:[metric]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test5');
});

test('test polling context with extra layer for conditions', () => { 
  window.testValue = undefined;
  window.testSecondValue = "test";

  let metric = {
    when: "test",
    tag: "test6",
  };
  let context = {
    source: "expression",
    "action": "event",
    key: "window.testValue",
    eval_now: true,
    apply: [
      { 
        "key": "window.testSecondValue",
        apply:[metric]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)
});

test('test polling context with extra layer for conditions', () => { 
  window.testValue = undefined;
  window.testSecondValue = "test";

  let metric = {
    when: "test",
    tag: "test7",
  };
  let context = { 
    source: "expression",
    "action": "event",
    key: "window.testValue",
    eval_now: true,
    apply: [
      {  
        "key": "window.testSecondValue",
        apply:[metric]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test7');
  expect(evolv.metrics.executed.length).toBe(1)
});
>>>>>>> Stashed changes
