
import {html} from './template.js';

function processConfig(config){
    //TODO: support different bindings via config

    window.html = html;
}

module.exports = processConfig;

