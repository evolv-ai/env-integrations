* Lit Harness

This package provides an evolv environment integration harness for `lit-html`.

Some `lit-html` links:

|        |                                                      |
| ------ | ---------------------------------------------------- |
| Docs   | https://lit.dev/docs/libraries/standalone-templates/ |
| github | https://www.npmjs.com/package/lit-html               |
| npm    | https://www.npmjs.com/package/lit-html               |
  

## Setup in the Evolv Manager

### Add Integration
Create a new integration and add the latest version of this package (from npm) as a plugin as shown: 

|       |
| ----- |
| <img src="https://user-images.githubusercontent.com/54595/211390267-2a4fdb3e-acd0-49d7-a004-cceb908fd7c2.png" width="400"/> 

### Update Environment
Add the integration to an Environment and leave json config as default:

|       |
| ----- |
| <img src="https://user-images.githubusercontent.com/54595/211392207-cf35527f-b160-471b-9ded-cf923efc446f.png" width="400"/> 


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






