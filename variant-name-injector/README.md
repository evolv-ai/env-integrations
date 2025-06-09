# variant-name-injector

Processes an Evolv experiment yml file to inject varaint name information into the experiment. 
Note: This is a temporary solution until the Evolv product makes this information available in the runtime.

## Usage
You can run this via npx (suggested) via the following command:
```
npx @evolv-delivery/variant-name-injector <input-file> <output-file>
```

## What this cli does
This cli injects variant name information into each variant. This will result in each variant having generated code at the beginning looking like:
```
//#region Variant Name
client.addDisplayName?.('variants', 'web.snsgm5ha8.2g5f6zqv6', '16.2 | change copy to: "Related"');
//#endregion
```

## Why use this
Currently Evolv does not provide the variant names in the runtime for analytics tools to consume. This injector will make any varaint, that is active on a page, available for consumption by analytics integrations. Currently [ContentSquare](https://contentsquare.com/) uses this information. 

## Dependency
In order for the display names to be accessable, you will need to have the [active_variants](https://www.npmjs.com/package/@evolv-delivery/active_variants) integration installed.

## Current Usage
The variant information is currently consumed by [ContentSquare](https://contentsquare.com/). In the future, it will be available for other analytics systems to consume as well.

## Importing changes into Evolv
Importing projects into the manager is described by; https://support.evolv.ai/hc/en-us/articles/4403940031379-Importing-a-Project

If you are applying this script to a yml file that has previously been imported into the manager, you need to be familiar with updating/repairing variants as described: https://support.evolv.ai/hc/en-us/articles/4403940056083-Repairing-a-broken-variant-during-a-live-optimization
