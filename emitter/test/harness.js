import {processConfig} from '../src/emitter.js'
import data from './data.json'
import {invokeIntegration} from '../../core/harnessActivation.js'

invokeIntegration(() => processConfig(data));
