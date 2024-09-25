# analytics

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)


## Setting up the config json
The config is read top to bottom. If a match is found, it stops. No fall-through, so in the example below if the path of the page starts with `/home/`, nothing will happen, because the statements block is an empty array.

`"omni"` is just a name to use for organizing different destinations, nothing is keying off of it. Each of these top level keys must have a `"destinations"` attribute to specify an array of array of handlers for the main destination.

By default the `"destinations"` will apply for each evolv `confirmation` event. A `"source"` may be specified to read events from something other than evolv. 

For each designation handler, the folloiwing are available attributes:
- `"page"` (Optional): Specifies that the url must match a regular expression before the handler applies.
- `"experiments"` (Optional): Must have an `"operator"` with an `"include"` or `"exclude"` value and an `"ids"` array. The `"ids"` array can be empty.
- `"statements"`:  Is an array of statements to be executed. `"invoke"` is the statement to execute and `"with"` is the list of parameters for the statement. You can use `combination_id` and `experiment_id` in your statements.

```
{
    "omni": {
      "destinations": [
        {
            "page": "^/home/",
            "statements": []
        },
        {
            "experiments": {
                "operator": "include",
                "ids": [
                    "28c039f6-3362-4be0-90c0-44962779903c"
                ]
            },
            "statements": [
                {
                    "invoke": "window.vztag.api.dispatch",
                    "with": [
                        "evolvCID",
                        {
                            "listPrefixed": "Evolv-Combo_${combination_id}:${experiment_id}"
                        }
                    ]
                }
            ]
        },
        {
            "experiments": {
                "operator": "exclude",
                "ids": [
                    "94ad809f-e846-4466-a87e-28805ed9fe64",
                    "f9d101ee-d191-491b-a51b-4435e0eb6863",
                    "7bd7f61e-0145-4e5c-85ba-271e864be7ed",
                    "1322e424-2a74-4bcf-a00d-ab6e562f82e8"
                ]
            },
            "statements": [
                {
                    "invoke": "window.vztag.api.dispatch",
                    "with": [
                        "evolvCID",
                        {
                            "list": "Combination_${combination_id}:${experiment_id}",
                            "listPrefixed": "Evolv-Combo_${combination_id}:${experiment_id}"
                        }
                    ]
                }
            ]
        }
      ]
    },
    "uniqueConfirmationsPerSession": true
}
```
