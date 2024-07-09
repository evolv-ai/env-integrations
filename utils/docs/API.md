## Classes

<dl>
<dt><a href="#Utils">Utils</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#init">init(id, [config])</a> ⇒ <code><a href="#Utils">Utils</a></code></dt>
<dd><p>Creates a new Utils sandbox at the location <code>window.evolv.utils.&lt;id&gt;</code>. A sandbox with the same id will persist between contexts if the page has not reloaded.</p>
</dd>
</dl>

<a name="Utils"></a>

## Utils
**Kind**: global class  

* [Utils](#Utils)
    * [new Utils(id, config)](#new_Utils_new)
    * [.debounce](#Utils+debounce) ⇒ <code>function</code>
    * [.subscribe](#Utils+subscribe) ⇒ <code>Object</code>
    * [.addClass](#Utils+addClass)
    * [.removeClass](#Utils+removeClass)
    * [.updateText](#Utils+updateText)
    * [.wrap](#Utils+wrap) ⇒ <code>HTMLElement</code>
    * [.namespace](#Utils+namespace)
    * [.throttle(callback, limit)](#Utils+throttle) ⇒ <code>function</code>
    * [.waitFor(callback, timeout, interval)](#Utils+waitFor) ⇒ <code>Promise</code>
    * [.slugify(string)](#Utils+slugify) ⇒ <code>String</code>
    * [.makeElements(HTMLString, clickHandlers)](#Utils+makeElements) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
    * [.makeElement(HTMLString, clickHandlers)](#Utils+makeElement) ⇒ <code>HTMLElement</code>
    * [.$(selector)](#Utils+$) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
    * [.$$(selector)](#Utils+$$) ⇒ <code>Array.&lt;HTMLElement&gt;</code>

<a name="new_Utils_new"></a>

### new Utils(id, config)
The utils object containing all helper functions


| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | A unique key for referencing the utils sandbox |
| config | <code>Object</code> | A configuration object that defines the project. Used by <code>describe()</code> |

<a name="Utils+debounce"></a>

### utils.debounce ⇒ <code>function</code>
For functions called in rapid succession, waits until a call has not been made for the duration
of the timeout before executing.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>function</code> - The throttled function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The function to debounce |
| timeout | <code>Number</code> | The timeout in milliseconds |

<a name="Utils+subscribe"></a>

### utils.subscribe ⇒ <code>Object</code>
Polls a callback function at the specified interval. When its return value changes, the listener is called.
If the timeout is reached and no callback has been fired, the catch callback is called.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>Object</code> - An object with a then() function that takes a listener callback followed by a catch()
 function accepts a catch callback.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function to poll |
| timeout | <code>Number</code> | The timeout in milliseconds, defaults to 5000 |
| interval | <code>Number</code> | The interval in milliseconds, defaults to 25 |

**Example** *(Example usage of subscribe)*  
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
<a name="Utils+addClass"></a>

### utils.addClass
Adds a class from an element only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |
| className | <code>String</code> | The class name |

<a name="Utils+removeClass"></a>

### utils.removeClass
Removes a class from an element only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |
| className | <code>String</code> | The class name |

<a name="Utils+updateText"></a>

### utils.updateText
Updates an element's innerText only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |
| text | <code>String</code> | The new text for the element |

<a name="Utils+wrap"></a>

### utils.wrap ⇒ <code>HTMLElement</code>
Wraps an element or a group of elements with an HTML element defined by a string

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>HTMLElement</code> - The wrapped element  

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>HTMLElement</code> \| <code>NodeList</code> \| <code>Array.&lt;HTMLElement&gt;</code> | The elements to be wrapped |
| wrapperString | <code>String</code> | String containing markup a valid HTML element |

<a name="Utils+namespace"></a>

### utils.namespace
Adds classes prefixed with `evolv-` to the body element.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>String</code> \| <code>Number</code> | The namespace |

<a name="Utils+throttle"></a>

### utils.throttle(callback, limit) ⇒ <code>function</code>
For functions called in rapid succession, this function will only call once per a specified interval.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>function</code> - The throttled function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  | The function to throttle |
| limit | <code>Number</code> | <code>16</code> | The interval in milliseconds |

<a name="Utils+waitFor"></a>

### utils.waitFor(callback, timeout, interval) ⇒ <code>Promise</code>
Polls a callback function until it returns a truthy value or a timeout is reached.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Promise</code> - A promise that resolves when the callback returns a truthy value
   or rejects when the timeout is reached.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  | The callback function to poll |
| timeout | <code>Number</code> | <code>5000</code> | The timeout in milliseconds, defaults to 5000 |
| interval | <code>Number</code> | <code>25</code> | The interval in milliseconds, defaults to 25 |

<a name="Utils+slugify"></a>

### utils.slugify(string) ⇒ <code>String</code>
Transforms a string into a slug.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>String</code> - The slug  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>String</code> | The string to transform |

<a name="Utils+makeElements"></a>

### utils.makeElements(HTMLString, clickHandlers) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Creates an array of elements from an HTML string and adds click handlers to the elements.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - The array of elements  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>String</code> | The HTML string |
| clickHandlers | <code>Object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+makeElement"></a>

### utils.makeElement(HTMLString, clickHandlers) ⇒ <code>HTMLElement</code>
Creates an element from an HTML string and adds click handlers to the element.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>HTMLElement</code> - A single element  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>String</code> | The HTML string |
| clickHandlers | <code>Object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+$"></a>

### utils.$(selector) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Selects an element from the DOM or creates new element from an HTML string.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - An array containing a single element  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>String</code> | The CSS selector, XPath expression, or HTML string |

<a name="Utils+$$"></a>

### utils.$$(selector) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Selects elements from the DOM or creates new elements from an HTML string.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - The array of elements  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>String</code> | The CSS selector, XPath expression, or HTML string |

<a name="init"></a>

## init(id, [config]) ⇒ [<code>Utils</code>](#Utils)
Creates a new Utils sandbox at the location `window.evolv.utils.<id>`. A sandbox with the same id will persist between contexts if the page has not reloaded.

**Kind**: global function  
**Returns**: [<code>Utils</code>](#Utils) - A reference to the newly created Utils instance  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | A unique key for identifying the utils sandbox |
| [config] | <code>Object</code> | An object containing the project definition |

