import {processConfig} from '../src/catalyst.js'
import data from './data.json'
import {invokeIntegration} from '../../core/harnessActivation.js'
invokeIntegration(() => processConfig(data));