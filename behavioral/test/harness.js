import {setupBehaviors} from '../src/behavioral.js'
import data from './data.json'
import {invokeIntegration} from '../../core/harnessActivation.js'

invokeIntegration(() => setupBehaviors(data));
