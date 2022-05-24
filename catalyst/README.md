
# Catalyst

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

Add the npm integration connector `@evolv-delivery/catalyst`.

### Setup

Add the following json config at environment level to enable the framework across a site

```json
{
  "pages": [
    "/"
  ]
}
```

## Usage

Once the integration is configured, you can setup context javascript.

## Example

### Context level coding

```js
// This is where you intialize the `rule` sandbox. Note the sandbox name appended at the end of the `renderRule`
var rule = window.evolv.renderRule.my_sandbox_1;
// Getting a reference to the store. This is where shared variables related to the current render is stored.
var store = rule.store;
// rename so it doesn't collide or is confused with jQuery. This is a basic selector function for catalyst.
var $ = rule.$;

/*
instrumentDOM defines classes to keys. Those classes are then added to the one or more elements returned by the selectors. 
By default, instrumentDOM prefixes the classname with `evolv-` and uses the property name as the suffix to the class.
Each element is also tagged with a unique attribute to handle idenpotency (prevent an element from being manipulated more than once).
*/
store.instrumentDOM({
  deviceTile:{
    get dom() {
      return $('.device-tile, .byod-device-tile');
    }
  },
  podParent:{
    get dom() {
      return $('.evolv-deviceTile [id*=mvo_ovr_devices]').first().parent();
    }
  },
  buttonParent:{
    get dom(){ 
      return $('button.addALine)').parent(); 
    },
    asClass: 'my-unique-button-class' // optional. 
  }
});
```

Variant level coding

```js
/**************
  Target Page (DOM)
***************/

<main>
  <form>
    <fieldset>
      <legend>User Info</legend>
      <ul>
        <li>
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" />
        </li>
        <li>
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" />
        </li>
        <li>
          <label for="telNumber">Tel Number</label>
          <input type="tel" id="telNumber" name="telNumber" />
        </li>
      </ul>
      </fieldset>
  </form>
</main>

/**************
  Web Editor 
  Context JS Panel code:
***************/
var rule = window.evolv.renderRule.visble_homepage_1
var store = rule.store;
var $ = rule.$;
var $$ = rule.$$;

store.instrumentDOM({
  formInput: {
    get dom() {
      return $('form fieldset input');
    }
  },
  formLabel: {
    get dom() {
      return $('form fieldset label');
    }
  }
});

rule
  .whenDOM('.evolv-formInput')
  .then(el => {
    var inputEl = el.firstDom();
    var labelEl = inputEl.previousElementSibling;
    el.attr({"placeholder": labelEl.textContent});
  });

// Alternatively...

rule
  // use whenItem to reference the property name that was instrumented
  .whenItem('formInput')
  .then(el => {
    var inputEl = el.firstDom();
    var labelEl = inputEl.previousElementSibling;
    el.attr({"placeholder": labelEl.textContent});
  });

/**************
  Web Editor 
  Context SASS Panel code:
***************/
.evolv- {
  label {
    display: none
  }
}
```

whenItem('.evolv-buttonParent')
whenItem(store.buttonParent)

rule.subscribe(store.buttonParent)

Or to specific function that span variants

```js
rule.app.createMainButton = function(){
  rule
    .whenDOM('.evolv-buttonParent')
    .then(function(buttonParent){
      buttonParent.append(...);
    }
};
```

## Modes

## rule object

### rule.store

#### store.instrumentDOM

```js
store.instrumentDOM({
  deviceSection:{
    get dom(){ return $('#devicesSection')}
    // asClass is optional, the default class will match the key
    // asClass: 'devicesSection'
  },
  podParent:{
    get dom(){ return $('.evolv-devicesSection [id*=mvo_ovr_devices]').first().parent();}
    //following line is equivilant
    //get dom(){ return $$('devicesSection').find('[id*=mvo_ovr_devices]').first().parent();}
  },
});
```

### rule.whenDom(<selector>)

```js
rule.whenDom('.evolv-DeviceSection');
```

The "whenDom" method will wait for the specified selector to be created or selectable on the page and will return a Promise object. The Promise object can then be used to apply further methods.

### rule.whenItem(<instrumention key>)

```js
rule.whenItem('DeviceSection');
```

The "whenItem" method will wait for the specified instrument key to be created or selectable on the page and will return a Promise object. The Promise object can then be used to apply further methods.

### rule.$

The methods below are mostly analagous to their JavaScript or jQuery counterparts. However, this will return a Catalyst wrapped specified selector object.

#### filter()

The `filter()` method creates a new array with all elements that pass the test implemented by the provided function.

```js
var words = ['spray', 'limit', 'elite', 'exuberant', 'destruction', 'present'];
var result = $(words).filter((idx, word) => word.length > 6);
console.log(result);
// expected output: Array ["exuberant", "destruction", "present"]
```

