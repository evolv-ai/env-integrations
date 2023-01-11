# Lit Harness

This package provides an evolv environment integration harness for `lit-html`.

Some `lit-html` links:

|        |                                                      |
| ------ | ---------------------------------------------------- |
| Docs   | https://lit.dev/docs/libraries/standalone-templates/ |
| github | https://www.npmjs.com/package/lit-html               |
| npm    | https://www.npmjs.com/package/lit-html               |
  

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)

The setup for this integration does not require any json config.

## How to use

The `lit-html` main imports (`html` & `render`) will now be available under `window.evolv.lit` along with the `ref` directive functions (`ref`, `createRef`). These are documented within `lit-html` documentation:

|||
| ----- | --- |
| `html` & `render`   |  https://lit.dev/docs/libraries/standalone-templates/ |
| `ref` & `createRef` |  https://lit.dev/docs/templates/directives/#ref |



An example usage:
```
const { html, render, ref, createRef } = window.evolv.lit;

var inputRef = createRef();

function handleSearchClick(){
  var input = inputRef.value;
  requestSearch(input && input.value);
}

function search(placeholder){
  return html`
    <div class="evolv-fullSearchContainer">
      <form autocomplete="off">
        <input type="search" placeholder="${placeholder}" ${ref(inputRef)}/>
        <button class="evolv-cancelButton" 
          @click=${hancleCancelClick}>
        </button>
      </form>
      <div class="evolv-button" @click=${handleSearchClick}>
        ${searchIcon()}
      </div>
    </div>
  `;
  }

```






