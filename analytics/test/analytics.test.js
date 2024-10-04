
import { processAnalytics } from "../src/analytics";
import { setCookieValue } from "../src/eventSource";
import { clearTracking } from "../src/eventTracking";

var emit = jest.fn(x=>x);

function on(eventType, cb){
  setTimeout(()=>{
    cb('')
  }, 50);
}

let evolv = window.evolv = {
  client: {on},
};

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  clearTracking();
});

beforeEach(() => {
  window.evolv = evolv;
  window.evolv.context = {uid: 'test-user'};
  // resetTracking();
});

test('simple analytics config', () => {
  let test = window.test = jest.fn(x=>x);

  setCookieValue('test', '0,32,64,test');

  let config = { "test": {
    "source":{
      "type": "cookie",
      "key": "test"
    },
    "destinations": [
      {
        "statements": [
          {
            "invoke": "window.test",
            "with": [
              "confirmed",
              {
                "value": 5,
                "experiment_id": "${group_id}",
                "experiment_name": "${project_name}",
                "variation_id": "${cid}",
                "variation_name": "combination ${combination_id}"
              }
            ]
          }
        ],
        "poll": { "duration": 200, "interval": 20},
      }
    ]
  }
};

  processAnalytics(config);

  jest.runAllTimers();

  expect(test.mock.lastCall[0]).toBe('confirmed');
  expect(test.mock.lastCall[1].value).toBe(5);
  expect(test.mock.lastCall[1].variation_name).toBe('combination 0');
  expect(test.mock.lastCall[1].experiment_id).toBe('32');
  expect(test.mock.lastCall[1].variation_id).toBe('64');
  expect(test.mock.lastCall[1].experiment_name).toBe('test');
});



test('simple analytics config', () => {
  window.test = {};

  setCookieValue('test', '0,32,64,test');

  let config = { "test": {
    "source":{
      "type": "cookie",
      "key": "test"
    },
    "destinations": [
      {
        "statements": [
          {
            "bind": "window.test",
            "with": [
              "confirmed",
              {
                "value": 5,
                "experiment_id": "${group_id}",
                "experiment_name": "${project_name}",
                "variation_id": "${cid}",
                "variation_name": "combination ${combination_id}"
              }
            ]
          }
        ],
        "poll": { "duration": 200, "interval": 20},
      }
    ]
  }
};

  processAnalytics(config);

  jest.runAllTimers();

  const test = window.test;

  console.info('state of test', test);

  expect(test[0]).toBe('confirmed');
  expect(test[1].value).toBe(5);
  expect(test[1].variation_name).toBe('combination 0');
  expect(test[1].experiment_id).toBe('32');
  expect(test[1].variation_id).toBe('64');
  expect(test[1].experiment_name).toBe('test');
});
