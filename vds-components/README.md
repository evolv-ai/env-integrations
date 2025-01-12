# Verizon Design System

A library of web components for experiments.

## NPM scripts

| Script | Description |
| :------------ | :----------------|
| `npm run build` | Builds `dist/../index.js` files |
| `npm run watch` | Automatically builds on save of `src/index.js` |
| `npm run serve` | Hosts `dist` folder on port `4444` |
| `npm run dev` | Watch and serve |
| `npm run ship` | Build and publish to npm |
| `npm start` | Same as `npm run dev` |

## Using in a project

Verizon Design System components are automatically available anywhere the integration is active.

## Local Hosting

Run `npm start` to host locally. To run in your browser inject the following into your `<head>` tag using [Resource Override](https://chromewebstore.google.com/detail/resource-override/pkoacgokdfckfpndoffpifphamojphii)

```js
(() => {
    if (window.self !== window.top) return;
    
    console.log('[evolv-local] vds-components: inject')
    
    const script = document.createElement('script');
    script.type = 'module';
    script.text = 'import integration from "http://localhost:4444/index.js"; console.log("[evolv-local] vds-components: load"); integration()';
    document.head.appendChild(script);
})();
```
---

## Base Component

The core component from which all other components inherit. This gives the following properties to all components:

### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `breakpoint` | The screensize to display tablet and desktop styles. Can be set globally by setting `window.evolv.vds.breakpoint` | `768px` | `<css-size>` |
| `color` | The text color of the component | `inherit` | `inherit`, [`<color-code>`](#color-codes), [`<css-color>`](#css-color) |
| `css` | A stylesheet to add to the component. Selectors are required, `@media` statements are valid. | `null` | [`<css-stylesheet>`](#css-stylesheet)
| `surface` | Whether to style the component for a light or dark background | `light` | `light`, `dark` |

#### Color Codes

| Option | Hex |
| :----- | :-- |
| `black` | `#000000` |
| `white` | `#ffffff` |
| `red` | `#ee0000` |
| `gray11` | `#1b1d1f` |
| `gray20` | `#333333` |
| `gray44` | `#6f7171` |
| `gray65` | `#a7a7a7` |
| `gray85` | `#d8dada` |
| `gray95` | `#f6f6f6` |

Example:

```html
<evolv-title size="2xlarge" color="white">Buy more phones</evolv-title>
```
---

#### CSS Color

Any valid CSS color.

Example:

```html
<evolv-icon name="trash-can" color="#ee0000" size="1.5rem"></evolv-icon>
<evolv-button-icon name="close" color="rgb(111, 11, 1)" size="large"></evolv-button-icon>
```

---

#### CSS Stylesheet

CSS to be injected into the style tag.

Example:

```js
<evolv-button css=".button {background-color: var(--color-red); color: var(--color-gray-95)}">Button<>
```

## Components

### Accordion

#### Tag

```html
<evolv-accordion title-size="medium">
  <evolv-accordion-item>
    <evolv-accordion-header>Aries</evolv-accordion-header>
    <evolv-accordion-details>It's going to be a regular day, nothing special.</evolv-accordion-details>
  </evolv-accordion-item>
  <evolv-accordion-item>
    <evolv-accordion-header>Taurus</evolv-accordion-header>
    <evolv-accordion-details>Yikes. It's not looking so good, maybe stay home.</evolv-accordion-details>
  </evolv-accordion-item>
  <evolv-accordion-item>
    <evolv-accordion-header>Gemini</evolv-accordion-header>
    <evolv-accordion-details>This is it, the day you've been waiting for! Wear your good shirt.</evolv-accordion-details>
  </evolv-accordion-item>
  <evolv-accordion-item>
    <evolv-accordion-header>Cancer</evolv-accordion-header>
    <evolv-accordion-details>Ominous winds blow from the east. Something nameless stirres from its ancient slumber. Highlight marital status.</evolv-accordion-details>
  </evolv-accordion-item>
</evolv-accordion>
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `disable-track` | Whether to disable Adobe Target tracking | `false` | `true`, `false` |
| `breakpoint` | Used by `evolv-title` and `evolv-button-icon` elements to increase `size` above a certain screen width | `768px` | `<css length>` |
| `duration` | Sets the animation duration for opening `evolv-details` panels | `0.33s` | `<css duration>` |
| `handle-align` | Whether the accordion handle is aligned left or right | `left` | `left`, `right`
| `icon-size` | The `size` of the `evolv-button-icon` element,  | Based on `title-size` if present, otherwise `small` | `small`, `large` |
| `id` | A name for the accordion, used by `data-track` attributes and aria ids. | `accordion-<index>` | `<valid id>` |
| `open-first` | Sets the initial state of the first accordion item to open | `false` | `true`, `false` |
| `padding` | The `padding` for `evolv-accordion-header` and `evolv-accordion-details` elements | `1.5rem` | `<css length>` |
| `padding-tablet` | The `padding` for `evolv-accordion-header` and `evolv-accordion-details` elements on screens over `breakpoint` in width | `2rem` | `<css length>` |
| `title-size` | The `size` of the `evolv-title` elements to use | `small` | `small`, `medium`, `large` |
| `title-bold` | The `bold` option for `evolv-title` elements | `false` | `true`, `false` |
| `title-color` | The `color` option for `evolv-title` elements | `black` | See [Properties](#properties) |
| `track-name` | The name to use for Adobe Target tracking on accordion headers. Priority is first given to `track-name` set on the header, followed by `track-name` set on the accordion itself. If neither are supplied then the `track-name` will be generated from the `id` | `null` |
| `type` | `single` only allows one accordion item to be open at a time. `multi` allows multiple items open simultaneously | `multi` | `single`, `multi` |

---

### Body

#### Tag

```html
<evolv-body size="medium">Our phones are faster than ever, the fastest phones you've ever seen.</evolv-body>

<evolv-body size="large">Your price comes to:
  <evolv-body size="large" bold="true" primitive="span">
    29.99
  </evolv-body>
</evolv-body>
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `primitive` | The html tag to use for the text element | `p` | `p`, `span`, `<html-tag>` |
| `size` | Either [`<size>`](#size) and proportionate style of the text | `small` | `micro`, `small`, `medium`, `large` |
| `strikethrough` | Whether to cross out text | `false` | `true`, `false` |

##### Size:

| `size` | `font-family` | `font-size` | `line-height` | `font-weight` |
| :----- | :---------- | :------------ | :------------ | :------------ |
| `micro` | `Verizon-NHG-eTX` | `0.6875rem` | `1rem` | `400` |
| `small` | `Verizon-NHG-eTX` | `0.75rem`  | `1rem` | `400` |
| `medium` | `Verizon-NHG-eDS` | `0.875rem` | `1.125rem` | `400` |
| `large` | `Verizon-NHG-eDS` | `1rem` | `1.25rem` | `400` |

---

### Button

#### Tag

```html
<evolv-button use="secondary" width="50%">Click here</evolv-button>
```

#### Class

```js
window.evolv.vds.Button
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `display` | Changes the display property of the button. | `flex` | `flex`, `block`, `inline-block` |
| `size` | Renders the button in the correpsponding size. | `large` | `large`, `small` |
| `text-color` | The color the text inside the button. If left blank sets automatically based on `use` and `surface` | `null` | [`<color-code>`](#color-codes), [`<css-color>`](#css-color) |
| `use` | Whether the button face matches the `color` attribute (`primary`) or is transparent (`secondary`) button. | `primary` | `primary`, `secondary` |
| `width` | The width for rendering the button. | `auto` | `<number>` or `<css width>` |
| `disabled` | Disables button. | `false` | `true`, `false` |

---

### ButtonIcon

#### Tag

```html
<!-- Can use <evolv-icon> built in icons -->
<evolv-button-icon name="close"></evolv-button-icon>

<!-- Or use custom SVG by omitting the 'name' attribute -->
<evolv-button-icon>
  <svg width="28" height="28" viewBox="0 0 28 28">
    <!-- fill="currentColor" allows the SVG to inherit color the parent element -->
    <circle cx="14" cy="14" r="14" fill="currentColor" />
  </svg>
</evolv-button-icon>
```

#### Class

```js
window.evolv.vds.ButtonIcon
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `name` | The name of the icon | `empty` | `pencil`, `down-caret`, `right-arrow`, `trash-can`, `phone`, `phone-plan`, `phone-protection`, `info`, `close` |
| `size` | The size of the icon | `small` | `small`, `large` *Refer to Notes* |
| `title` | The title to be passed to the icon, visible to assistive technologies | `<name>` | `<string>` |

#### Notes

| `size` | `width and height` |
| :----- | :---------- |
| `small` | `1.25rem` |
| `large` | `1.75rem` |

---

### Icon

#### Tag

```html
<evolv-icon name="trash-can" size="medium"></evolv-icon>
```

#### Class

```js
window.evolv.vds.Icon
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `name` | The name of the icon, leave blank to supply `svg` icon as content | `null` | `pencil`, `down-caret`, `right-arrow`, `trash-can`, `phone`, `phone-plan`, `phone-protection`, `info`, `close` |
| `color` | The text color of the icon | `inherit` | See [Properties](#properties) |
| `size` | The font size of the icon, can be a preset size or any `<css-size>` | `small` | `small`, `medium`, `large`, `xlarge`, `<css-size>` *Refer to Notes* |
| `title` | The title to be passed to the icon, visible to assistive technologies | `<name>` | `<string>` |
| `type` | Whether the icon size is `standAlone`, determined by the `size` attribute, or `inline`, inherited from text size of the parent | `standAlone` | `inline`, `standAlone` |

#### Notes

`size` only applies to icons with a `type` of `standAlone`.  

| `size` | `width and height` |
| :----- | :---------- |
| `small` | `1rem` |
| `medium` | `1.25rem` |
| `large` | `1.5rem` |
| `xlarge` | `1.75rem` |
| `<css-size>` | `<css-size>` |

---

### Modal

#### Tag

```js
const {html, render} = utils;

utils.app = {
  onClickProceed: (event) => console.log('Proceed'),
  onClickNoThanks: (event) => event.target.closest('evolv-modal').close(),
  openModal: () => document.body.insertAdjacentElement('beforeend', render(html`
    <evolv-modal>
      <evolv-modal-title>Special Offer</evolv-modal-title>
      <evolv-modal-body>10% off if you buy today</evolv-modal-body>
      <evolv-modal-footer>
        <evolv-button @click=${utils.app.onClickProceed}>Proceed</evolv-button>
        <evolv-button @click=${utils.app.onClickNoThanks}>No thanks</evolv-button>
      </evolv-modal-footer>
    <evolv-modal>`))
}

$mu('#productArea', 'product-area').inject(render(html`
  <evolv-button @click=${utils.app.openModal}>Open offer</evolv-button>
`), false).append()
```

---

### TextLink

#### Tag

```html
<evolv-text-link href="/target/url/" size="small" type="standAlone">Link</evolv-text-link>
```

#### Class

```js
window.evolv.vds.TextLink
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `type` | Determines display layout of TextLink. | `inline` | `inline`, `standAlone` |
| `size` | Renders TextLink in corresponding size. Requires `type="standAlone"` to be set. | `large` | `small`, `large`, *See Notes* |

#### Notes

| `size` | `font-size` |
| :----- | :---------- |
| `small` | `0.75rem` |
| `large` | `1rem` |

---

### Tooltip

**Released in version 0.4.0**

#### Tag

```html
<evolv-tooltip content-title="Lorem ipusum">Nulla facilis eos dolorem totam est explicabo fuga. Cum magnam laudantium et itaque rerum sit. Amet laudantium nesciunt consequuntur nam accusamus odit. Sequi rerum et optio et aspernatur quam. Dolores nobis quos suscipit. Aut fugiat ipsam praesentium aliquid ut minima exercitationem illum. Natus explicabo rerum fugit in. Ut voluptatem nemo et. Nobis rem ut repellendus consectetur velit. Consequatur est aperiam praesentium illo facilis. Unde voluptas cumque et aliquid neque autem vel nam. Sit rerum aspernatur minima. Aut sequi vitae et natus est voluptas necessitatibus.</evolv-tooltip>
```

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `size` | Renders the tooltip in the correpsponding size. Requires `type` to be `standAlone`. **Coming soon!** | `large` | `large`, `small` |
| `content-max-height` | The maximum height of the tooltip content 
| `content-title` | A title to be displayed above the tooltip content | | `<string>` |
| `type` | Whether the tooltip button is `inline`, inherited from the text size of the parent, or `standAlone`, determined by the `size` attribute | `inline` | `inline`, `standAlone` |

---

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

#### Properties

| Name | Description | Default | Accepts |
| :--- | :---------- | :------ | :------ |
| `color` | The text color of the title | `inherit` | See [Properties](#properties) |
| `bold` | The weight of the title | `false` | `true`, `false` |
| `size` | The font size of the title | `small` | `xsmall`, `small`, `medium`, `large`, `xlarge`, `2xlarge` |
| `primitive` | The base element for the title | Assigned based `size` *See note* | `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span` |
| `breakpoint` | The screen width at which to transition to a larger font size | `768px` | `<css width>` |

#### Notes

The `primitive` attribute, if left blank, is assigned a default heading tag corresponding to its `size`:

| `size` | `primitive` |
| :----- | :---------- |
| `xsmall` | `h4` |
| `small` | `h3` |
| `medium` | `h2` |
| `large` | `h2` |
| `xlarge` | `h1` |
| `2xlarge` | `h1` |