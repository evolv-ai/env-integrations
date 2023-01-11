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
#### activate
#### monitor


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
