## Classes

<dl>
<dt><a href="#CookieMethods">CookieMethods</a></dt>
<dd></dd>
<dt><a href="#Utils">Utils</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#init">init(id, [config])</a> ⇒ <code><a href="#Utils">Utils</a></code></dt>
<dd><p>Creates a new Utils sandbox at the location <code>window.evolv.utils.&lt;id&gt;</code>. A sandbox with the same id will persist between contexts if the page has not reloaded.</p>
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
;
```
<a name="Utils"></a>

## Utils
**Kind**: global class  

* [Utils](#Utils)
    * [new Utils(id, config)](#new_Utils_new)
    * [.log](#Utils+log)
    * [.debug](#Utils+debug)
    * [.warn](#Utils+warn)
    * [.describe](#Utils+describe)
    * [.debounce](#Utils+debounce) ⇒ <code>function</code>
    * [.subscribe](#Utils+subscribe) ⇒ <code>Object</code>
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
| id | <code>string</code> | A unique key for referencing the utils sandbox |
| config | <code>Object</code> | A configuration object that defines the project. Used by <code>describe()</code> |

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
Logs an debug message to the console that can only be seen if the <code>evolv:logs</code> localStorage item is set
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
Logs the description of a context, variable, or variant from <code>evolv-config.json</code> to the console.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> | The context id. |
| variable | <code>string</code> | The variable id. |
| variant | <code>string</code> | The variant id. |

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

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function to poll |
| timeout | <code>number</code> | The timeout in milliseconds, defaults to 5000 |
| interval | <code>number</code> | The interval in milliseconds, defaults to 25 |

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
Adds classes prefixed with `evolv-` to the body element.

**Kind**: instance property of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | The namespace |

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
| clickHandlers | <code>Object</code> | An object where the keys are CSS selectors and the values are click handlers |

<a name="Utils+makeElement"></a>

### utils.makeElement(HTMLString, clickHandlers) ⇒ <code>HTMLElement</code>
Creates an element from an HTML string and adds click handlers to the element.

**Kind**: instance method of [<code>Utils</code>](#Utils)  
**Returns**: <code>HTMLElement</code> - A single element  

| Param | Type | Description |
| --- | --- | --- |
| HTMLString | <code>string</code> | The HTML string |
| clickHandlers | <code>Object</code> | An object where the keys are CSS selectors and the values are click handlers |

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

<a name="init"></a>

## init(id, [config]) ⇒ [<code>Utils</code>](#Utils)
Creates a new Utils sandbox at the location `window.evolv.utils.<id>`. A sandbox with the same id will persist between contexts if the page has not reloaded.

**Kind**: global function  
**Returns**: [<code>Utils</code>](#Utils) - A reference to the newly created Utils instance  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | A unique key for identifying the utils sandbox |
| [config] | <code>Object</code> | An object containing the project definition |

