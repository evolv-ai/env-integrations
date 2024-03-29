# Emitter

## Deprecated
This package is being deprected and is no longer supported. Please use https://www.npmjs.com/package/@evolv-delivery/metrics for any event processing.


## Setup in the Evolv Manager
[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)


## Structure of json config
The top level key is `pages` that contains an array of page matches that events may occur in. Each of these pages contains `filters` and `events`.

### filters 
The `filters` contains an array of conditionals. Each of these conditionals must be met on a page before the given events are monitor. The conditionals are based on the Evolv audience/context and will be reevaluated when those values are updated. 

* key - the context/audience attribute that is being matched against
* value - a regex that satisfies for the key 


### events
The `events` contains an array containing all possible events that may occur on a given page. Each object in the array needs to contain `tag`, `activate`, and a optional `monitor`.

#### tag
The `tag` is a string that rerpesents the event tag value that is sent to Evolv when the requirements within the activate are met.

#### activate
The `activate`contains an object specifying under what circumstances the event should occur. It contains the following two key value pairs:
* on - specifies the event type to activate based on
* selectors - needed to specify the dom elements for any non `page-load` events.

#### monitor
The `monitor` will be depricated in the future, but it currently requires the following json for non `page-load` events:
```
        "monitor": {
          "type": "observer",
          "selectors":[]
        },
```


### Example
The following shows examples of each of the options available.

```
{"pages": [
  {
    "filters": [
     {
      "key": "web.url": 
      "value": "/products",
     },
     {
      "key": "pageName",
      "value": "gridwall"
     }
     ]
    "events": [
      {    
        "tag": "gridwall.page-load",
        "activate": {
          "on": "pageload",
        }
      },
      {
        "tag": "gridwall-cta-all",
        "activate": {
          "on": "click",
          "selector": "[class*='Tile'], [href*='bring-your-own-device']"
        },
        "monitor": {
          "type": "observer",
          "selectors":[]
        }
      }
    ]
  }
]
}
```
