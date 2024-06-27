
import { processAnalytics } from "../src/analytics";

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
  // jest.clearAllMocks();
  // jest.clearAllTimers();
});

beforeEach(() => {
  window.evolv = evolv;
  // resetTracking();
});

test('simple analytics config', () => {
  let test = window.test = jest.fn(x=>x);

  let config = { "test": [
      {
        "when": "",
        "statements": [
          {
            "invoke": "window.test",
            "with": [
              "confirmed",
              {
                "value": 1,
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
  ],
  "uniqueConfirmationsPerSession": true,
  "uniqueConfirmationsPerSession": 30
};


  processAnalytics(config);

  expect(test.mock.lastCall[0]).toBe('confirmed');
  // expect(bind.mock.lastCall[1]).toBe(5);
  // expect(evolv.metrics.executed.length).toBe(1)
});