#### find()

The `find()` method returns the all elements that match the specified child selector.

```html
<ul id="sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("#sidebar").find("li");
// expected output: array of 5 <li> elements.
```

#### closest()

The `closest()` method returns the parent element that matches the specified selector.

```html
<ul id="sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("li").closest("#sidebar");
// expected output: array with single <ul> element.
```

#### parent()

The `parent()` method returns the parent element of the specified selector.

```html
<ul id="sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("li").parent();
// expected output: array with single <ul> element.
```

#### children()
The `children()` method returns the child elements of the specified selector.

```html
<ul id="sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("ul").children();
// expected output: array with all <li> elements.
```

#### contains()

The `contains()` method returns a selector of the specified selector.

```html
<ul id="sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("ul").children();
// expected output: array with all <li> elements.
```

#### addClass()

The `addClass()` method adds classes of on the specified selector.

```html
<ul id="sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("ul").addClass("evolv-sidebar");
// expected output: add a new class attribute on the ul Element
```

#### removeClass()

The `removeClass()` method removes classes of on the specified selector.

```html
<ul id="sidebar" class="evolv-sidebar">
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("ul").removeClass("evolv-sidebar");
// expected output: remove the class on the ul Element
```

#### append()

The `append()` method attaches input selectors as children at the end of the specified selector.

```html
<ul id="sidebar" >
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("ul").append($('<li>Last child in list</li>'));
// expected output: add a new child tag to the sidebar at the end of the list
```

#### insertBefore()

The `insertBefore()` method attaches input selectors as siblings before the specified selector.

```html
<ul id="sidebar" >
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
  <li>Lorum ipsum</li>
</ul>
```

```js
$("ul > :first-child").insertBefore($('<li>New first child</li>'));
// expected output: add a new child tag before the first element in the list
```

#### on()

The `on()` method adds event listeners to the specified selector.

```html
<button>Continue</button>
```

```js
$("button").on("click", event => {
  console.log("test");
});
// expected output: will print "test" to the console every time the button is clicked
```

#### markOnce()

This will mark an element and run a callback exactly once.

```html
<button>Continue</button>
```

```js
$("button").markOnce(elem => {
  $(elem).text("Pre-order");
});
// expected output: will change the button text Pre-order and mark it as changed with an attribute
```

---

#### text()

This will return the text on the specified selector. If a parameter is provided, it will set the text content for the specified selector.

```html
<button>Continue</button>
```

```js
$(elem).text("Pre-order");
// expected output: will change the button text to "Pre-order"
```

#### attr()

This will return the attribute on the specified selector. If a parameter is provided, it will set the attribute content for the specified selector.

```html
<button aria-label="Continue">Continue</button>
```

```js
$(elem).attr({"aria-label": "Pre-order"});
// expected output: will change the aria-label text to "Pre-order"
```

#### each()

This is loop iteration function that requires a callback input function.

```html
<ul id="sidebar" >
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
$("li").each( elem => {
  elem.text("test");
});
// expected output: will change all the li elements to have the text "test"
```

#### watch()

This function will wait for changes on the specified selector before executing the callback input function.

```html
<ul id="sidebar" >
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
$('#sidebar').watch( () =>{
  $("li").each( elem => {
    elem.text("test");
  }
});
// expected output: will change all the li elements to have the text "test" when the ul is modified in anyway
```

#### first()

This function will return the first child tag on the specified selector.

```html
<ul id="sidebar" >
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
$('li').first().text("first thing")
// expected output: will change the first li ("First") element to have the text "first thing"
```

#### last()

This function will return the last child tag on the specified selector.

```html
<ul id="sidebar" >
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
$('li').last().text("last thing")
// expected output: will change the last li ("Third") element to have the text "last thing"
```

#### firstDom()

This function will return the first child Element tag on the specified selector.

```html
<ul id="sidebar" >
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
$('li').firstDom().textContent = "first thing";
// expected output: will change the first li ("First") element to have the text "first thing"
```

#### lastDom()

This function will return the last child Element tag on the specified selector.

```html
<ul id="sidebar" >
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
$('li').lastDom().textContent = "last thing";
// expected output: will change the last li ("Third") element to have the text "last thing"
```


### rule.$$('<instrument key>')

The $$ function for rule allows for the selection of a particular instrument keyed tag. You will then be able to 
apply other catalyst functions to the specified instrument keyed tag.

## future

## Best Practices
This section provide a set of practices that improves the success of an Evolv experiment using this framework. Some of these practices are good things to follow regardless of which framework is being used.

### Include any part of the dom within the `instrumentDOM` section

### Use 'evolv-' prefixed selectors for all css


## API

