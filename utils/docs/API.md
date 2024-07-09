<a name="Utils"></a>

## Utils
**Kind**: global class  

* [Utils](#Utils)
    * [new Utils(id, config)](#new_Utils_new)
    * [.debounce](#Utils+debounce) ⇒ <code>function</code>
    * [.subscribe](#Utils+subscribe) ⇒ <code>object</code>
    * [.addClass](#Utils+addClass)
    * [.removeClass](#Utils+removeClass)
    * [.updateText](#Utils+updateText)
    * [.wrap](#Utils+wrap) ⇒ <code>HTMLElement</code>
    * [.namespace](#Utils+namespace)
    * [.throttle(callback, limit)](#Utils+throttle) ⇒ <code>function</code>
    * [.waitFor(callback, timeout, interval)](#Utils+waitFor) ⇒ <code>Promise</code>
    * [.slugify(string)](#Utils+slugify) ⇒ <code>string</code>
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
| timeout | <code>number</code> | The timeout in milliseconds |

<a name="Utils+subscribe"></a>

### utils.subscribe ⇒ <code>object</code>
Polls a callback function at the specified interval. When its return value changes, the listener is called.
If the timeout is reached and no callback has been fired, the catch callback is called.

**Kind**: instance property of [<code>Utils</code>](#Utils)  
**Returns**: <code>object</code> - An object with a then() function that takes a listener callback followed by a catch()
 function accepts a catch callback.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function to poll |
| timeout | <code>number</code> | The timeout in milliseconds, defaults to 5000 |
| interval | <code>number</code> | The interval in milliseconds, defaults to 25 |

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
| className | <code>string</code> | The class name |

<a name="Utils+removeClass"></a>

### utils.removeClass
Removes a class from an element only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |
| className | <code>string</code> | The class name |

<a name="Utils+updateText"></a>

### utils.updateText
Updates an element's innerText only if a change needs to occur.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element |
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

<a name="Utils+namespace"></a>

### utils.namespace
Adds prefixed classes to the body element.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> | The namespace |

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

### utils.slugify(string) ⇒ <code>string</code>
Transforms a string into a slug.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>string</code> - The slug  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to transform |

<a name="Utils+makeElements"></a>

### utils.makeElements(HTMLString, clickHandlers) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Creates an array of elements from an HTML string and adds click handlers to the elements.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - The array of elements  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>string</code> | The HTML string |
| clickHandlers | <code>object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+makeElement"></a>

### utils.makeElement(HTMLString, clickHandlers) ⇒ <code>HTMLElement</code>
Creates an element from an HTML string and adds click handlers to the element.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>HTMLElement</code> - A single element  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>string</code> | The HTML string |
| clickHandlers | <code>object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+$"></a>

### utils.$(selector) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Selects an element from the DOM or creates new element from an HTML string.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - An array containing a single element  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector, XPath expression, or HTML string |

<a name="Utils+$$"></a>

### utils.$$(selector) ⇒ <code>Array.&lt;HTMLElement&gt;</code>
Selects elements from the DOM or creates new elements from an HTML string.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>Array.&lt;HTMLElement&gt;</code> - The array of elements  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector, XPath expression, or HTML string |

