# Template

This package provides an evolv environment integration to setup event handlers for nested html templates.

## Setup in the Evolv Manager

[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)

The setup for this integration does not require any json config.

## How to use

The main point is to bind `window.html` to a handler supporting html template creation.


An example usage:
```

function button(name){
  return html`
  <button 
    @click=${()=>console.info('You clicked', name)} 
    @mousemove=${()=>console.info('mouse moved for', name)}>${name}
  </button>
  `
}

function banner(names){
  return html`
  <div> <span>This is a banner with some button.</span>
   ${names.map(button)}
  </div>`;
}

banner(['hello', 'world']).render('body', 'afterbegin');


```






