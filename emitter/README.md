# Emitter

Emitter now supports the following syntax:

```
{"pages": [
  {
    "filter": {
      "url": "/smartphones",
      // "window.vzdl.page.name": "gridwall"
    },
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
