# active_variants

This integration provides access to variant names in the Evolv runtime.

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)



## API enhancements
The API adds two functions to the `Evolv.client` object (getActiveExperimentDate and addDisplayName)

#### getActiveExperimentData(eid)
This function takes and eid and will an object that can be subscribed to for two events (`project.initialized` and `project.updated`).

Here is an example call for thisfunction 

```
> evolv.client.getActiveExperimentData('655e2ccfb3').on('project.initialized', p=> console.info(p))

{
    "uid": "54509095_1747073709990",
    "eid": "655e2ccfb3",
    "cid": "594b647f7132:655e2ccfb3",
    "ordinal": 211,
    "group_id": "9e19e75f-c131-47e3-a7ad-f76e32856a00",
    "excluded": false,
    "id": "655e2ccfb3",
    "displayName": "PR08 | Search",
    "activeVariants": [
        {
            "id": "web.yurro11fv.h78lg5y31",
            "name": "1.2 - Placeholder: Looking for"
        },
        {
            "id": "web.yurro11fv.p8d74fwg1",
            "name": "3.1 - Search input, lights out"
        }
    ]
}
```

#### addDisplayName
This is called to add display names to the `evolv.client`. An example of this call:
```
evolv.client.addDisplayName?.('variants', 'web.snsgm5ha8.2g5f6zqv6', '16.2 | change copy');
```

## Setting up the config json
There is no configuration currently needed for this integration.

## Usage
This integration is used to enable the [variant-name-injector](https://www.npmjs.com/package/@evolv-delivery/variant-name-injector)
