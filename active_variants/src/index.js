
import {addDisplayName} from './displayNames.js'
import {getActiveExperimentData} from './activeExperiment.js';

const evolv = window.evolv;

// to be used to inject variant display names
evolv.client.addDisplayName = addDisplayName;

// to be used to collect data
evolv.client.getActiveExperimentData = getActiveExperimentData;


function processConfig(config){

}

module.exports = processConfig;
