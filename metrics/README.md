# Metrics
The Metrics integration supports populating the Evolv context object with values that are extracted from the browser via several mechanisms.

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)


## Setting up the config json
The main requirements for the config are objects indexed by a context attribute where the objects contain `source` and `key`. 

### Model



### Top Level Structure
apply
The top level keys of the json config indicate one of two things and both have object values.
* The attribute key (to use in context) if the object value contains a `source` and `key` field that have string values.
* A top level grouping if the object does not contain a `source` and `key` field. This will results in each attribute of the object representing a context attribute.

### Context attribute objects
The following is a table showing the different types for the attributes:

| Source         | Key (usage)              | Description                                                                                            |
| ----------     | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| query          | name of query parameter  | The value of the query parameter within th url                                                         |
| expression     | js expression            | The experssion usually                                                                                 |
| cookie         | cookie name              | Return value of cookie                                                                                 |
| localStorage   | localStorage key         | Return value of localStorage key                                                                       |
| sessionStorage | sessionStorage key       | Return value of sessionStorage key                                                                     |
| dom            | css selector             | Returns `found` if dom element exists on page                                                          |
| jqdom          | jquery selector          | Returns `found` if dom element exists on page                                                          |
| extension      | name of extension        | Currenty only one extension `distribution`: tracks a random value between 0-100 that persists for user |
| fetch          | url                      | This also includes additional data                                                                     |


### Other  options

#### type
If a `type` attribute is specified, it's value represents the type of the value of the attribute. By default, the type is assumed to be string. The following are the types available:
* event
* boolean
* float
* int
* string
* array

#### when

#### apply
The `apply` is represented as an array of objects that allows the value of the attribute to be transformed. Those mappings have
one of 3 json keys:
* when - a regex for testing the attribute value against
* result - the new value to be bound to the attribute when conditional is met
* default - `default` can be used as result as the last map value. There should be no `when` value for `default`.

#### storage
The `storage` is an object indicating that the value should be cached with the following options:
* key - a required key that indicates the key to store and retrieve from storage (The integration will prefix this key with `evolv:` )
* type - `(local|session)` indicating localStorage or sessionStorage (defaults to `session`)
* resolveWith - `(new|cached|union)` indicates how to resolve which value to use when there is both a new value and a cached value. (defaults to `new`)

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
    "apply": [
        {
            "tag": "ctas.placeOrder",
            "when": "sales/digital/expressCheckout",
            "source": "dom",
            "key": "button[aria-label*='Place order']"
        },
        {
            "tag": "omni.visitorId",
            "source": "expression",
            "key": "window._satellite.getVisitorId()._fields.MCMID"
        },
        {
            "tag": "recognizedUser",
            "source": "cookie",
            "key": "user",
            "type": "boolean",
            "default": false,
            "map": [
                {"result": true, "when": ".+"}
            ]
        },
        {
            "source": "query",
            "apply": [
                {"key": "utm_source", "tag": "campaign.source"},
                {"key": "utm_medium", "tag": "campaign.medium"}
            ]
        },
        {
            "tag": "page.landingTag",
            "source": "expression",
            "key": "location.pathname",
            "default": "none",
            "storage": {
                "type": "session",
                "key": "landingTag",
                "resolveWith": "cached"
            },
            "map": [
                {"result": "products", "when": "/products/"} 
            ]
        }
    ]
}
```
