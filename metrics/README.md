# Metrics
The Metrics integration supports populating the Evolv context object with values that are extracted from the browser via several mechanisms.

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)

## Config concepts
The config supports the creation of metrics through inheritance and conditions.

### Inheritance
Inheritance is the idea of passing down common information (defined as attributes) to decendents of the current metric. The decendents can override the inerited attributes (and this is needed if you want to use Conditions). The mechanism of a metric passing inherited values is through the use of tge `apply` attribute. When `apply` is present. The current metric is classified as an Abstract Metirc.

### Conditions
If a metric and all of its decendents should only be applied when a condition is met, you can use the `when` attribute. This allows you to specify a regex that will need to match the parent metric before the current metric and it's decendents are applied.

## The config organization
The intent of the configuration json is to capture all metrics that will be captured as audience values or events. Each of these is referenced as a metric. 

### Metrics
Each metric can contain the following attributes:

* when - is used to specify that the metric (or sub-metrics) have to meet the condition before they are to be applied
* source - specifies where to get the audience attribute or event critera
* key - specifies where to get the value in the source 
* action - is either `event` or `bind` (default for binding value to audience)
* type - is used when action is `bind` to convert the type to
* apply - indicates that the current metric is abstract and its content should be passed to the metrics in the `apply` array
* value - Specifies an explicit value when using action `bind`
* storage - specifies that the value of a `bind` action should be cached for reference on downline pages
* map - specifies value options the the value extracted needs further mapping
* default - specifies the value to bind to a metric when it is unable to find the value indicated by `key`
* poll - allows the system to wait for some period of time and coninue trying to extract a value

### Abstract Metrics
If a metric has an `apply` attribute, then it is an abstract metric and it's attributes are only to provide interited values to the metrics in it's `apply` section. An abstract metric is nevery applied to the page directly.


### Top level Defaults
Since the apply key will be at the top level, the top level should be thought as an abstract metric. It contains the following attributes that can be overriden at the default or inherited metrics

```
"source": "expression",
"key": "window.location.pathname",

```


### SPA
All metrics will be refreshed and reapplied when a `history.pushstate` is invoked if it is indicated in the Evolv snippet.


## Metric attributes
The main requirements for the config are objects indexed by a context attribute where the objects contain `source` and `key`. 

### when
The `when` attribute contains a regular expression as a string and the parent metric's value must pass the regular expression before the current metric or any of its decendents are applied.

### action
There are two values that are valid to bind to an `action` field. The default is `bind` and specifies that the goal of the metric is to bind a value to an attribute in the context. The alternative value for `action` is `event` that indicates that the metric is intended to be recorded as an event.

### source & key
The following is a table showing the different sources that can be associated with a metric:

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


### type
If a `type` attribute is specified, it's value represents the type of the value of the attribute. By default, the type is assumed to be string. The following are the types available:
* boolean
* float
* int
* number
* string
* array

#### apply
The `apply` attribute is the mechanism to specify all decendent metrics that will inherit the current Abstract metric's attributes.

#### map
The `map` is represented as an array of objects that allows the value of the attribute to be transformed. Those mappings have
one of 2 json keys:
* when - a regex for testing the attribute value against
* value - the new value to be bound to the attribute when conditional is met


#### storage
The `storage` is an object indicating that the value should be cached with the following options:
* key - a required key that indicates the key to store and retrieve from storage (The integration will prefix this key with `evolv:` )
* type - `(local|session)` indicating localStorage or sessionStorage (defaults to `session`)
* resolveWith - `(new|cached|union)` indicates how to resolve which value to use when there is both a new value and a cached value. (defaults to `new`)

#### poll
If a value is not imediately available when the integration is processed, a poll can be specified to periodically reevaluate the attribute until it is detected or poll duration expires.

#### default
This allows a value to be specified that will be added to the context imediately if the attribute is not available yet. It will be overriden if the `poll` is set and the value becomes available.



## Diagnosing
When diagnosing on a website page, you can type `window.evolv.applied_metrics` to see the fully relized metrics that are applied to the current page. This does not mean that they have captured data yet. 


## Cookbook Examples





### Sample

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
