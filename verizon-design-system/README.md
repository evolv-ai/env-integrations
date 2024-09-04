# Verizon Design System

A library of web components for experiments.

## NPM scripts

| | |
| :------------ | :----------------|
| `npm run build` | Builds `dist/../index.js` files |
| `npm run watch` | Automatically builds on save of `src/index.js` |
| `npm run serve` | Hosts `dist` folder on port `8080` |
| `npm run dev` | Watch and serve |
| `npm start` | Same as `npm run dev` |
| `npm run publish` | Build and publish to npm |

## Local Hosting

Run `npm start` to host locally. To run in your browser inject the following into your `<head>` tag using [Resource Override](https://chromewebstore.google.com/detail/resource-override/pkoacgokdfckfpndoffpifphamojphii)

```js
(() => {
    if (window.self !== window.top) return;
    
    console.log('[evolv-local] example-integration: inject')
    
    const script = document.createElement('script');
    script.type = 'module';
    script.text = 'import integration from "http://localhost:8080/index.js"; console.log("[evolv-local] example-integration: load"); integration()';
    document.head.appendChild(script);
})();
```

## Components

### TextLink

#### Tag

```html
<evolv-text-link href="/target/url/" size="small" type="standAlone">Link</evolv-text-link>
```

#### Class

```js
window.evolv.vds.TextLink
```

#### Attributes

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `type` | Determines display layout of TextLink. | `inline` | `inline`, `standAlone` |
| `disabled` | Disables TextLink. | `false` | `true`, `false` |
| `size` | Renders TextLink in corresponding size. Requires `type="standAlone"` to be set. | `large` | `small`, `large` |


### Button

#### Tag

``` html
<evolv-button use="secondary" width="50%">Click here</evolv-button>
```

#### Attributes

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `display` | Changes the display property of the Button | `flex` | `flex`, `block`, `inline-block` |
| `size` | Renders the Button in the correpsponding size | `large` | `large`, `small` |
| `use` | Black (primary) or white (secondary) Button | `primary` | `primary`, `secondary` |
| `width` | The width for rendering the Button | `auto` | <string> or <number> |
| `disabled` | Disables Button. | `false` | `true`, `false` |