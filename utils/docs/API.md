## Classes

<dl>
<dt><a href="#CookieMethods">CookieMethods</a></dt>
<dd></dd>
<dt><a href="#Utils">Utils</a></dt>
<dd></dd>
<dt><a href="#XPathMethods">XPathMethods</a></dt>
<dd><p>A utility class for generating XPath selectors for elements based on class names.
The generated XPaths can be used to locate DOM elements that match specific patterns
related to mutation keys and context prefixes.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#deriveSelector">deriveSelector(element)</a> ⇒ <code>string</code></dt>
<dd><p>Creates a selector string from an element, friendlier for logging and error messages</p>
</dd>
<dt><a href="#init">init(id, [config])</a> ⇒ <code><a href="#Utils">Utils</a></code></dt>
<dd><p>Creates a new Utils sandbox at the location <code>window.evolv.utils.&lt;id&gt;</code>. A sandbox with the same id will persist between contexts if the page has not reloaded.</p>
</dd>
<dt><del><a href="#capitalizeFirstLetter">capitalizeFirstLetter(string)</a> ⇒ <code>string</code></del></dt>
<dd><p>Capitalizes the first letter of a string.</p>
</dd>
<dt><a href="#isCamelCase">isCamelCase(string)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if the given string is in camelCase format.</p>
</dd>
<dt><a href="#parse">parse(string)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Parses a string into an array of words. If the string is in camelCase, it splits the string
at uppercase letter boundaries. If not, it treats spaces or non-word characters as delimiters.</p>
</dd>
<dt><a href="#toSentenceCase">toSentenceCase(string)</a> ⇒ <code>string</code></dt>
<dd><p>Converts a string to sentence case.</p>
</dd>
<dt><a href="#toCamelCase">toCamelCase(string)</a> ⇒ <code>string</code></dt>
<dd><p>Converts a string to camelCase.</p>
</dd>
<dt><a href="#toKebabCase">toKebabCase(string)</a> ⇒ <code>string</code></dt>
<dd><p>Converts a string to kebab-case.</p>
</dd>
</dl>

<a name="CookieMethods"></a>

## CookieMethods
**Kind**: global class  

