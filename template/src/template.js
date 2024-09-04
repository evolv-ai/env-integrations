
const idPrefix = (Math.random()*10000000).toString(36).toUpperCase();
const handlerKey = 'data-evolv-event-handler';
const $mu = evolv.$mu;

function Component(strings, exps, handlers=[]){
    this.strings = strings;
    this.exps = exps;
    this.eventHandlers = handlers;
}
Component.isComponent = val=> val && (typeof val === 'object') && (val.constructor === Component);
Component.prototype.evaluateTemplate = function(){
    return this.strings.map((s,i)=> transform(s,this.exps[i]))
            .join('')
            .replace(/^[\n\r\s]+/, '');
}
Component.prototype.css = function(strings, ...exps){
    this.styles = strings[0];
    return this;
}
Component.prototype.render = function(sel, position){render(this, sel, position)};


function transform(str, exp){
    if (Component.isComponent(exp)){
        return `${str}${exp.evaluateTemplate()}`;
    } else if (Handler.isHandler(exp)) {
        return exp.transformSnippet(str);
    } else if ( Array.isArray(exp)) {
       return exp.map(e=>
            `${str}${Component.isComponent(e) ? e.evaluateTemplate() : e}`
        ).join('');
    } else {
        return `${str}${exp || ''}`
    }
  }

const genUniqueId = (()=>{
    let value = 1;
    return ()=>`${idPrefix}.${value++}`
})();

const handlerRegExp = /@([a-zA-Z0-9_]+)=($| )/;
function Handler(matches, id, fnc){
    this.matches = matches;
    this.id = id;
    this.fnc = fnc;
}
Handler.isHandler = val=> val && (typeof val === 'object') && (val.constructor === Handler);

Handler.prototype.transformSnippet = function(str){
    return str.replace(this.matches[0], `${handlerKey}="${this.id}"`);
}

Handler.prototype.applyHandler = function(){
    const selector = `[${handlerKey}="${this.id}"]`;
    const event = this.matches[1]
    $mu(selector).on(event, this.fnc);
}

function createHandler(str, exp, siblingHandler){
    const matches = str.match(handlerRegExp);

    if (matches && typeof exp === 'function'){
        const id = siblingHandler ? siblingHandler.id : genUniqueId();
        return new Handler(matches, id, exp);
    } else {
        console.warn('component failed to process', str, exp);
        return exp;
    }
}

export function html(strings, ...exps){
    let siblingHandler = null;
    let newExps = exps.map((exp, i)=>{
        const str = strings[i];
        if (/>/.test(str)) siblingHandler = null;
        if (exp && typeof exp === 'function') {
            return siblingHandler = createHandler(str, exp, siblingHandler);
       } else {
        return exp;
       }
    });
    return new Component(strings, newExps);
}

function applyAllHandlers(exps){
    exps.forEach((exp, i)=>{
        if (Component.isComponent(exp)){
          applyAllHandlers(exp.exps);
        } else if ( Array.isArray(exp)) {
          applyAllHandlers(exp);
        } else if (Handler.isHandler(exp)) {
          exp.applyHandler();
        }
      });
}

function prepareMutateConstructor(){
    const constructor = $mu('body').constructor;

    if (!constructor.prototype.render){
        constructor.prototype.render = function(pos, elem){ return render(elem, this, pos)};
    }
    return constructor;
}
const mutateConstructor = prepareMutateConstructor();
function isMutator(val){
    return val && (typeof val === 'object') && (val.constructor === mutateConstructor);
}

function render(value, selector, insertionPoint='afterbegin'){
    let content = Component.isComponent(value) ? value.evaluateTemplate() : value;

    function insertComponent(context){
        context.insertAdjacentHTML(insertionPoint, content);
    }

    if (typeof selector === 'string'){
        $mu(selector).customMutation((_,c)=>insertComponent(c));
    } else if (isMutator(selector)) {
        selector.customMutation((_,c)=>insertComponent(c));
    } else { //assuming it is dom element
        insertComponent(selector);
    }

    if (Component.isComponent(value)) applyAllHandlers(value.exps);
    
    //cleanup attribute
    $mu(`[${handlerKey}]`).customMutation((_,e)=>e.removeAttribute(handlerKey))
}
