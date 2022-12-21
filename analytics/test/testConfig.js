import {processAnalytics} from '../src/analytics.js'
//import data from './testdata.json'
import data from './analytics-integration-config.json'

setTimeout(()=>processAnalytics(data),100);
