# Evolv Utils

A library of helper functions for writing experiments

## Installation

Add as an integration via NPM to your environment. The library will be added to the `evolv` window object. Most methods can be accessed directly from the `window.evolv.utils` object, however sandboxing is recommended to prevent collisions with other running experiments and to unlock the `describe` method.

## Utilization

Initialize in the context of your experiment.

```js
const config = {
  name: 'New Experiment',
  version: '1.0.0',
  contexts: [
    {
      id: 'homepage',
      display_name: 'Home',
      variables: [
        {
          id: 'c1',
          display_name: 'C1: Change header copy',
          variants: [
            {
              id: 'v0'
              display_name: 'C1V0: Control'
            },
            {
              id: 'v1',
              display_name: 'C1V1: "The best there is"'
            },
            {
              id: 'v2',
              display_name: 'C1V2: "The best that ever was"'
            }
          ]
        }
      ]
    }
  ]
}

const utils = window.evolv.utils.init('home', config);
const { log, describe } = utils;
log('init:', config.name, config.version);
describe('homepage');
```

## Local hosting

To host locally, inject the following script using [ResourceOverride](https://chromewebstore.google.com/detail/resource-override/pkoacgokdfckfpndoffpifphamojphii?hl=en&pli=1).

```js
(() => {
  if (window.self !== window.top) { return }
  
  console.log('[evolv-local] utils-local: inject');
  
  const script = document.createElement('script');
  script.type = 'module';
  script.text = 'import processConfig from "http://localhost:8082/index.raw.js"; console.log("[evolv-local] utils: load"); processConfig()';
  
  document.head.appendChild(script);
})();
```

## API

For API documentation refer to [Utils API](docs/API.md)