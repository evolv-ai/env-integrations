import {processAnalytics} from '../src/analytics.js'
import data from './testData.json'
//import data from './data.json'

setTimeout(()=>processAnalytics(data),100);
