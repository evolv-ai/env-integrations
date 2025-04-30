
const evolv = window.evolv;

export function addDisplayName(objectType, key, name){
    evolv.client.getConfig('_display_names').then(displayNames=>{
        if (!displayNames) return;
        displayNames[objectType] = displayNames[objectType] || {};
        displayNames[objectType][key] = name;
    });
}