* [CookieMethods](#CookieMethods)
    * [new CookieMethods()](#new_CookieMethods_new)
    * [.getItem(key, [decode])](#CookieMethods+getItem) ⇒ <code>string</code>
    * [.setItem(key, value, [encode])](#CookieMethods+setItem)
    * [.appendItem(key, value, [encode])](#CookieMethods+appendItem)

<a name="new_CookieMethods_new"></a>

### new CookieMethods()
A group of methods for getting and setting cookies. These methods get assigned to the
<code>evolv.utils.cookie</code> object.

<a name="CookieMethods+getItem"></a>

### cookieMethods.getItem(key, [decode]) ⇒ <code>string</code>
Retrieves the decoded (optionally) value of the specified cookie.

**Kind**: instance method of [<code>CookieMethods</code>](#CookieMethods)  
**Returns**: <code>string</code> - The value of the cookie  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | The cookie key |
| [decode] | <code>boolean</code> | <code>true</code> | Whether to decode the value |

**Example**  
```js
document.cookie = 'test-cookie=true';
utils.cookie.getItem('test-cookie'); // 'true'
```
<a name="CookieMethods+setItem"></a>

### cookieMethods.setItem(key, value, [encode])
Sets an encoded (optionally) value to the specified cookie.

**Kind**: instance method of [<code>CookieMethods</code>](#CookieMethods)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | The cookie key |
| value | <code>string</code> \| <code>number</code> |  | The value to assign |
| [encode] | <code>boolean</code> | <code>true</code> | Whether to URI encode the value |

**Example**  
```js
utils.cookie.setItem('testCookie', '{"a":"1","b":"2"}');
document.cookie; // 'testCookie=%7B%22a%22%3A%221%22%2C%22b%22%3A%222%22%7D'
```
<a name="CookieMethods+appendItem"></a>

### cookieMethods.appendItem(key, value, [encode])
Appends an encoded (optionally) value to the specifiec cookie.

**Kind**: instance method of [<code>CookieMethods</code>](#CookieMethods)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | The cookie key |
| value | <code>string</code> \| <code>number</code> |  | The value to append |
| [encode] | <code>boolean</code> | <code>true</code> | Whether to URI encode the value |

**Example**  
```js
document.cookie = 'throttle=|EnableTest1';
utils.cookie.appendItem('|EnableTest2');
document.cookie; // 'throttle=%7CEnableTest1%7CEnableTest2'
```
<a name="Utils"></a>

## Utils
**Kind**: global class  

* [Utils](#Utils)
    * [new Utils(id, config)](#new_Utils_new)
    * [.toRevert](#Utils+toRevert)
    * [.log](#Utils+log)
    * [.debug](#Utils+debug)
    * [.warn](#Utils+warn)
    * [.describe](#Utils+describe)
    * [.debounce](#Utils+debounce) ⇒ <code>function</code>
    * [.subscribe](#Utils+subscribe) ⇒ <code>Object</code>
    * [.string](#Utils+string)
    * [.html](#Utils+html) ⇒ <code>TemplateResult</code>
    * [.render](#Utils+render) ⇒ <code>Node</code>
    * [.renderAll](#Utils+renderAll) ⇒ <code>NodeList</code>
    * [.addClass](#Utils+addClass)
    * [.removeClass](#Utils+removeClass)
    * [.updateText](#Utils+updateText)
    * [.wrap](#Utils+wrap) ⇒ <code>HTMLElement</code>
    * [.getOutermost](#Utils+getOutermost)
    * [.cssSizeToValue](#Utils+cssSizeToValue) ⇒ <code>number</code>
    * [.updateProperty](#Utils+updateProperty)
    * [.isTouchDevice](#Utils+isTouchDevice) ⇒ <code>boolean</code>
    * [.getOffsetRect](#Utils+getOffsetRect) ⇒ <code>DOMRect</code>
    * [.observeWindowWidth](#Utils+observeWindowWidth)
    * [.throttle(callback, limit)](#Utils+throttle) ⇒ <code>function</code>
    * [.waitFor(callback, timeout, interval)](#Utils+waitFor) ⇒ <code>Promise</code>
    * ~~[.slugify(string)](#Utils+slugify) ⇒ <code>string</code>~~
    * [.setContext(key, value)](#Utils+setContext)
    * ~~[.makeElements(HTMLString, clickHandlers)](#Utils+makeElements) ⇒ <code>Array.&lt;Element&gt;</code>~~
    * ~~[.makeElement(HTMLString, clickHandlers)](#Utils+makeElement) ⇒ <code>HTMLElement</code>~~
    * [.$(selector, context)](#Utils+$) ⇒ <code>Element</code>
    * [.$$(selector, context)](#Utils+$$) ⇒ <code>Array.&lt;Element&gt;</code>
    * [.isVisible(element)](#Utils+isVisible) ⇒ <code>boolean</code>
    * [.fail(details, [reason])](#Utils+fail)
    * [.supportsIntersectionObserver()](#Utils+supportsIntersectionObserver) ⇒ <code>boolean</code>
    * [.getAncestor(element, [level])](#Utils+getAncestor)
    * [.getPrecedingSiblings(element)](#Utils+getPrecedingSiblings) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
    * [.stealthClick(element)](#Utils+stealthClick)
    * [.revert()](#Utils+revert)

<a name="new_Utils_new"></a>

### new Utils(id, config)
The utils object containing all helper functions


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | A unique key for referencing the utils sandbox |
| config | <code>Object</code> | A configuration object that defines the project. Used by <code>describe()</code> |

<a name="Utils+toRevert"></a>

### utils.toRevert
An array of callbacks to be executed on context exit. Used by [.namespace](#Utils+namespace)
and can also be used for custom tear-down/clean-up functions if you have problems with
elements persisting after SPA navigation changes. Reversion triggers when the current active
key transitions to inactive, so in the Web Editor it won't fire in Edit mode. It also requires
the `config` object to contain the context key as it matches in the YML. If `config.id`
is not the same as the context key in the YML you can add the following to the top level of
`config`:
```js
 context_key: this.key,
```

**Kind**: instance property of [<code>Utils</code>](#Utils)  
<a name="Utils+log"></a>

### utils.log
Logs a message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   to <code>normal</code> or <code>debug</code>.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | The messages to log |

<a name="Utils+debug"></a>

### utils.debug
Logs a debug message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   to <code>debug</code>.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | The debug messages to log. |

<a name="Utils+warn"></a>

### utils.warn
Logs a warning to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
   to <code>normal</code> or <code>debug</code>.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | The warnings to log. |

<a name="Utils+describe"></a>

### utils.describe
Logs the description of the project config and the specified variable and/or variant to the console.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| [variable] | <code>string</code> | The variable id. |
| [variant] | <code>string</code> | The variant id. |

**Example**  
```js
const config = {
  id: 'eup-pdp-myplan-redesign',
  version: '1.0.0',
  name: 'EUP PDP myPlan Redesign',
  platform: 'D/T/M/A',
  audience: 'Customer',
  kpi: 'EUP-OC.page-load',
  url: /https:\/\/www\.verizon\.com\/smartphones\/[\w-+]+\//,
  variables: [
    {
      id: 'c1',
      name: '1 - Subheader',
      variants: [
        {
          id: 'v0',
          name: '1.0 - Control'
        },
        {
          id: 'v1',
          name: '1.1 - Static'
        },
        {
          id: 'v2',
          name: '1.2 - Dynamic'
        }
      ]
    },
    {
      id: 'c2',
      name: '2 - Vertical plans',
      variants: [
        {
          id: 'v0',
          name: '2.0 - Control'
        },
        {
          id: 'v1',
          name: '2.1 - Bulleted list'
        }
      ]
    },
    {
      id: 'c3',
      name: '3 - Promo offer',
      variants: [
        {
          id: 'v0',
          name: '3.0 - Control'
        },
        {
          id: 'v1',
          name: '3.1 - Deemphasize savings'
        }
      ]
    }
  ]
}

const utils = window.evolv.utils.init(config);
const { describe } = utils;
```

Console:
```
[evolv-eup-pdp-myplan-redesign] version: 1.0.0
[evolv-eup-pdp-myplan-redesign] name: EUP PDP myPlan Redesign
[evolv-eup-pdp-myplan-redesign] platform: D/T/M/A
[evolv-eup-pdp-myplan-redesign] audience: Customer
[evolv-eup-pdp-myplan-redesign] kpi: EUP-OC.page-load
[evolv-eup-pdp-myplan-redesign] url: /https:\/\/www\.verizon\.com\/smartphones\/[\w-+]+\//
[evolv-eup-pdp-myplan-redesign] init variable: 1 - Subheader
[evolv-eup-pdp-myplan-redesign] init variant: 1.2 - Dynamic
[evolv-eup-pdp-myplan-redesign] init variable: 2 - Vertical plans
[evolv-eup-pdp-myplan-redesign] init variant: 2.1 - Bulleted list
[evolv-eup-pdp-myplan-redesign] init variable: 3 - Promo offer
[evolv-eup-pdp-myplan-redesign] init variant: 3.0 - Control
```
<a name="Utils+debounce"></a>

### utils.debounce ⇒ <code>function</code>
For functions called in rapid succession, waits until a call has not been made for the duration
of the timeout before executing.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>function</code> - The throttled function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The function to debounce |
| timeout | <code>number</code> | The timeout in milliseconds |

<a name="Utils+subscribe"></a>

### utils.subscribe ⇒ <code>Object</code>
Polls a callback function at the specified interval. When its return value changes, the listener is called.
If the timeout is reached and no callback has been fired, the catch callback is called.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>Object</code> - An object with a then() function that takes a listener callback followed by a catch()
 function accepts a catch callback.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| testCondition | <code>function</code> |  | The callback function to poll |
| [exitCondition] | <code>number</code> \| <code>function</code> | <code>5000</code> | A number will be treated as a timeout in milliseconds. If a callback is provided, the subscription will terminate when the callback evaluates to `true`. |
| [interval] | <code>number</code> | <code>25</code> | The interval in milliseconds |

**Example**  
```js
// This snippet will prevent a session token from being deleted by storing a copy of it in localStorage.

subscribe(() => sessionStorage.getItem(key), 600000, 250).then(sessionToken => {
 const localToken = localStorage.getItem(key);
 console.log('[evolv-local] session token:', sessionToken, 'local token:', localToken);
 if (!sessionToken && localToken) {
   sessionStorage.setItem(key, localToken)
 } else if (sessionToken) {
   localStorage.setItem(key, sessionToken)
 }
});
```
<a name="Utils+string"></a>

### utils.string
A utility object for string manipulation methods.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
<a name="Utils+html"></a>

### utils.html ⇒ <code>TemplateResult</code>
A tag for template literals that exports a `TemplateResult` object to be consumed by the `utils.render` method.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type |
| --- | --- |
| strings | <code>Array.&lt;string&gt;</code> | 
| ...expressions | <code>any</code> | 

<a name="Utils+render"></a>

### utils.render ⇒ <code>Node</code>
Transforms `TemplateResult` into an `Node`. Attributes prefixed with `@` will be assigned as event listeners. Allows embedding of `Nodes`, other `TemplateResult` objects, and arrays of expressions.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type |
| --- | --- |
| templateResult | <code>TemplateResult</code> | 

**Example**  
```js
// Creates a div containing two buttons with click handlers already assigned
const {html, render} = utils;

const button = render(html`
  <div class="button-wrap">
      <button @click=${goBackCallback}>
          Go back
      </button>
      <button class="secondary" @click=${continueCallback}>
          Continue
      </button>
  </div>
`)
```
**Example**  
```js
// Creates a group of tiles
const {html, render} = utils;

const tileContents = [
  {
    title: 'Buy this phone',
    body: 'It's better than your old phone.',
    onClick: app.phoneAction
  },
  {
    title: 'Upgrade your plan',
    body: 'It's better than your old plan.',
    onClick: app.planAction
  },
  {
    title: 'Get device protection',
    body: 'You know you're clumsy.',
    onClick: app.protectionAction
  }
]

const tileTemplate = (content) => render(html`
  <div class="tile">
    <h2>${content.title}</h2>
    <div>${content.body}</div>
    <button @click=${content.onClick}>Continue</button>
  </div>
`);

// Maps the content into a new array of `TemplateResult` objects which get recursively rendered. The `false` flag is important because it instructs `inject` to not clone the element, preventing the destruction of event listeners.
mutate('main').inject(() => render(html`
  <div class="tile-group">
    ${tileContents.map(tileContent => tileTemplate(tileContent))}
  </div>
`), false);
```
<a name="Utils+renderAll"></a>

### utils.renderAll ⇒ <code>NodeList</code>
Renders a `TemplateResult` and returns an array of elements.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>NodeList</code> - The rendered nodes  

| Param | Type | Description |
| --- | --- | --- |
| templateResult | <code>TemplateResult</code> | The `TemplateResult` to render |

<a name="Utils+addClass"></a>

### utils.addClass
Adds a class from an element only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| element | <code>Element</code> |  | The element |
| className | <code>string</code> |  | The class name |
| [silent] | <code>boolean</code> | <code>false</code> | Whether to disable logging |

<a name="Utils+removeClass"></a>

### utils.removeClass
Removes a class from an element only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| element | <code>Element</code> |  | The element |
| className | <code>string</code> |  | The class name |
| [silent] | <code>boolean</code> | <code>false</code> | Whether to disable logging |

<a name="Utils+updateText"></a>

### utils.updateText
Updates an element's innerText only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Element</code> | The element |
| text | <code>string</code> | The new text for the element |

<a name="Utils+wrap"></a>

### utils.wrap ⇒ <code>HTMLElement</code>
Wraps an element or a group of elements with an HTML element defined by a string

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>HTMLElement</code> - The wrapped element  

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>HTMLElement</code> \| <code>NodeList</code> \| <code>Array.&lt;HTMLElement&gt;</code> | The elements to be wrapped |
| wrapperString | <code>string</code> | String containing markup a valid HTML element |

<a name="Utils+getOutermost"></a>

### utils.getOutermost
Gets the outermost element matching a selector

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |
| selector | <code>string</code> | The selector to match |

**Example**  
```js
const modalDialog = utils.getOutermost(iframe, 'div[class^="ModalDialogWrapper-VDS"]');
```
<a name="Utils+cssSizeToValue"></a>

### utils.cssSizeToValue ⇒ <code>number</code>
Converts a CSS size string (e.g., '10px', '1rem') to its numeric value in pixels.
If the value is in 'rem', it will be converted based on the root font size.
Returns NaN if the unit is not 'px' or 'rem'.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>number</code> - The numeric value of the size in pixels, or NaN if the unit is invalid.  

| Param | Type | Description |
| --- | --- | --- |
| cssSize | <code>string</code> | The CSS size string (e.g., '10px', '1rem'). |

<a name="Utils+updateProperty"></a>

### utils.updateProperty
Updates a CSS property on a target element with a new value.
If the new value is the same as the current value, no update is made.
Optionally, the target element can be specified, otherwise defaults to `document.documentElement`.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| property | <code>string</code> |  | The CSS property to update (e.g., 'background-color'). |
| value | <code>string</code> \| <code>number</code> |  | The new value to set for the property (can be a string or number). |
| [targetElement] | <code>HTMLElement</code> | <code>document.documentElement</code> | The target element to apply the style to. |

<a name="Utils+isTouchDevice"></a>

### utils.isTouchDevice ⇒ <code>boolean</code>
Checks if the device supports touch events.
This method checks for the presence of touch event properties in the window and navigator objects.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>boolean</code> - `true` if the device supports touch events, otherwise `false`.  
<a name="Utils+getOffsetRect"></a>

### utils.getOffsetRect ⇒ <code>DOMRect</code>
Returns the offset rectangle of a given element relative to the document,
including scroll offsets and client positions.
This method calculates the element's position and size considering scrolling.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>DOMRect</code> - The calculated DOMRect object containing the element's position and dimensions.  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Element</code> | The DOM element whose offset rectangle is to be calculated. |

<a name="Utils+observeWindowWidth"></a>

### utils.observeWindowWidth
Adds a ResizeObserver to the body that updates the CSS custom property
`--evolv-window-width` with the current width of the body in px.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
<a name="Utils+throttle"></a>

### utils.throttle(callback, limit) ⇒ <code>function</code>
For functions called in rapid succession, this function will only call once per a specified interval.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>function</code> - The throttled function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  | The function to throttle |
| limit | <code>number</code> | <code>16</code> | The interval in milliseconds |

<a name="Utils+waitFor"></a>

### utils.waitFor(callback, timeout, interval) ⇒ <code>Promise</code>
Polls a callback function until it returns a truthy value or a timeout is reached.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Promise</code> - A promise that resolves when the callback returns a truthy value
   or rejects when the timeout is reached.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  | The callback function to poll |
| timeout | <code>number</code> | <code>5000</code> | The timeout in milliseconds, defaults to 5000 |
| interval | <code>number</code> | <code>25</code> | The interval in milliseconds, defaults to 25 |

<a name="Utils+slugify"></a>

### ~~utils.slugify(string) ⇒ <code>string</code>~~
***Deprecated***

Transforms a string into a slug.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>string</code> - The slug  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to transform |

<a name="Utils+setContext"></a>

### utils.setContext(key, value)
Sets Evolv remote context property and outputs log

**Kind**: instance method of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The remote context key |
| value | <code>string</code> | The remote context value |

**Example**  
```js
// For Snowflake monitoring. Sets initial t=0 to monitor load time
utils.setContext('vz.cartDeviceEditModal', {
  variant: `c8${variant}`,
  loadTime: 0,
  bodyClasses: null
});
```
<a name="Utils+makeElements"></a>

### ~~utils.makeElements(HTMLString, clickHandlers) ⇒ <code>Array.&lt;Element&gt;</code>~~
***Deprecated***

Creates an array of elements from an HTML string and adds click handlers to the elements.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;Element&gt;</code> - The array of elements  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>string</code> | The HTML string |
| clickHandlers | <code>Object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+makeElement"></a>

### ~~utils.makeElement(HTMLString, clickHandlers) ⇒ <code>HTMLElement</code>~~
***Deprecated***

Creates an element from an HTML string and adds click handlers to the element.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>HTMLElement</code> - A single element  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>string</code> | The HTML string |
| clickHandlers | <code>Object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+$"></a>

### utils.$(selector, context) ⇒ <code>Element</code>
Selects an element from the DOM.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Element</code> - A single element  
**Note**: XPath selectors must be prefixed with `.` to be relative to the context element  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector or XPath expression |
| context | <code>Element</code> | The context for querying |

**Example**  
Select an element with CSS
```js
const button = $('#button');
```
**Example**  
Select an element with XPath
```js
const button = $('//*[@id="button"]');
```
**Example**  
Select an element within another element using CSS
```js
const container = $('#container');
const button = $('#button', container);
```
**Example**  
Select an element within another element using XPath
```js
const container = $('//*[@id="container"]');
const button = $('.//*[@id="button"]', container);
```
<a name="Utils+$$"></a>

### utils.$$(selector, context) ⇒ <code>Array.&lt;Element&gt;</code>
Selects elements from the DOM.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;Element&gt;</code> - An array of result elements  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector, XPath expression |
| context | <code>Element</code> | The context for querying |

**Example**  
Select all matching elements with CSS
```js
const listItems = $$('ul#list > li');
```
**Example**  
Select all matching elements with XPath
```js
const listItems = $$('//ul[@id="list"]/li');
```
**Example**  
Select all matching elements within another element using CSS
```js
const container = $('#container');
const listItems = $$('ul#list > li', container);
```
**Example**  
Select all matching elements within another element using XPath
```js
const container = $('//*[@id="container"]');
const listItems = $$('.//ul[@id="list"]/li', container);
```
<a name="Utils+isVisible"></a>

### utils.isVisible(element) ⇒ <code>boolean</code>
Checks if an element is currently visible on the screen

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>boolean</code> - `true` if the element is visible  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element to check |

<a name="Utils+fail"></a>

### utils.fail(details, [reason])
A wrapper for `evolv.client.contaminate` that logs a warning to the console.

**Kind**: instance method of [<code>Utils</code>](#Utils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| details | <code>string</code> |  | The specifics of the failure |
| [reason] | <code>string</code> | <code>&quot;missing-requirements&quot;</code> | The type of failure |

**Example**  
```js
if (!modalDialog) {
  fail(`modalDialog not found`); // > fail: contaminating do to 'missing-requirements' - modalDialog not found
}
```
<a name="Utils+supportsIntersectionObserver"></a>

### utils.supportsIntersectionObserver() ⇒ <code>boolean</code>
Checks for full IntersectionObserver support

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>boolean</code> - `true` if browser supports IntersectionObserver  
**Example**  
```js
if (!supportsIntersectionObserver()) {
  fail('IntersectionObserver not supported'); // > fail: contaminating do to 'missing-requirements' -
}                                             // IntersectionObserver not supported
```
<a name="Utils+getAncestor"></a>

### utils.getAncestor(element, [level])
Gets the nth ancestor or nth ancestor matching a selector for a given element

**Kind**: instance method of [<code>Utils</code>](#Utils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| element | <code>HTMLElement</code> |  | The element |
| [level] | <code>number</code> | <code>1</code> | The number of ancestors to traverse |

**Example**  
```js
addClass(getAncestor(protectionText, 3), 'evolv-psfec-protection-text-outer');
// > add class: 'evolv-psfec-protection-text-outer' added
```
<a name="Utils+getPrecedingSiblings"></a>

### utils.getPrecedingSiblings(element) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Gets all elements before the given element within the same parent

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - An array of elements  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |

**Example**  
```js
mutate('order-summary-wrap').customMutation((state, orderSummaryWrap) => {
  utils.wrap(utils.getPrecedingSiblings(orderSummaryWrap), '<div class="evolv-psfec-cart-left"></div>');
});
```
<a name="Utils+stealthClick"></a>

### utils.stealthClick(element)
Simulates a click on a specified DOM element without triggering Adobe tracking.

**Kind**: instance method of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The DOM element on which the stealth click is performed. |

<a name="Utils+revert"></a>

### utils.revert()
Reverts any persistent actions. This will remove any body classes applied by `namespace()`,
reset `describe()` and run any custom reversion callbacks added to `toRevert`.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Example**  
```js
utils.revert();
```
<a name="XPathMethods"></a>

## XPathMethods
A utility class for generating XPath selectors for elements based on class names.
The generated XPaths can be used to locate DOM elements that match specific patterns
related to mutation keys and context prefixes.

**Kind**: global class  

* [XPathMethods](#XPathMethods)
    * [new XPathMethods(config)](#new_XPathMethods_new)
    * [.containsClass](#XPathMethods+containsClass) ⇒ <code>string</code>
    * [.containsKey](#XPathMethods+containsKey) ⇒ <code>string</code>
    * [.includesKeys](#XPathMethods+includesKeys) ⇒ <code>string</code>
    * [.anyKey](#XPathMethods+anyKey) ⇒ <code>string</code>

<a name="new_XPathMethods_new"></a>

### new XPathMethods(config)
Creates an instance of the XPathMethods class.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration object for initializing the XPath methods. |
| [config.xpath_prefix] | <code>string</code> | The prefix for XPath generation. If not provided falls back to `config.context_key` |
| [config.context_key] | <code>string</code> | An alternate context key to use for generating the prefix. If not provided falls back to `config.contexts[0].id` |
| [config.contexts] | <code>Array.&lt;{id: string}&gt;</code> | A list of context objects, used if neither `xpath_prefix` nor `context_key` is provided. |

**Example**  
```js
const xpathMethods = new XPathMethods({ xpath_prefix: 'abc' });
```
<a name="XPathMethods+containsClass"></a>

### xPathMethods.containsClass ⇒ <code>string</code>
Generates an XPath expression that matches elements containing the specified class name.

**Kind**: instance property of [<code>XPathMethods</code>](#XPathMethods)  
**Returns**: <code>string</code> - An XPath expression to match elements containing the specified class.  

| Param | Type | Description |
| --- | --- | --- |
| className | <code>string</code> | The class name to match within the element's `class` attribute. |

**Example**  
```js
// HTML
<div class="content">
  <div class="content-inner">Content</div>
</div>

// JS
collect(`//div[${containsClass('content')}]`, 'content');

// Mutate only collects the outer div
```
<a name="XPathMethods+containsKey"></a>

### xPathMethods.containsKey ⇒ <code>string</code>
Generates an XPath expression to match elements that contain a mutation key as a class name.
The mutation key is prefixed with the class prefix.

**Kind**: instance property of [<code>XPathMethods</code>](#XPathMethods)  
**Returns**: <code>string</code> - An XPath expression for the specified mutation key.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The collector name to match as part of the class name. |

**Example**  
```js
// In this example utils was initialized with config.xpath_prefix = "page-transform"
utils.selectors = {
  'protection-section': `//div[${containsKey('line-content')}]//div[@data-testid="protectionSection"]`
}
console.log(utils.selectors['protection-section']);
// Output: //div[contains(concat(" ", @class, " "), " mutate-page-transform-protection-section ")]
```
<a name="XPathMethods+includesKeys"></a>

### xPathMethods.includesKeys ⇒ <code>string</code>
Generates an XPath expression that matches an element containing all the specified keys as classes.
The keys are prefixed and combined into an XPath expression to match a container element
that holds all other specified elements.

**Kind**: instance property of [<code>XPathMethods</code>](#XPathMethods)  
**Returns**: <code>string</code> - An XPath expression to find the container element that contains all specified keys.  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>Array.&lt;string&gt;</code> | A list of keys to match as part of the element's class names. |
| container | <code>string</code> | The collector name that identifies the container element. |

**Example**  
```js
// In this example utils was initialized with config.contexts[0].id = "abc"
const selectors = {
  'user-profile-settings': utils.xpath.includesAllKeys(['user', 'profile', 'settings'], 'container')
}
console.log(selectors['user-profile-settings']);
// Output: //*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-user ")]/ancestor::*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-profile ")]/ancestor::*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-settings ")]/ancestor::*[contains(concat(" ", @class, " "), " mutate-abc-container ")]
```
<a name="XPathMethods+anyKey"></a>

### xPathMethods.anyKey ⇒ <code>string</code>
Generates an XPath expression to match any element containing one of the specified keys.
Optionally, a container key can be provided to further scope the search.

**Kind**: instance property of [<code>XPathMethods</code>](#XPathMethods)  
**Returns**: <code>string</code> - An XPath expression that matches any element with one of the specified keys.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| keys | <code>Array.&lt;string&gt;</code> |  | A list of keys to match as part of the element's class names. |
| [container] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | An optional key to limit the scope of the XPath to a specific container element. Can be an XPath selector or a collector name. |

**Example**  
```js
// Using collector name
// In this example utils was initialized with config.contexts[0].id = "abc"
const selectors = {
  'container': '.container',
  'user-profile': utils.xpath.anyKey(['user', 'profile'], 'container');
}
console.log(selectors['user-profile']);
// Output: //*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-user ")] | //*[contains(concat(" ", @class, " "), " mutate-abc-container ")]//*[contains(concat(" ", @class, " "), " mutate-abc-profile ")]
```
**Example**  
```js
// Using XPath selector
// In this example utils was initialized with config.contexts[0].id = "abc"
const selectors = {
  'user-profile': utils.xpath.anyKey(['user', 'profile'], '//div[@id="container"]');
}
console.log(selectors['user-profile']);
// Output: //div[@id="container"]//*[contains(concat(" ", @class, " "), " mutate-abc-user ")] | //div[@id="container"]//*[contains(concat(" ", @class, " "), " mutate-abc-profile ")]
```
<a name="deriveSelector"></a>

## deriveSelector(element) ⇒ <code>string</code>
Creates a selector string from an element, friendlier for logging and error messages

**Kind**: global function  

| Param | Type |
| --- | --- |
| element | <code>Element</code> | 

**Example**  
```js
const element = document.querySelector('main#main.container.mobile-view');
console.log(deriveSelector(element)); // "main#main.container.mobile-view";
```
<a name="init"></a>

## init(id, [config]) ⇒ [<code>Utils</code>](#Utils)
Creates a new Utils sandbox at the location `window.evolv.utils.<id>`. A sandbox with the same id will persist between contexts if the page has not reloaded.

**Kind**: global function  
**Returns**: [<code>Utils</code>](#Utils) - A reference to the newly created Utils instance  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | A unique key for identifying the utils sandbox |
| [config] | <code>Object</code> | An object containing the project definition |

<a name="capitalizeFirstLetter"></a>

## ~~capitalizeFirstLetter(string) ⇒ <code>string</code>~~
***Deprecated***

Capitalizes the first letter of a string.

**Kind**: global function  
**Returns**: <code>string</code> - The string with the first letter capitalized.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to capitalize. |

**Example**  
```js
string.capitalizeFirstLetter('hello'); // 'Hello'
```
<a name="isCamelCase"></a>

## isCamelCase(string) ⇒ <code>boolean</code>
Checks if the given string is in camelCase format.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns `true` if the string is in camelCase, `false` otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to check. |

**Example**  
```js
string.isCamelCase('myVariable'); // true
string.isCamelCase('my_variable'); // false
```
<a name="parse"></a>

## parse(string) ⇒ <code>Array.&lt;string&gt;</code>
Parses a string into an array of words. If the string is in camelCase, it splits the string
at uppercase letter boundaries. If not, it treats spaces or non-word characters as delimiters.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - An array of words parsed from the string.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to parse. |

**Example**  
```js
string.parse('myCamelCaseString'); // ['my', 'Camel', 'Case', 'String']
string.parse('hello world!'); // ['hello', 'world']
```
<a name="toSentenceCase"></a>

## toSentenceCase(string) ⇒ <code>string</code>
Converts a string to sentence case.

**Kind**: global function  
**Returns**: <code>string</code> - The string converted to sentence case.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to convert. |

**Example**  
```js
string.toSentenceCase('hello world'); // 'Hello world'
```
<a name="toCamelCase"></a>

## toCamelCase(string) ⇒ <code>string</code>
Converts a string to camelCase.

**Kind**: global function  
**Returns**: <code>string</code> - The string converted to camelCase.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to convert. |

**Example**  
```js
string.toCamelCase('hello world'); // 'helloWorld'
string.toCamelCase('this is a test'); // 'thisIsATest'
```
<a name="toKebabCase"></a>

## toKebabCase(string) ⇒ <code>string</code>
Converts a string to kebab-case.

**Kind**: global function  
**Returns**: <code>string</code> - The string converted to kebab-case.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to convert. String can be delimited by any non-word character or be camelCase. |

**Example**  
```js
string.toKebabCase('helloWorld'); // 'hello-world'
string.toKebabCase('this is a test'); // 'this-is-a-test'
```
