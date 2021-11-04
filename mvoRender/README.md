# mvoRender

An Evolv **Env Integration** to support the renderRule framework. This framework makes 

## Goals
The goals for this framework are to provide the following:
1. Group all brittle site selectors in one place. This makes it easy to find the selectors that are based on customer's DOM that may be volatile. 
2. Handle idemponency.
3. Easly identify which parts of the page are experimented on. This could support tooling, support, and debugging.
4. Experiment specific setTimeout and setInterval calls. These are impacted by spa page navigation. Ideally these would be wrapped in APIs that handl navigation automatically. 
5. Simplify coding and support declaritive where possible.
6. Allow simple experiments to remain simple and support more complex tests (model view rendering)
7. Simplify things like Mutation Observer..

## Installation
Add the integration connector https://gist.github.com/rcowin/296f5ae45187ffdb74f47e8c4901189e.

### Setup
Add the following json config at environment level to enable the framework across a site
```
{
    "pages": [
        "/"
    ]
}
```

## Usage
Once the integration is configured, you can setup some context js 


## Example

### Context level coding
```
var rule = window.evolv.renderRule.mdaep1;
var store = rule.store;
var $ = rule.$;

store.instrumentDOM({
    deviceSection:{
        get dom(){ return $('#devicesSection')},
        asClass: 'devicesSection'
    },
    podParent:{
        get dom(){ return $('.evolv-devicesSection [id*=mvo_ovr_devices]').first().parent();},
        asClass: 'podParent'
    },
    buttonParent:{
        get dom(){return $('button.addALine)').parent();},
        asClass: 'buttonParent'
    }
});
```

Variant level coding

```
rule.app.createMainButton = function(){
    rule
    .whenDOM('.evolv-buttonParent')
    .then(function(buttonParent){
      buttonParent.append(...)
};
```

Or to specific function that span variants

```
rule.app.createMainButton = function(){
    rule
    .whenDOM('.evolv-buttonParent')
    .then(function(buttonParent){
      buttonParent.append(...)
};
```

## Best Practices
This section provide a set of practices that improves the success of an Evolv experiment using this framework. Some of these practices are good things to follow regardless of which framework is being used.

### Include any part of the dom within the `instrumentDOM` section

### Use 'evolv-' prefixed selectors for all css


## API

