const fs = require('fs');
const yaml = require('js-yaml');

const startRegion = '//#region Variant Name'
const endRegion = '//#endregion'

function processYaml(inputYamlFile, outputYamlFile){
  try {
    const parentId = 'web';
-
    console.info('reading yml', inputYamlFile)
    var yaml = loadYaml(inputYamlFile); 
    console.info('writing yml', outputYamlFile)

    Object.keys(yaml.web)
      .filter(isChildKey)
      .forEach(cKey=> processContext(yaml.web[cKey], `${parentId}.${cKey}`))

    saveYaml(yaml, outputYamlFile)
  } catch (e) {
    console.info('error:', e)
  }
}

function processContext(context, id){
    Object.keys(context)
        .filter(isChildKey)
        .forEach(cKey=> processVariable(context[cKey], `${id}.${cKey}`))
}

function processVariable(variable, id){
  variable._values.forEach((variant,i)=> 
    processVariant(
        variant, 
        (vid=>(vid ? `${id}.${vid}` : id))(variant._value?.id),
        i
    )
  )
}

function processVariant(variant, id, index){ 
    if (!variant._value.script) {
      if (index === 0) return;

      variant._value.script = `
      `;
    }

    const name = variant._display_name;
    variant._value.script = injectVariantName(variant._value.script, id, name)
}


function injectVariantName(script, id, name){
    let insertPosition = 0;
    if (script.includes(startRegion)){
        insertPosition = script.indexOf(startRegion);
        let endPosition = script.indexOf(endRegion, insertPosition);
        script = `${script.slice(0,insertPosition)}${script.slice(endPosition+endRegion.length)}`;
    }
    return `${script.slice(0,insertPosition)}${startRegion}
client.addDisplayName?.('variants', '${id}', '${name}');
${endRegion}

${script.slice(insertPosition)}
`;
}

function loadYaml(yamlPath){
    var ymlData = fs.readFileSync(yamlPath, 'utf-8')
    return yaml.load(ymlData);
} 

function saveYaml(yamlModel, yamlPath) {
    const newYmlContent = yaml.dump(yamlModel)
    fs.writeFileSync(yamlPath, newYmlContent)
}

function isChildKey(cKey){
    return !/^_/.test(cKey)
}

module.exports = {
    processYaml
}
