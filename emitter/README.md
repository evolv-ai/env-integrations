# Emitter


## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)


## Structure of json config
The top level key is `pages` that contains an array of page matches that events may occur in. Each of these pages contains `filters` and `events`.
### filters 

* key - the context/audience attribute that is being matched against
* value - a regex that satisfies for the key 


### events

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
        "monitor": {
          "type": "observer",
          "selectors":[]
        },
        "activate": {
          "on": "click",
          "selector": "[class*='Tile'], [href*='bring-your-own-device']"
        }
      }
    ]
  }
]
}
```
