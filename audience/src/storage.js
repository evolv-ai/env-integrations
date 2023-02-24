
//example:
// "storage": {
//     "type": "session", 
//     "type": "local", 
//     "key": "my-key",
//     "resolve-with": "cached",
//     "resolve_with": "new",
//     "resolveWith": "union"
// },

const storePrefix = 'evolv:';

const Storage = {
    'session': sessionStorage,
    'local': localStorage,
    'default': sessionStorage
};

function marshalValue(valueType, value){
    switch(valueType){
        case 'float': return value;
        case 'int': return value;
        case 'boolean': return value;
        case 'array': return JSON.stringify(value); 
        default: return value.toString();
    }
}

function unmarshalValue(valueType, value){
    switch(valueType){
        case 'float': return parseFloat(value);
        case 'int': return parseInt(value);
        case 'boolean': return /^true$/i.test(value);
        case 'array': return JSON.parse(value);
        default: return value.toString();
    }   
}

function getKey(storage){
    return `${storePrefix}${storage.key}`;
}

function getStore(storage){
    return Storage(storage.type || 'default');
}

function setStoreValue(storage, valueType, value){
    getStore(storage).setItem(getKey(storage), marshalValue(valueType, value));
}

function getStoreValue(storage, valueType){
    return unmarshalValue(valueType, getStore(storage).getItem(getKey(storage)));
}

function resolveStoreValue(resolveWith, valueType, value, storeValue){
    if (valueType === 'array'){
        switch(resolveWith) {
            case 'cached': return storeValue;
            case 'new': return value;
            default:  return  [...(new Set([...JSON.parse(storeValue), ...value]))];
        }
    } else {
        switch(resolveWith) {
            case 'cached': return storeValue;
            default: return value;
        }
    }
}

function validateStorage(storage){
    if (!storage.key){
        console.warn('No key for storage', storage);
        return false;
    }
    return true
}

export function resolveValue(value, obj){
    const storage = obj.storage;
    const valueType = obj.type || 'string';

    if (!validateStorage()){
        return value;
    }

    let storeValue = getStoreValue(storage, valueType);
    let result = resolveStoreValue(storage, valueType, value, storeValue);

    if (storeValue !== result) {
        setStoreValue(storage, valueType, result);
    }

    return result;
}