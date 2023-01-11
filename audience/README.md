# Audience
The audience integration supports populating the Evolv context object with values that are extracted from the browser via several mechanism (`type`).

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)


## Setting up the config json
The main requirements for the config are objects indexed by a context attribute where the objects contain `type` and `key` (aka `value` - for backward compatibility). The following is a table showing the different types

### Structure
The top level keys of the json config indicate one of two things and both have object values.
* The attribute key if the object value contains a `type` field.
* A top level grouping if the object value does not contain a `type` field. This will results in each field of the value. they will be 

### Context attribute objects
| Type       | Key (usage)              | Description                                                                                            |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| cookie     | cookie name              | Return value of cookie                                                                                 |
| dom        | css selector             | Returns `found` if dom element exists on page                                                          |
| expression | js expression            | The experssion usually                                                                                 |
| extension  | name of extension        | Currenty only one extension `distribution`: tracks a random value between 0-100 that persists for user |
| fetch      | url                      | This also includes additional data                                                                     |
| jqdom      | jqery selector           | Returns `found` if dom element exists on page                                                          |
| query      | name of query parameter  | The value of the query parameter within th url                                                         |

### Other attribute options

#### page
If a `page` is specified, it's value represents a regex on the current url that if specified, the attribute will only be evaluated upon the `page` matching. This helps to focus page specific attributes that may be slow in retrieval.

#### map
The `map` is represented as an array of objects that allows the value of the attribute to be transformed. Those mappings have
one of 3 json keys:
* when - a regex for testing the attribute value against
* result - the new value to be bound to the attribute when conditional is met
* default - `default` can be used as result as the last map value. There should be no `when` value for `default`.


#### spa
If the `spa` value is set to `true`, the attribute will be reevaluated upon any spa based navigation.

#### poll
If a value is not imediately available when the integration is processed, a poll can be specified to periodically reevaluate the attribute until it is detected or poll duration expires.

#### default
This allows a value to be specified that will be added to the context imediately if the attribute is not available yet. It will be overriden if the `poll` is set and the value becomes available.

The config is read top to bottom. If a match is found, it stops. No fall-through, so in the example below if the path of the page starts with `/home/`, nothing will happen, because the statements block is an empty array.

### Example
The following shows examples of each of the type and options available.

```

{
    "ctas": {
        "placeOrder": {
            "page": "sales/digital/expressCheckout",
            "type": "dom",
            "value": "button[aria-label*='Place order']",
            "poll": {
                "interval": 100,
                "duration": 5000
            }
        }
    },
    "omni": {
        "visitorId": {
            "type": "expression",
            "value": "window._satellite.getVisitorId()._fields.MCMID"
        }
    },
    "recognizedUser": {
        "type": "cookie",
        "key": "recogme",
        "default": false,
        "map": [
            {
                "result": true,
                "when": ".+"
            },
            {
                "default": false
            }
        ]
    },
    "campaign": {
        "source": {
            "type": "query",
            "value": "utm_source"
        },
        "medium": {
            "type": "query",
            "value": "utm_medium"
        }
    }    
}
```
