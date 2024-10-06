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
    
    console.log('[evolv-local] verizon design system: inject')
    
    const script = document.createElement('script');
    script.type = 'module';
    script.text = 'import integration from "http://localhost:8080/index.js"; console.log("[evolv-local] verizon design system: load"); integration()';
    document.head.appendChild(script);
})();
```

## Components

### Title

#### Tag

```html
<evolv-title bold="true">Bold small title</evolv-title>
<evolv-title size="medium" breakpoint="950px" primitive="h4">Medium title</evolv-title>
```

#### Class

```js
window.evolv.vds.Title
```

#### Attributes

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `color` | The text color of the title | `black` | `black`, `white` |
| `bold` | The weight of the title | `false` | `true`, `false` |
| `size` | The font size of the title | `small` | `small`, `medium`, `large`, `xlarge`, `2xlarge` |
| `primitive` | The base element for the title | Assigned based `size` *See note* | `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span` |
| `breakpoint` | The screen width at which to transition to a larger font size | `768px` | `<css width>` |

#### Notes

The `primitive` attribute, if left blank, is assigned a default heading tag corresponding to its `size`:

| `size` | `primitive` |
| :----- | :---------- |
| `small` | `h3` |
| `medium` | `h2` |
| `large` | `h2` |
| `xlarge` | `h1` |
| `2xlarge` | `h1` |

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
| `display` | Changes the display property of the Button. | `flex` | `flex`, `block`, `inline-block` |
| `size` | Renders the Button in the correpsponding size. | `large` | `large`, `small` |
| `use` | Black (primary) or white (secondary) Button. | `primary` | `primary`, `secondary` |
| `width` | The width for rendering the Button. | `auto` | `<number>` or `<css width>` |
| `disabled` | Disables Button. | `false` | `true`, `false` |