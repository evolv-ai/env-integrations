import {initializeCatalyst} from '../src/catalyst.js'

var catalyst = initializeCatalyst();

window.evolv = window.evolv || {} ;

window.evolv.catalyst = catalyst;
window.evolv.renderRule = catalyst;
