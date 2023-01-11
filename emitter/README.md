# Emitter


## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)

## Emitter Configuration

Emitter now supports the following syntax:

```
{"pages": [
  {
    "filter": [
     {
      "key": "url": 
      "value": "/smartphones",
     },
     {
      "key": "vz.pageName",
      "value": "gridwall"
     }
     ]
    "events": [
      {
        "tag": "SPGW.ctr-all",
        "monitor": {
          "type": "observer",
          "selectors":['#tabFilterWrapper+#gridwall-wrapper','.gnav20-global-nav-list']
        },
        "activate": {
          "on": "click",
          "selector": "[class*='Tile-sc'], [href*='bring-your-own-device'], [href*='/promos/global-choice/']"
        }
      },
      { 
        "tag": "SPGW.ctr-all2",
        "monitor": {
          "type": "listener",
          "selector": "body"
        },
        "activate": {
          "on": "mousedown",
          "selector": "[class*='Tile-sc'], [href*='bring-your-own-device'], [href*='/promos/global-choice/']"
        }
      },
      {    
        "tag": "SPGW.page-load",
        "activate": {
          "on": "pageload",
        }
      }
    ]
  }
]
}
```
