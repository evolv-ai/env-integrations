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


  expect(test[0]).toBe('confirmed');
  expect(test[1].value).toBe(5);
  expect(test[1].variation_name).toBe('combination 0');
  expect(test[1].experiment_id).toBe('32');
  expect(test[1].variation_id).toBe('64');
  expect(test[1].experiment_name).toBe('test');
});

test('analytics config with multiple statements', () => {
  let test1 = window.test1 = jest.fn(x => x);
  let test2 = window.test2 = jest.fn(x => x);

  setCookieValue('test', '1,33,65,multiTest');

  let config = {
    "multiTest": {
      "source": {
        "type": "cookie",
        "key": "test"
      },
      "destinations": [
        {
          "statements": [
            {
              "invoke": "window.test1",
              "with": [
                "firstCall",
                {
                  "value": 10,
                  "experiment_id": "${group_id}",
                  "variation_id": "${cid}"
                }
              ]
            },
            {
              "invoke": "window.test2",
              "with": [
                "secondCall",
                {
                  "experiment_name": "${project_name}",
                  "variation_name": "variant ${combination_id}"
                }
              ]
            }
          ],
          "poll": { "duration": 300, "interval": 30 },
        }
      ]
    }
  };

  processAnalytics(config);

  jest.runAllTimers();

  // Check first function call
  expect(test1.mock.calls.length).toBe(1);
  expect(test1.mock.lastCall[0]).toBe('firstCall');
  expect(test1.mock.lastCall[1].value).toBe(10);
  expect(test1.mock.lastCall[1].experiment_id).toBe('33');
  expect(test1.mock.lastCall[1].variation_id).toBe('65');

  // Check second function call
  expect(test2.mock.calls.length).toBe(1);
  expect(test2.mock.lastCall[0]).toBe('secondCall');
  expect(test2.mock.lastCall[1].experiment_name).toBe('multiTest');
  expect(test2.mock.lastCall[1].variation_name).toBe('variant 1');
});

test('analytics config with localVar mechanism', () => {
  window.testObject = {};

  setCookieValue('test', '2,34,66,localVarTest');

  let config = {
    "localVarTest": {
      "source": {
        "type": "cookie",
        "key": "test"
      },
      "destinations": [
        {
          "statements": [
            {
              "bind": "@combinedInfo",
              "with": "${project_name}-${group_id}-${cid}"
            },
            {
              "bind": "window.testObject",
              "with": {
                "combinedInfo": "@combinedInfo",
                "experiment_id": "${group_id}",
                "variation_id": "${cid}",
                "custom_value": "test_${combination_id}"
              }
            }
          ],
          "poll": { "duration": 250, "interval": 25 },
        }
      ]
    }
  };

  processAnalytics(config);

  jest.runAllTimers();

  const testObject = window.testObject;

  expect(testObject.combinedInfo).toBe('localVarTest-34-66');
  expect(testObject.experiment_id).toBe('34');
  expect(testObject.variation_id).toBe('66');
  expect(testObject.custom_value).toBe('test_2');
});
